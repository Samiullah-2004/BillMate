import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'

interface Client {
  id: number
  name: string
  email: string
  company?: string
}

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

const emptyItem: LineItem = { description: '', quantity: 1, unitPrice: 0 }

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)

// MOVED OUTSIDE: Prevents components from completely remounting on every keystroke
const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#52525b', marginBottom: 5 }}>
    {children}
  </label>
)

// MOVED OUTSIDE
const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '20px 22px',
    border: '1px solid #ebebef', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    ...style,
  }}>
    {children}
  </div>
)

// MOVED OUTSIDE
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: 13.5, fontWeight: 800, color: '#18181b', margin: '0 0 16px', letterSpacing: '-0.2px' }}>
    {children}
  </h2>
)

const CreateInvoice = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientId, setClientId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients')
        setClients(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setClientsLoading(false)
      }
    }
    fetchClients()
  }, [])

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  const addItem = () => setItems([...items, { ...emptyItem }])
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)) }

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0)
  const total = subtotal + (Number(amount) || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!clientId) return setError('Please select a client')
    if (!dueDate) return setError('Please select a due date')
    const validItems = items.filter((it) => it.description.trim() && it.quantity > 0)
    if (!validItems.length) return setError('Please add at least one valid line item')

    setSubmitting(true)
    try {
      await api.post('/invoices', {
        clientId: Number(clientId),
        dueDate,
        notes: notes || undefined,
        tax: Number(amount) || 0,
        items: validItems.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      })
      navigate('/invoices')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase = (field: string): React.CSSProperties => ({
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
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .line-item-row {
          animation: fadeUp 0.22s ease both;
          transition: box-shadow 0.15s ease;
        }

        .remove-item-btn {
          transition: all 0.15s ease;
        }
        .remove-item-btn:hover:not(:disabled) {
          background: #fef2f2 !important;
          border-color: #fecaca !important;
          color: #dc2626 !important;
        }
        .remove-item-btn:hover:not(:disabled) svg { stroke: #dc2626; }

        .add-item-btn {
          transition: all 0.15s ease;
        }
        .add-item-btn:hover {
          background: #e0e7ff !important;
          border-color: #a5b4fc !important;
        }

        .submit-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .submit-btn:not(:disabled):hover {
          background: #4f46e5 !important;
          box-shadow: 0 8px 20px rgba(99,102,241,0.38) !important;
          transform: translateY(-1px);
        }

        .cancel-btn {
          transition: background 0.15s ease;
        }
        .cancel-btn:hover {
          background: #f4f4f8 !important;
        }

        textarea { resize: vertical; }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/invoices')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 9,
            border: '1.5px solid #e4e4e7', background: '#fff',
            cursor: 'pointer', color: '#71717a', flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.color = '#71717a' }}
        >
          <ArrowIcon />
        </button>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2 }}>
            Invoices
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#18181b', letterSpacing: '-0.5px', margin: 0 }}>
            Create Invoice
          </h1>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          marginBottom: 18, padding: '11px 14px', borderRadius: 9,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 12.5, fontWeight: 500,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 18, alignItems: 'start' }}>

          {/* ── LEFT — 2/3 ── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Invoice details */}
            <Card>
              <SectionTitle>Invoice Details</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 13 }}>
                <div>
                  <Label>Client *</Label>
                  {clientsLoading ? (
                    <div style={{
                      padding: '10px 13px', borderRadius: 9, fontSize: 13,
                      border: '1.5px solid #e4e4e7', background: '#fafafa', color: '#a1a1aa',
                    }}>
                      Loading clients...
                    </div>
                  ) : clients.length === 0 ? (
                    <div style={{
                      padding: '10px 13px', borderRadius: 9, fontSize: 12.5,
                      border: '1.5px solid #e4e4e7', background: '#fafafa', color: '#71717a',
                    }}>
                      No clients yet.{' '}
                      <span
                        onClick={() => navigate('/clients')}
                        style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Add a client first →
                      </span>
                    </div>
                  ) : (
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      onFocus={() => setFocusField('client')}
                      onBlur={() => setFocusField(null)}
                      required
                      style={inputBase('client')}
                    >
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}{c.company ? ` — ${c.company}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <Label>Due Date *</Label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onFocus={() => setFocusField('dueDate')}
                    onBlur={() => setFocusField(null)}
                    required
                    style={inputBase('dueDate')}
                  />
                </div>
              </div>
            </Card>

            {/* Line items */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <SectionTitle>Line Items</SectionTitle>
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItem}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    border: '1.5px solid #c7d2fe', background: '#eef2ff',
                    color: '#4f46e5', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  }}
                >
                  <PlusIcon /> Add Item
                </button>
              </div>

              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 72px 100px 34px',
                gap: 8, marginBottom: 8, padding: '0 2px',
              }}>
                {['Description', 'Qty', 'Unit Price', ''].map((h) => (
                  <span key={h} style={{ fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="line-item-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 72px 100px 34px',
                      gap: 8, alignItems: 'center',
                      animationDelay: `${index * 0.04}s`,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="e.g. Web development"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      onFocus={() => setFocusField(`desc-${index}`)}
                      onBlur={() => setFocusField(null)}
                      style={inputBase(`desc-${index}`)}
                    />
                    <input
                      type="number"
                      placeholder="1"
                      min={0}
                      step="any"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={() => setFocusField(`qty-${index}`)}
                      onBlur={() => setFocusField(null)}
                      style={{ ...inputBase(`qty-${index}`), textAlign: 'center' }}
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      min={0}
                      step="any"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value === '' ? 0 : Number(e.target.value))}
                      onFocus={() => setFocusField(`price-${index}`)}
                      onBlur={() => setFocusField(null)}
                      style={{ ...inputBase(`price-${index}`), textAlign: 'right' }}
                    />
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      style={{
                        width: 34, height: 38, borderRadius: 8,
                        border: '1.5px solid #e4e4e7', background: '#fafafa',
                        cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        color: items.length === 1 ? '#d4d4d8' : '#a1a1aa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card>
              <Label>Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={() => setFocusField('notes')}
                onBlur={() => setFocusField(null)}
                placeholder="Payment terms, thank you note, bank details..."
                rows={3}
                style={{ ...inputBase('notes'), resize: 'vertical' }}
              />
            </Card>
          </div>

          {/* ── RIGHT — Summary ── */}
          <div>
            <Card style={{ position: 'sticky', top: 20 }}>
              <SectionTitle>Summary</SectionTitle>

              {/* Line item totals
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 14 }}>
                {items.filter((it) => it.description).map((it, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid #f4f4f5',
                  }}>
                    <span style={{ fontSize: 12, color: '#71717a', flex: 1, paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.description || `Item ${i + 1}`}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#18181b', flexShrink: 0 }}>
                      ${((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div> */}

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#71717a' }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>${subtotal.toFixed(2)}</span>
              </div>

              {/* Extra amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#71717a' }}>Tax</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={amount || ''}
                  onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  onFocus={() => setFocusField('amount')}
                  onBlur={() => setFocusField(null)}
                  placeholder="0.00"
                  style={{
                    width: 90, padding: '6px 10px', borderRadius: 8, fontSize: 13,
                    border: `1.5px solid ${focusField === 'amount' ? '#6366f1' : '#e4e4e7'}`,
                    background: '#fafafa', color: '#18181b', outline: 'none',
                    textAlign: 'right', fontFamily: 'inherit',
                    boxShadow: focusField === 'amount' ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                />
              </div>

              {/* Total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: 10,
                background: '#eef2ff', marginBottom: 18,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.8px' }}>
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* CTA */}
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
                style={{
                  width: '100%', padding: '12px',
                  borderRadius: 9, border: 'none',
                  background: submitting ? '#a5b4fc' : '#6366f1',
                  color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
                  boxShadow: submitting ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
                  marginBottom: 9,
                }}
              >
                {submitting ? 'Creating Invoice...' : 'Create Invoice'}
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/invoices')}
                style={{
                  width: '100%', padding: '11px',
                  borderRadius: 9, border: '1.5px solid #e4e4e7',
                  background: '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#71717a',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </Card>
          </div>
        </div>
      </form>
    </Layout>
  )
}

export default CreateInvoice