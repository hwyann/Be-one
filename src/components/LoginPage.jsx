import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_EMAIL = 'jessica@bekindlabs.com'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (email !== ALLOWED_EMAIL) {
      setError('This email is not authorized.')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>A magic link has been sent to {email}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit">Send magic link</button>
    </form>
  )
}
