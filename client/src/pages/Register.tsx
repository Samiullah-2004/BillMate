import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import RotatingText from '../components/RotatingText'
import SideRays from '../components/SideRays'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between"
        style={{
          height: '100vh',
          backgroundColor: '#1a1a2e',
          position: 'relative',
          overflow: 'hidden',
          padding: '36px 44px',
        }}
      >
        <SideRays
          speed={1.8}
          rayColor1="#6366f1"
          rayColor2="#a855f7"
          intensity={3.0}
          spread={2.5}
          origin="top-right"
          tilt={5}
          saturation={1.4}
          blend={0.6}
          falloff={1.8}
          opacity={0.5}
        />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(26,26,46,0.5) 0%, rgba(26,26,46,0.2) 100%)',
          zIndex: 2,
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '9px 16px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 26, height: 26, backgroundColor: '#6366f1',
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 13 }}>B</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>BillMate</span>
          </div>
        </div>

        {/* Center text */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            backgroundColor: 'rgba(99,102,241,0.25)',
            padding: '5px 14px', borderRadius: 20, marginBottom: 20,
            border: '1px solid rgba(99,102,241,0.4)',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#818cf8' }} />
            <span style={{ color: '#a5b4fc', fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Join BillMate Today
            </span>
          </div>

          <h2 style={{
            color: '#fff', fontSize: 34, fontWeight: 800,
            lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.5px',
          }}>
            Start getting<br />paid like a
          </h2>

          <div style={{ minHeight: 48, marginBottom: 20 }}>
            <RotatingText
              texts={['Professional.', 'Freelancer.', 'Business.', 'Boss.']}
              mainClassName="overflow-hidden"
              staggerFrom="first"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              staggerDuration={0.022}
              splitLevelClassName="overflow-hidden"
              transition={{ type: 'spring', damping: 30, stiffness: 380 }}
              rotationInterval={2600}
              splitBy="characters"
              auto
              loop
              style={{ color: '#818cf8', fontSize: 34, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}
            />
          </div>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Set up your account in seconds. No credit card required. Start sending invoices immediately.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 5 }}>
          {[
            { label: 'Setup Time', value: '< 1 min' },
            { label: 'Always Free', value: '$0' },
            { label: 'Invoices', value: 'Unlimited' },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1, borderRadius: 12, padding: '12px 14px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-10 xl:px-16"
        style={{
          height: '100vh',
          backgroundColor: '#f8f8fb',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Floating blobs */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          animation: 'floatA 9s ease-in-out infinite', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: -50, left: -50,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          animation: 'floatB 11s ease-in-out infinite', zIndex: 0,
        }} />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-6" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 32, height: 32, backgroundColor: '#6366f1',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>B</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#18181b' }}>BillMate</span>
        </div>

        {/* Form card */}
        <div
          className="w-full"
          style={{
            maxWidth: 420,
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.03), 0 16px 48px rgba(0,0,0,0.07)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative', zIndex: 2,
            animation: 'fadeUp 0.45s ease forwards',
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: '#eef2ff', padding: '4px 12px',
              borderRadius: 20, marginBottom: 12,
              border: '1px solid #c7d2fe',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <span style={{ color: '#4f46e5', fontSize: 10, fontWeight: 700, letterSpacing: '0.8px' }}>
                CREATE ACCOUNT
              </span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#18181b', letterSpacing: '-0.5px', marginBottom: 4 }}>
              Get started free
            </h2>
            <p style={{ color: '#71717a', fontSize: 13 }}>Create your BillMate account in seconds</p>
          </div>

          {error && (
            <div style={{
              marginBottom: 14, padding: '11px 14px', borderRadius: 10,
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Sami Ullah" required
                onFocus={() => setFocusField('name')}
                onBlur={() => setFocusField(null)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
                  border: focusField === 'name' ? '1.5px solid #6366f1' : '1.5px solid #e4e4e7',
                  backgroundColor: '#fafafa', color: '#18181b', outline: 'none',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  boxShadow: focusField === 'name' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
                  border: focusField === 'email' ? '1.5px solid #6366f1' : '1.5px solid #e4e4e7',
                  backgroundColor: '#fafafa', color: '#18181b', outline: 'none',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  boxShadow: focusField === 'email' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3f3f46', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 13,
                  border: focusField === 'password' ? '1.5px solid #6366f1' : '1.5px solid #e4e4e7',
                  backgroundColor: '#fafafa', color: '#18181b', outline: 'none',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  boxShadow: focusField === 'password' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#f4f4f5' }} />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#f4f4f5' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#71717a' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div
          className="flex items-center gap-4 sm:gap-6 mt-5 flex-wrap justify-center"
          style={{ position: 'relative', zIndex: 2 }}
        >
          {['🔒 SSL Secured', '⚡ Always Fast', '✦ Free to Start'].map(item => (
            <span key={item} style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Register