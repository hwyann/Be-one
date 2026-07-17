// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.5'
import {
  buildPrompt,
  formatCheckInLines,
  hasSufficientData,
  isCacheFresh,
} from './logic.js'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 200
const ANTHROPIC_VERSION = '2023-06-01'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405)
  }

  let body: { individual_objective_id?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const objectiveId = body.individual_objective_id
  if (!objectiveId) {
    return json({ error: 'individual_objective_id required' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: objective, error: objErr } = await supabase
    .from('individual_objectives')
    .select('title')
    .eq('id', objectiveId)
    .single()
  if (objErr || !objective) {
    return json({ error: 'Objective not found' }, 404)
  }

  const { data: checkIns, error: ciErr } = await supabase
    .from('check_ins')
    .select('status, note, plan_next, created_at')
    .eq('individual_objective_id', objectiveId)
    .order('created_at', { ascending: true })
  if (ciErr) {
    return json({ error: ciErr.message }, 500)
  }

  const count = checkIns?.length ?? 0
  if (!hasSufficientData(count)) {
    return json({ status: 'insufficient_data', message: 'Need at least 3 check-ins to summarize.' })
  }

  const { data: cached } = await supabase
    .from('kr_summaries')
    .select('summary_text, based_on_check_in_count, generated_at')
    .eq('individual_objective_id', objectiveId)
    .maybeSingle()

  if (cached && isCacheFresh(cached, count, Date.now())) {
    return json({
      summary_text: cached.summary_text,
      based_on_check_in_count: count,
      cached: true,
    })
  }

  const prompt = buildPrompt(objective.title, formatCheckInLines(checkIns as any[]))
  const summaryText = await callAnthropic(prompt)
  if (!summaryText) {
    return json({ error: 'Empty response from Anthropic' }, 502)
  }

  const { error: upsertErr } = await supabase
    .from('kr_summaries')
    .upsert(
      {
        individual_objective_id: objectiveId,
        summary_text: summaryText,
        based_on_check_in_count: count,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'individual_objective_id' },
    )
  if (upsertErr) {
    return json({ error: upsertErr.message }, 500)
  }

  return json({
    summary_text: summaryText,
    based_on_check_in_count: count,
    cached: false,
  })
})

async function callAnthropic(prompt: string): Promise<string | null> {
  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`Anthropic API error ${resp.status}: ${errText}`)
  }
  const data = await resp.json()
  const text = data?.content?.[0]?.text
  return typeof text === 'string' ? text.trim() : null
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders },
  })
}
