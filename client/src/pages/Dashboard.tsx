import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

interface Client {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
}

interface Invoice {
  id: number
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
  issueDate: string
  dueDate: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  client: Client
  items: any[]
}

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  PAID:    { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', label: 'Paid'    },
  SENT:    { bg: '#f0f9ff', color: '#0369a1', dot: '#38bdf8', label: 'Sent'    },
  OVERDUE: { bg: '#fff1f2', color: '#be123c', dot: '#fb7185', label: 'Overdue' },
  DRAFT:   { bg: '#f4f4f5', color: '#52525b', dot: '#a1a1aa', label: 'Draft'   },
}

const useCountUp = (target: number, duration = 900) => {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    let frame: number
    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/invoices')
        setInvoices(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalEarned   = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const totalPending  = invoices.filter((i) => i.status === 'SENT').reduce((s, i) => s + i.total, 0)
  const totalOverdue  = invoices.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0)
  const totalClients  = [...new Set(invoices.map((i) => i.client?.id))].length

  const animatedEarned  = useCountUp(totalEarned)
  const animatedPending = useCountUp(totalPending)
  const animatedOverdue = useCountUp(totalOverdue)
  const animatedClients = useCountUp(totalClients, 700)

  const stats = [
    {
      label: 'Total Earned',
      value: `$${Math.round(animatedEarned).toLocaleString()}`,
      sub: `${invoices.filter((i) => i.status === 'PAID').length} paid invoices`,
      accent: '#15803d',
      accentBg: '#f0fdf4',
      icon: '↑',
    },
    {
      label: 'Awaiting Payment',
      value: `$${Math.round(animatedPending).toLocaleString()}`,
      sub: `${invoices.filter((i) => i.status === 'SENT').length} sent invoices`,
      accent: '#0369a1',
      accentBg: '#f0f9ff',
      icon: '◷',
    },
    {
      label: 'Overdue',
      value: `$${Math.round(animatedOverdue).toLocaleString()}`,
      sub: `${invoices.filter((i) => i.status === 'OVERDUE').length} overdue invoices`,
      accent: '#be123c',
      accentBg: '#fff1f2',
      icon: '!',
    },
    {
      label: 'Total Clients',
      value: `${Math.round(animatedClients)}`,
      sub: 'unique clients',
      accent: '#6366f1',
      accentBg: '#eef2ff',
      icon: '◈',
    },
  ]

  const recent = invoices.slice(0, 5)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }

        .db-header  { animation: fadeUp 0.4s ease both; }
        .db-actions { animation: fadeUp 0.4s ease both; animation-delay: 0.05s; }

        .stat-card {
          animation: fadeUp 0.45s ease both;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07) !important;
        }

        .invoice-row {
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .invoice-row:hover { background: #fafafa !important; }

        .table-section { animation: fadeUp 0.45s ease both; animation-delay: 0.18s; }

        .skeleton {
          background: linear-gradient(90deg, #f4f4f5 0px, #e8e8ec 200px, #f4f4f5 400px);
          background-size: 400px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 5px;
        }

        .empty-float { animation: floatSlow 3s ease-in-out infinite; }

        .new-invoice-btn {
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .new-invoice-btn:hover {
          background: #4f46e5 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99,102,241,0.35) !important;
        }

        .view-all {
          transition: color 0.15s ease;
        }
        .view-all:hover { color: #4f46e5 !important; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
      `}</style>

      {/* ── Page header ── */}
      <div className="db-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            Overview
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.6px', margin: 0 }}>
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <button
          className="new-invoice-btn"
          onClick={() => navigate('/invoices/create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 18px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
          }}
        >
          <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> New Invoice
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4"
        style={{ gap: 12, marginBottom: 28 }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="stat-card"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '18px 20px',
              border: '1px solid #e4e4e7',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              animationDelay: `${i * 0.07}s`,
              borderLeft: `3px solid ${s.accent}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Faint accent wash */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 56, height: 56, borderRadius: '0 12px 0 56px',
              background: s.accentBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 14, color: s.accent, fontWeight: 800 }}>{s.icon}</span>
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              {s.label}
            </p>
            <p className="text-xl sm:text-2xl" style={{ fontWeight: 800, color: '#18181b', letterSpacing: '-0.8px', marginBottom: 4 }}>
              {s.value}
            </p>
            <p className="hidden sm:block" style={{ fontSize: 11, color: '#a1a1aa' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Recent invoices ── */}
      <div
        className="table-section"
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #e4e4e7',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Table header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 20px',
          borderBottom: '1px solid #f0f0f5',
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#18181b', letterSpacing: '-0.3px', margin: 0 }}>
              Recent Invoices
            </h2>
            <p className="hidden sm:block" style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
              Last {Math.min(recent.length, 5)} invoices
            </p>
          </div>
          <a
            href="/invoices"
            className="view-all"
            style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textDecoration: 'none' }}
          >
            View all →
          </a>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="skeleton" style={{ width: 80, height: 12 }} />
                <div className="skeleton" style={{ flex: 1, height: 12, maxWidth: 140 }} />
                <div className="skeleton" style={{ width: 60, height: 12 }} />
                <div className="skeleton" style={{ width: 64, height: 20, borderRadius: 99 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && recent.length === 0 && (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div className="empty-float" style={{ fontSize: 40, marginBottom: 12, display: 'inline-block' }}>🧾</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>No invoices yet</p>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 20 }}>Create your first invoice to get started</p>
            <button
              className="new-invoice-btn"
              onClick={() => navigate('/invoices/create')}
              style={{
                padding: '9px 18px',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              + New Invoice
            </button>
          </div>
        )}

        {/* Desktop table */}
        {!loading && recent.length > 0 && (
          <>
            <div className="hidden md:block">
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px 120px 90px',
                padding: '9px 20px',
                background: '#fafafa',
                borderBottom: '1px solid #f0f0f5',
              }}>
                {['Invoice #', 'Client', 'Amount', 'Due Date', 'Status'].map((col) => (
                  <span key={col} style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {col}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {recent.map((inv) => {
                const s = statusConfig[inv.status] || statusConfig.DRAFT
                return (
                  <div
                    key={inv.id}
                    className="invoice-row"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 100px 120px 90px',
                      padding: '13px 20px',
                      borderBottom: '1px solid #f4f4f5',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>
                      {inv.invoiceNumber}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', margin: 0 }}>{inv.client?.name}</p>
                      <p style={{ fontSize: 11, color: '#a1a1aa', margin: '2px 0 0' }}>
                        {inv.client?.company || inv.client?.email}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>
                      ${inv.total.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: '#71717a' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span
                      className="status-pill"
                      style={{ background: s.bg, color: s.color }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden">
              {recent.map((inv) => {
                const s = statusConfig[inv.status] || statusConfig.DRAFT
                return (
                  <div
                    key={inv.id}
                    className="invoice-row"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f4f4f5',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>
                        {inv.invoiceNumber}
                      </span>
                      <span className="status-pill" style={{ background: s.bg, color: s.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
                        {s.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', margin: '0 0 4px' }}>
                      {inv.client?.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                        Due {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#18181b' }}>
                        ${inv.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard