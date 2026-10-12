import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const roles = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'STAFF', label: 'Mess Staff' },
  { value: 'ADMIN', label: 'Warden / Admin' },
]

export default function RegisterView({ onCancel, onSuccess }) {
  const { register } = useAuth()
  const [role, setRole] = useState('STUDENT')
  const [form, setForm] = useState({
    fullName: '',
    institutionalId: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    roomNumber: '',
    hostelBlock: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const fields = Object.fromEntries(Object.entries(form).filter(([key]) => key !== 'confirmPassword'))
      const registration = { ...fields, role }
      if (role !== 'STUDENT') {
        delete registration.roomNumber
        delete registration.hostelBlock
      }
      await register(registration)
      onSuccess()
    } catch (requestError) {
      setError(requestError.message || 'Registration could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="register-view">
      <div className="login-heading">
        <div className="eyebrow">CREATE AN ACCOUNT</div>
        <h2>Register</h2>
        <p>Enter your institutional details to request portal access.</p>
      </div>
      <form className="register-form" onSubmit={submit}>
        <div className="register-role-select" role="group" aria-label="Registration role">
          {roles.map((item) => (
            <button className={role === item.value ? 'selected' : ''} key={item.value} type="button" onClick={() => setRole(item.value)}>{item.label}</button>
          ))}
        </div>
        <div className="register-fields">
          <label className="register-field wide"><span>Full Name</span><input name="fullName" value={form.fullName} onChange={update} autoComplete="name" maxLength={120} required /></label>
          <label className="register-field wide"><span>Institutional ID / Roll No / GR Number</span><input name="institutionalId" value={form.institutionalId} onChange={update} autoComplete="username" maxLength={80} required /></label>
          <label className="register-field"><span>Email Address</span><input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label className="register-field"><span>Phone Number</span><input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={update} autoComplete="tel" maxLength={24} required /></label>
          {role === 'STUDENT' && (
            <>
              <label className="register-field"><span>Room Number <small>Optional</small></span><input name="roomNumber" value={form.roomNumber} onChange={update} maxLength={24} /></label>
              <label className="register-field"><span>Hostel Block <small>Optional</small></span><input name="hostelBlock" value={form.hostelBlock} onChange={update} maxLength={60} /></label>
            </>
          )}
          <label className="register-field"><span>Password</span><input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength={8} required /></label>
          <label className="register-field"><span>Confirm Password</span><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" minLength={8} required /></label>
        </div>
        <p className="registration-note">Account roles are subject to institutional verification and backend authorization.</p>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="btn btn-primary auth-button" type="submit" disabled={submitting}>{submitting ? 'Submitting registration…' : 'Create Account'}</button>
      </form>
      <div className="register-signin">Already registered? <button className="text-link" type="button" onClick={onCancel}>Back to sign in</button></div>
    </div>
  )
}
