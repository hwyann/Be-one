import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

// #B6 — key_results.objective_id had a leftover NOT NULL constraint from before
// individual_objective_id existed, so every individual Key Result insert
// (objective_id: null, individual_objective_id: <uuid>) violated it (23502).
// This asserts a migration exists that relaxes the constraint, matching the
// app-level guard in useKrMutation.create (exactly one of objective_id /
// individual_objective_id is ever set intentionally).

const MIGRATIONS_DIR = path.resolve(__dirname, '../../supabase/migrations')

function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'))
}

function findMigrationContaining(pattern) {
  return migrationFiles()
    .map(f => ({ file: f, sql: readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8') }))
    .find(({ sql }) => pattern.test(sql))
}

describe('B6 — key_results.objective_id nullable migration', () => {
  it('adds a migration that drops the NOT NULL constraint on key_results.objective_id', () => {
    const match = findMigrationContaining(
      /ALTER\s+TABLE\s+key_results\s+ALTER\s+COLUMN\s+objective_id\s+DROP\s+NOT\s+NULL/i
    )
    expect(match).toBeTruthy()
  })

  it('does not edit the already-applied 0002 migration', () => {
    const original = readFileSync(
      path.join(MIGRATIONS_DIR, '0002_key_results_individual_objective.sql'),
      'utf8'
    )
    expect(original.trim()).toBe(
      'ALTER TABLE key_results\nADD COLUMN individual_objective_id uuid REFERENCES individual_objectives(id);'
    )
  })
})
