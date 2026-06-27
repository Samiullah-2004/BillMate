import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

interface Client {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
}

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
)

const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c4c4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const AVATAR_COLORS = [
  ['#eef2ff', '#4f46e5'],
  ['#f0fdf4', '#15803d'],
  ['#fff1f2', '#be123c'],
  ['#fefce8', '#a16207'],
  ['#f0f9ff', '#0369a1'],
]

const Clients = () => {
  const [clients, setClients]       = useState<Client[]>([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [deleteId, setDeleteId]     = useState<number | null>(null)
  const [form, setForm]             = useState({ name: '', email: '', company: '', phone: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError]           = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients')
      setClients(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormLoading(true)
    try {
      await api.post('/clients', form)
      setForm({ name: '', email: '', company: '', phone: '' })
      setShowModal(false)
      fetchClients()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/clients/${id}`)
      setDeleteId(null)
      fetchClients()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot delete client')
    }
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '10px 13px',
    borderRadius: 9,
    fontSize: 13,
    border: `1.5px solid ${focusField === field ? '#6366f1' : '#e4e4e7'}`,
    backgroundColor: focusField === field ? '#fff' : '#fafafa',
    color: '#18181b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.18s ease',
    boxShadow: focusField === field ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
    fontFamily: 'inherit',
  })

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .client-card {
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .client-card:hover {
          box-shadow: 0 8px 24px rgba(99,102,241,0.1) !important;
          transform: translateY(-2px);
          border-color: #c7d2fe !important;
        }

        .add-client-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .add-client-btn:hover {
          background: #4f46e5 !important;
          box-shadow: 0 6px 18px rgba(99,102,241,0.38) !important;
          transform: translateY(-1px);
        }

        .delete-row-btn {
          transition: all 0.15s ease;
        }
        .delete-row-btn:hover {
          background: #fef2f2 !important;
          color: #dc2626 !important;
          border-color: #fecaca !important;
        }
        .delete-row-btn:hover svg { stroke: #dc2626; }

        .cancel-btn { transition: background 0.15s ease; }
        .cancel-btn:hover { background: #f4f4f8 !important; }

        .confirm-delete-btn { transition: background 0.15s ease; }
        .confirm-delete-btn:hover { background: #b91c1c !important; }

        .skeleton {
          background: linear-gradient(90deg, #f4f4f5 0px, #ececef 200px, #f4f4f5 400px);
          background-size: 400px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 14,
        marginBottom: 28, flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            Clients
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.6px', margin: 0 }}>
            Your Clients
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
            {loading ? '—' : `${clients.length} client${clients.length !== 1 ? 's' : ''} total`}
          </p>
        </div>

        <button
          className="add-client-btn"
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 17px', borderRadius: 9,
            background: '#6366f1', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
          }}
        >
          <PlusIcon /> Add Client
        </button>
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gap: 14 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              background: '#fff', borderRadius: 14, padding: 20,
              border: '1px solid #ebebef',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: '40%' }} />
                </div>
              </div>
              <div className="skeleton" style={{ height: 11, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 11, width: '50%' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && clients.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '72px 24px',
          background: '#fff', borderRadius: 14,
          border: '1px solid #ebebef',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 16, opacity: 0.5 }}><UsersIcon /></div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>No clients yet</p>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 24 }}>
            Add your first client to start creating invoices
          </p>
          <button
            className="add-client-btn"
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 17px', borderRadius: 9,
              background: '#6366f1', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            <PlusIcon /> Add Client
          </button>
        </div>
      )}

      {/* ── Client grid ── */}
      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" style={{ gap: 14 }}>
          {clients.map((client, i) => {
            const [avatarBg, avatarColor] = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div
                key={client.id}
                className="client-card"
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '18px 20px',
                  border: '1px solid #ebebef',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  animation: 'fadeUp 0.35s ease both',
                  animationDelay: `${i * 0.055}s`,
                }}
              >
                {/* Card top */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: avatarBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: avatarColor }}>
                      {getInitials(client.name)}
                    </span>
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: '#18181b', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {client.name}
                    </p>
                    {client.company && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ color: '#a1a1aa' }}><BuildingIcon /></span>
                        <p style={{
                          fontSize: 11.5, color: '#71717a', margin: 0,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {client.company}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f0f0f5', marginBottom: 12 }} />

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#a1a1aa', flexShrink: 0 }}><MailIcon /></span>
                    <span style={{
                      fontSize: 12, color: '#71717a',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {client.email}
                    </span>
                  </div>
                  {client.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#a1a1aa', flexShrink: 0 }}><PhoneIcon /></span>
                      <span style={{ fontSize: 12, color: '#71717a' }}>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  className="delete-row-btn"
                  onClick={() => setDeleteId(client.id)}
                  style={{
                    width: '100%', padding: '7px',
                    borderRadius: 8, border: '1px solid #ebebef',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: '#a1a1aa',
                    fontFamily: 'inherit',
                  }}
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Client Modal ── */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, animation: 'overlayIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 18,
              padding: '28px 28px 24px',
              width: '100%', maxWidth: 460,
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              animation: 'modalIn 0.22s ease',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#18181b', letterSpacing: '-0.4px', margin: 0 }}>
                  Add New Client
                </h2>
                <p style={{ fontSize: 12.5, color: '#a1a1aa', marginTop: 4 }}>
                  Fill in the details to add a new client
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #e4e4e7', background: '#fafafa',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#71717a', flexShrink: 0,
                }}
              >
                <XIcon />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 13px', borderRadius: 9,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: 12.5,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#52525b', marginBottom: 5 }}>
                    Full Name *
                  </label>
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="John Doe" required
                    onFocus={() => setFocusField('name')}
                    onBlur={() => setFocusField(null)}
                    style={inputStyle('name')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#52525b', marginBottom: 5 }}>
                    Email *
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="john@example.com" required
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    style={inputStyle('email')}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#52525b', marginBottom: 5 }}>
                    Company
                  </label>
                  <input
                    name="company" value={form.company} onChange={handleChange}
                    placeholder="Acme Inc."
                    onFocus={() => setFocusField('company')}
                    onBlur={() => setFocusField(null)}
                    style={inputStyle('company')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#52525b', marginBottom: 5 }}>
                    Phone
                  </label>
                  <input
                    name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+92 300 0000000"
                    onFocus={() => setFocusField('phone')}
                    onBlur={() => setFocusField(null)}
                    style={inputStyle('phone')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px',
                    borderRadius: 9, border: '1px solid #e4e4e7',
                    background: '#fff', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#71717a',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    flex: 2, padding: '11px',
                    borderRadius: 9, border: 'none',
                    background: formLoading ? '#a5b4fc' : '#6366f1',
                    color: '#fff', cursor: formLoading ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                    boxShadow: formLoading ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {formLoading ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId !== null && (
        <div
          onClick={() => setDeleteId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, animation: 'overlayIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 18,
              padding: '28px 28px 24px',
              width: '100%', maxWidth: 360,
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              animation: 'modalIn 0.22s ease',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <TrashIcon />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Delete Client?
            </h2>
            <p style={{ fontSize: 13, color: '#71717a', marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently remove the client and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 9, border: '1px solid #e4e4e7',
                  background: '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#71717a',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 9, border: 'none',
                  background: '#dc2626', color: '#fff',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'background 0.15s ease',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Clients