import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import Layout from '../components/Layout'
import api from '../api/axios'

interface Client {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
}

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
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
  items: InvoiceItem[]
}

const statusConfig: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  PAID: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e', label: 'Paid' },
  SENT: { bg: '#f0f9ff', color: '#0369a1', dot: '#38bdf8', label: 'Sent' },
  OVERDUE: { bg: '#fff1f2', color: '#be123c', dot: '#fb7185', label: 'Overdue' },
  DRAFT: { bg: '#f4f4f5', color: '#52525b', dot: '#a1a1aa', label: 'Draft' },
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const PrintIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const InvoiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`)
      setInvoice(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoice() }, [id])

  const updateStatus = async (status: string) => {
    if (!invoice) return
    setUpdating(true)
    try {
      const res = await api.put(`/invoices/${invoice.id}`, { status })
      setInvoice(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return
    setDeleting(true)
    try {
      await api.delete(`/invoices/${invoice.id}`)
      navigate('/invoices')
    } catch (err: any) {
      console.error(err)
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!invoice) return
    setDownloading(true)
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const margin = 48
      let y = 56

      // Brand
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(16)
      pdf.setTextColor(24, 24, 27)
      pdf.text('BillMate', margin, y)

      // Invoice number + status (right side)
      pdf.setFontSize(10)
      pdf.setTextColor(161, 161, 170)
      pdf.text('ISSUE DATE', pageW - margin, y - 6, { align: 'right' })
      pdf.setFontSize(11)
      pdf.setTextColor(24, 24, 27)
      pdf.text(
        new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        pageW - margin, y + 10, { align: 'right' }
      )
      pdf.setFontSize(10)
      pdf.setTextColor(161, 161, 170)
      pdf.text('DUE DATE', pageW - margin, y + 28, { align: 'right' })
      pdf.setFontSize(11)
      pdf.setTextColor(24, 24, 27)
      pdf.text(
        new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        pageW - margin, y + 44, { align: 'right' }
      )

      y += 38
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(24)
      pdf.setTextColor(24, 24, 27)
      pdf.text(invoice.invoiceNumber, margin, y)

      y += 22
      const s = statusConfig[invoice.status] || statusConfig.DRAFT
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(...hexToRgb(s.color))
      pdf.text(s.label.toUpperCase(), margin, y)

      // Billed to box
      y += 30
      pdf.setFillColor(250, 250, 250)
      pdf.roundedRect(margin, y, pageW - margin * 2, 90, 6, 6, 'F')
      let by = y + 22
      pdf.setFontSize(9)
      pdf.setTextColor(161, 161, 170)
      pdf.text('BILLED TO', margin + 16, by)
      by += 16
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(24, 24, 27)
      pdf.text(invoice.client.name, margin + 16, by)
      by += 15
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10.5)
      pdf.setTextColor(113, 113, 122)
      if (invoice.client.company) { pdf.text(invoice.client.company, margin + 16, by); by += 14 }
      pdf.text(invoice.client.email, margin + 16, by)
      by += invoice.client.phone ? 14 : 0
      if (invoice.client.phone) pdf.text(invoice.client.phone, margin + 16, by)

      y += 110

      // Table header
      const col2 = pageW - margin - 220
      const col3 = pageW - margin - 150
      const col4 = pageW - margin - 70

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(161, 161, 170)
      pdf.text('DESCRIPTION', margin, y)
      pdf.text('QTY', col2, y)
      pdf.text('UNIT PRICE', col3, y)
      pdf.text('AMOUNT', col4, y)
      y += 6
      pdf.setDrawColor(240, 240, 245)
      pdf.line(margin, y, pageW - margin, y)
      y += 18

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10.5)
      invoice.items.forEach((item) => {
        pdf.setTextColor(24, 24, 27)
        pdf.text(item.description, margin, y)
        pdf.setTextColor(113, 113, 122)
        pdf.text(String(item.quantity), col2, y)
        pdf.text(`$${item.unitPrice.toFixed(2)}`, col3, y)
        pdf.setTextColor(24, 24, 27)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`$${item.amount.toFixed(2)}`, col4, y)
        pdf.setFont('helvetica', 'normal')
        y += 16
        pdf.setDrawColor(244, 244, 245)
        pdf.line(margin, y - 6, pageW - margin, y - 6)
        y += 6
      })

      // Totals
      y += 16
      const totalsX = pageW - margin - 180
      pdf.setFontSize(10.5)
      pdf.setTextColor(113, 113, 122)
      pdf.text('Subtotal', totalsX, y)
      pdf.setTextColor(24, 24, 27)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`$${invoice.subtotal.toFixed(2)}`, pageW - margin, y, { align: 'right' })

      y += 18
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(113, 113, 122)
      pdf.text('Tax', totalsX, y)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(24, 24, 27)
      pdf.text(`$${invoice.tax.toFixed(2)}`, pageW - margin, y, { align: 'right' })

      y += 14
      pdf.setFillColor(238, 242, 255)
      pdf.roundedRect(totalsX - 14, y, pageW - margin - (totalsX - 14), 36, 8, 8, 'F')
      y += 23
      pdf.setFontSize(12)
      pdf.setTextColor(79, 70, 229)
      pdf.text('Total', totalsX, y)
      pdf.setFontSize(15)
      pdf.text(`$${invoice.total.toFixed(2)}`, pageW - margin, y, { align: 'right' })

      // Notes
      if (invoice.notes) {
        y += 40
        pdf.setDrawColor(240, 240, 245)
        pdf.line(margin, y, pageW - margin, y)
        y += 20
        pdf.setFontSize(9)
        pdf.setTextColor(161, 161, 170)
        pdf.text('NOTES', margin, y)
        y += 16
        pdf.setFontSize(10.5)
        pdf.setTextColor(113, 113, 122)
        const noteLines = pdf.splitTextToSize(invoice.notes, pageW - margin * 2)
        pdf.text(noteLines, margin, y)
      }

      pdf.save(`${invoice.invoiceNumber}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setDownloading(false)
    }
  }

  // add this helper above the component or in a utils file
  function hexToRgb(hex: string): [number, number, number] {
    const m = hex.replace('#', '').match(/.{1,2}/g)!
    return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)]
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <Layout>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, #f4f4f5 0px, #ececef 200px, #f4f4f5 400px);
            background-size: 400px 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            border-radius: 6px;
          }
        `}</style>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 28 }} />
          <div style={{ background: '#fff', borderRadius: 14, padding: '32px 28px', border: '1px solid #ebebef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div className="skeleton" style={{ height: 18, width: 140, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 24, width: 180, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 99 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: 120 }} />
              </div>
            </div>
            <div className="skeleton" style={{ height: 80, borderRadius: 10, marginBottom: 28 }} />
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #f4f4f5' }}>
                <div className="skeleton" style={{ flex: 1, height: 13 }} />
                <div className="skeleton" style={{ width: 40, height: 13 }} />
                <div className="skeleton" style={{ width: 70, height: 13 }} />
                <div className="skeleton" style={{ width: 70, height: 13 }} />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  /* ── Not found ── */
  if (!invoice) {
    return (
      <Layout>
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginBottom: 8 }}>Invoice not found</p>
          <Link to="/invoices" style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to invoices
          </Link>
        </div>
      </Layout>
    )
  }

  const s = statusConfig[invoice.status] || statusConfig.DRAFT

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

        .invoice-wrap { animation: fadeUp 0.35s ease both; }

        .action-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px;
          font-size: 12.5px; font-weight: 700; cursor: pointer;
          font-family: inherit; border: none;
          transition: all 0.15s ease;
        }

        .btn-sent   { background: #eef2ff; color: #4f46e5; border: 1.5px solid #c7d2fe !important; }
        .btn-sent:hover:not(:disabled) { background: #4f46e5; color: #fff; }
        .btn-sent:hover:not(:disabled) svg { stroke: #fff; }

        .btn-paid   { background: #f0fdf4; color: #15803d; border: 1.5px solid #bbf7d0 !important; }
        .btn-paid:hover:not(:disabled) { background: #15803d; color: #fff; }
        .btn-paid:hover:not(:disabled) svg { stroke: #fff; }

        .btn-download { background: #fff; color: #3f3f46; border: 1.5px solid #e4e4e7 !important; }
        .btn-download:hover:not(:disabled) { background: #f4f4f8; }

        .btn-print { background: #fff; color: #3f3f46; border: 1.5px solid #e4e4e7 !important; }
        .btn-print:hover { background: #f4f4f8; }

        .btn-delete { background: #fff1f2; color: #be123c; border: 1.5px solid #fecdd3 !important; }
        .btn-delete:hover { background: #be123c; color: #fff; }
        .btn-delete:hover svg { stroke: #fff; }

        .cancel-modal-btn { transition: background 0.15s ease; }
        .cancel-modal-btn:hover { background: #f4f4f8 !important; }

        .confirm-delete-btn { transition: background 0.15s ease; }
        .confirm-delete-btn:hover:not(:disabled) { background: #b91c1c !important; }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: #71717a;
          text-decoration: none; transition: color 0.15s ease;
        }
        .back-link:hover { color: #18181b; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          font-size: 11.5px; font-weight: 600;
        }

        @media print {
          .no-print { display: none !important; }
          .invoice-wrap { box-shadow: none !important; border: none !important; animation: none !important; }
        }
      `}</style>

      {/* ── Topbar ── */}
      <div
        className="no-print"
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 14,
          marginBottom: 22, flexWrap: 'wrap',
          maxWidth: 760, margin: '0 auto 22px',
        }}
      >
        <Link to="/invoices" className="back-link">
          <ArrowIcon /> Invoices
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {invoice.status === 'DRAFT' && (
            <button
              className="action-btn btn-sent"
              onClick={() => updateStatus('SENT')}
              disabled={updating}
            >
              <SendIcon /> Mark as Sent
            </button>
          )}
          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
            <button
              className="action-btn btn-paid"
              onClick={() => updateStatus('PAID')}
              disabled={updating}
            >
              <CheckIcon /> Mark as Paid
            </button>
          )}
          <button
            className="action-btn btn-download"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            <DownloadIcon /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            className="action-btn btn-print"
            onClick={() => window.print()}
          >
            <PrintIcon /> Print
          </button>
          <button
            className="action-btn btn-delete"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon /> Delete
          </button>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div
        ref={invoiceRef}
        className="invoice-wrap"
        style={{
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #ebebef',
          boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
          padding: '36px 32px',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        {/* Invoice header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 16, marginBottom: 32,
          flexWrap: 'wrap',
        }}>
          <div>
            {/* Brand mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>B</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#18181b', letterSpacing: '-0.3px' }}>
                BillMate
              </span>
            </div>

            <h1 style={{
              fontSize: 26, fontWeight: 800, color: '#18181b',
              letterSpacing: '-0.7px', margin: '0 0 10px',
            }}>
              {invoice.invoiceNumber}
            </h1>

            <span className="status-pill" style={{ background: s.bg, color: s.color }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
              {s.label}
            </span>
          </div>

          {/* Dates */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Issue Date
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 14 }}>
              {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Due Date
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', margin: 0 }}>
              {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Billed to */}
        <div style={{
          background: '#fafafa', borderRadius: 11,
          padding: '16px 18px', marginBottom: 28,
          border: '1px solid #f0f0f5',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
            Billed To
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#18181b', marginBottom: 3 }}>
            {invoice.client.name}
          </p>
          {invoice.client.company && (
            <p style={{ fontSize: 13, color: '#71717a', marginBottom: 2 }}>{invoice.client.company}</p>
          )}
          <p style={{ fontSize: 13, color: '#71717a', marginBottom: invoice.client.phone ? 2 : 0 }}>
            {invoice.client.email}
          </p>
          {invoice.client.phone && (
            <p style={{ fontSize: 13, color: '#71717a' }}>{invoice.client.phone}</p>
          )}
        </div>

        {/* Line items table */}
        <div style={{ marginBottom: 24 }}>
          {/* Desktop header */}
          <div
            className="hidden sm:grid"
            style={{
              gridTemplateColumns: '1fr 70px 100px 100px',
              padding: '8px 0', borderBottom: '1.5px solid #f0f0f5',
              marginBottom: 4,
            }}
          >
            {['Description', 'Qty', 'Unit Price', 'Amount'].map((col) => (
              <span key={col} style={{
                fontSize: 10, fontWeight: 700, color: '#a1a1aa',
                textTransform: 'uppercase', letterSpacing: '0.6px',
              }}>
                {col}
              </span>
            ))}
          </div>

          {invoice.items.map((item, i) => (
            <div key={item.id}>
              {/* Desktop */}
              <div
                className="hidden sm:grid"
                style={{
                  gridTemplateColumns: '1fr 70px 100px 100px',
                  padding: '12px 0',
                  borderBottom: `1px solid ${i === invoice.items.length - 1 ? 'transparent' : '#f4f4f5'}`,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{item.description}</span>
                <span style={{ fontSize: 13, color: '#71717a' }}>{item.quantity}</span>
                <span style={{ fontSize: 13, color: '#71717a' }}>${item.unitPrice.toFixed(2)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>${item.amount.toFixed(2)}</span>
              </div>

              {/* Mobile */}
              <div
                className="block sm:hidden"
                style={{
                  padding: '12px 0',
                  borderBottom: `1px solid ${i === invoice.items.length - 1 ? 'transparent' : '#f4f4f5'}`,
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 4 }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#18181b' }}>${item.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: invoice.notes ? 28 : 0 }}>
          <div style={{ width: '100%', maxWidth: 240 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 13, color: '#71717a' }}>Subtotal</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#71717a' }}>Tax</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>${invoice.tax.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 10,
              background: '#eef2ff',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.5px' }}>
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ paddingTop: 22, borderTop: '1px solid #f0f0f5', marginTop: 22 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
              Notes
            </p>
            <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.7, margin: 0 }}>{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* ── Delete modal ── */}
      {showDeleteModal && (
        <div
          className="no-print"
          onClick={() => setShowDeleteModal(false)}
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
              textAlign: 'center',
              animation: 'modalIn 0.22s ease',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#fff1f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <TrashIcon />
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#18181b', marginBottom: 8 }}>
              Delete Invoice?
            </h2>
            <p style={{ fontSize: 13, color: '#71717a', marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently delete <strong>{invoice.invoiceNumber}</strong>. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="cancel-modal-btn"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 9, border: '1.5px solid #e4e4e7',
                  background: '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#71717a',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 9, border: 'none',
                  background: '#dc2626', color: '#fff',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  opacity: deleting ? 0.7 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default InvoiceDetail