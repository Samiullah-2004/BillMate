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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)

const filters = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'] as const
type Filter = typeof filters[number]

const Invoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices]       = useState<Invoice[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeFilter, setActiveFilter] = useState<Filter>('All')

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices')
        setInvoices(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const filtered = invoices.filter((inv) =>
    activeFilter === 'All' ? true : inv.status === activeFilter.toUpperCase()
  )

  const countFor = (f: Filter) =>
    f === 'All' ? invoices.length : invoices.filter((inv) => inv.status === f.toUpperCase()).length

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .invoice-row {
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .invoice-row:hover { background: #fafafa !important; }

        .filter-tab {
          transition: all 0.15s ease;
        }
        .filter-tab:hover:not(.active-tab) {
          border-color: #d4d4d8 !important;
          color: #3f3f46 !important;
        }

        .new-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .new-btn:hover {
          background: #4f46e5 !important;
          box-shadow: 0 6px 18px rgba(99,102,241,0.38) !important;
          transform: translateY(-1px);
        }

        .empty-new-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .empty-new-btn:hover {
          background: #4f46e5 !important;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
        }

        .skeleton {
          background: linear-gradient(90deg, #f4f4f5 0px, #ececef 200px, #f4f4f5 400px);
          background-size: 400px 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 5px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 14,
        marginBottom: 24, flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            Invoices
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#18181b', letterSpacing: '-0.6px', margin: 0 }}>
            All Invoices
          </h1>
          <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
            {loading ? '—' : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} total`}
          </p>
        </div>

        <button
          className="new-btn"
          onClick={() => navigate('/invoices/create')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 17px', borderRadius: 9,
            background: '#6366f1', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          <PlusIcon /> New Invoice
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
        {filters.map((f) => {
          const isActive = activeFilter === f
          const count    = countFor(f)
          return (
            <button
              key={f}
              className={`filter-tab${isActive ? ' active-tab' : ''}`}
              onClick={() => setActiveFilter(f)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 13px', borderRadius: 8,
                border: `1.5px solid ${isActive ? '#6366f1' : '#e4e4e7'}`,
                background: isActive ? '#eef2ff' : '#fff',
                color: isActive ? '#4f46e5' : '#71717a',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >
              {f}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 17, height: 17, padding: '0 4px',
                borderRadius: 99, fontSize: 10.5, fontWeight: 700,
                background: isActive ? '#6366f1' : '#f0f0f5',
                color: isActive ? '#fff' : '#a1a1aa',
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #ebebef',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid #f4f4f5' }}>
                <div className="skeleton" style={{ width: 80, height: 12 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 12, width: '45%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: '30%' }} />
                </div>
                <div className="skeleton" style={{ width: 60, height: 12 }} />
                <div className="skeleton" style={{ width: 70, height: 12 }} />
                <div className="skeleton" style={{ width: 64, height: 20, borderRadius: 99 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', marginBottom: 14, opacity: 0.6 }}><EmptyIcon /></div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 6 }}>
              {activeFilter === 'All' ? 'No invoices yet' : `No ${activeFilter.toLowerCase()} invoices`}
            </p>
            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 22 }}>
              {activeFilter === 'All'
                ? 'Create your first invoice to get started'
                : 'Try switching to a different filter'}
            </p>
            {activeFilter === 'All' && (
              <button
                className="empty-new-btn"
                onClick={() => navigate('/invoices/create')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 9,
                  background: '#6366f1', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  boxShadow: '0 2px 10px rgba(99,102,241,0.25)',
                }}
              >
                <PlusIcon /> New Invoice
              </button>
            )}
          </div>
        )}

        {/* Desktop table */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="hidden md:block">
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 100px 100px 100px 90px',
                padding: '9px 20px',
                background: '#fafafa',
                borderBottom: '1px solid #ebebef',
              }}>
                {['Invoice #', 'Client', 'Amount', 'Issued', 'Due', 'Status'].map((col) => (
                  <span key={col} style={{
                    fontSize: 10, fontWeight: 700, color: '#a1a1aa',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                  }}>
                    {col}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((inv, i) => {
                const s = statusConfig[inv.status] || statusConfig.DRAFT
                return (
                  <div
                    key={inv.id}
                    className="invoice-row"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 100px 100px 100px 90px',
                      padding: '13px 20px',
                      borderBottom: '1px solid #f4f4f5',
                      alignItems: 'center',
                      animation: 'fadeUp 0.3s ease both',
                      animationDelay: `${i * 0.04}s`,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', fontFamily: 'monospace' }}>
                      {inv.invoiceNumber}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', margin: 0 }}>
                        {inv.client?.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#a1a1aa', margin: '2px 0 0' }}>
                        {inv.client?.company || inv.client?.email}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>
                      ${inv.total.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: '#71717a' }}>
                      {new Date(inv.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 12, color: '#71717a' }}>
                      {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="status-pill" style={{ background: s.bg, color: s.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden">
              {filtered.map((inv, i) => {
                const s = statusConfig[inv.status] || statusConfig.DRAFT
                return (
                  <div
                    key={inv.id}
                    className="invoice-row"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f4f4f5',
                      animation: 'fadeUp 0.3s ease both',
                      animationDelay: `${i * 0.04}s`,
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

export default Invoices