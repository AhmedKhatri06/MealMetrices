import { useState } from 'react'
import { ArrowDownRight, ArrowRight, CircleHelp, Eye, EyeOff, FlaskConical, Leaf, LockKeyhole, ShieldCheck, Utensils, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getRoleHome } from '../auth/roles'
import RegisterView from './RegisterView'

export default function LoginView() {
  const navigate = useNavigate()
  const { login, demoLogin } = useAuth()
  const [registering, setRegistering] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const submitLogin = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const session = await login({ institutionalId: identifier.trim(), password, rememberMe: remember })
      navigate(getRoleHome(session.user.role), { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to authenticate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const enterDemo = (role) => {
    setError('')
    const session = demoLogin(role)
    navigate(getRoleHome(session.user.role), { replace: true })
  }

  const registrationSucceeded = () => {
    setRegistering(false)
    setToast('Registration submitted successfully. Sign in after your account is approved.')
    window.setTimeout(() => setToast(''), 6000)
  }

  return (
    <main className="login-layout">
      <section className="login-hero">
        <div className="hero-texture" />
        <div className="hero-topline"><span className="hero-logo"><Utensils size={18} /></span><span>MEALMATRICES <b>MESS TRACK</b></span></div>
        <div className="hero-copy">
          <div className="secure-badge"><span className="pulse-dot" /> INSTITUTIONAL GATEWAY <span className="slash">//</span> SECURE AUTHENTICATION</div>
          <h1>Smarter meals.<br /><span>Less waste.</span></h1>
          <p className="hero-description">Hostel Mess Food Waste Management &amp; Intelligent Supply Chain ERP. Real-time consumption tracking, automated surplus redistribution, and role-based provisioning.</p>
          <div className="impact-card">
            <div className="impact-icon"><Leaf size={22} /></div>
            <div><div className="impact-value">1,240 <span>kg</span></div><p>of food waste mitigated this semester across campus dormitories through predictive headcount modeling and dynamic portioning.</p></div>
            <div className="impact-trend"><ArrowDownRight size={15} /> 18%</div>
          </div>
        </div>
        <div className="system-status"><span className="status-light" /> System Operational <span className="status-separator">|</span> Node: THM-MESS-01 <span className="status-separator">|</span> SSL 256-bit Encrypted</div>
        <div className="hero-grid-mark" />
      </section>
      <section className={`login-panel ${registering ? 'registering' : ''}`}>
        <div className="login-form-wrap">
          <div className="login-brand-mobile"><span className="brand-mark"><Utensils size={18} /></span> MealMatrices MessTrack</div>
          {registering ? <RegisterView onCancel={() => setRegistering(false)} onSuccess={registrationSucceeded} /> : (
            <>
              <div className="login-heading">
                <div className="eyebrow">WELCOME BACK</div>
                <h2>Portal Access</h2>
                <p>Sign in with your institutional account to continue.</p>
              </div>
              <form className="login-form" onSubmit={submitLogin}>
                <label className="form-label" htmlFor="institutional-id">Institutional ID / Roll Number</label>
                <div className="input-icon-wrap"><UserRound size={17} /><input id="institutional-id" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="e.g. 2024-BTECH-CE-042" required /></div>
                <div className="password-label-row"><label className="form-label" htmlFor="password">Password</label><span className="text-link" title="Contact your mess administrator to reset your password">Forgot Mess PIN?</span></div>
                <div className="input-icon-wrap"><LockKeyhole size={17} /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
                <label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember this workstation</span></label>
                {error && <div className="auth-error" role="alert">{error}</div>}
                <button className="btn btn-primary auth-button" type="submit" disabled={submitting}>{submitting ? 'Authenticating…' : <>Authenticate &amp; Enter Portal <ArrowRight size={17} /></>}</button>
              </form>
              <div className="demo-access">
                <div className="demo-access-heading"><span><FlaskConical size={15} /></span><div><strong>Just exploring?</strong><p>Open a demo portal without a backend account.</p></div></div>
                <div className="demo-role-buttons">
                  <button type="button" onClick={() => enterDemo('STUDENT')}>Student demo</button>
                  <button type="button" onClick={() => enterDemo('STAFF')}>Staff demo</button>
                  <button type="button" onClick={() => enterDemo('ADMIN')}>Admin demo</button>
                </div>
                <div className="demo-disclaimer">Demo data only · no backend connection or real account changes</div>
              </div>
              <div className="login-security"><ShieldCheck size={18} /><p>Protected by Role-Based Access Control (RBAC). Session activities are audited for compliance with hostel dining regulations.</p></div>
              <div className="login-help"><CircleHelp size={14} /> Having trouble signing in? <span className="text-link">Contact IT support</span></div>
              <div className="register-prompt">New to MealMatrices? <button type="button" className="text-link" onClick={() => { setError(''); setToast(''); setRegistering(true) }}>Register / New User</button></div>
            </>
          )}
        </div>
        <div className="login-panel-footer"><span>© 2026 MealMatrices MessTrack</span><span>Privacy <i /> Terms <i /> Help</span></div>
      </section>
      {toast && <div className="registration-toast" role="status"><ShieldCheck size={17} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification">×</button></div>}
    </main>
  )
}
