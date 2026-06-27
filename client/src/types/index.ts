export interface User {
  id: number
  name: string
  email: string
}

export interface Client {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
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