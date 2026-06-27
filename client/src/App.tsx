import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Invoices from './pages/Invoices'
import CreateInvoice from './pages/CreateInvoice'
import InvoiceDetail from './pages/InvoiceDetail'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root — redirect based on auth */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth pages — if already logged in redirect to dashboard */}
        <Route path="/login" element={
          <AuthRoute><Login /></AuthRoute>
        } />
        <Route path="/register" element={
          <AuthRoute><Register /></AuthRoute>
        } />

        {/* Protected pages — if not logged in redirect to login */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute><Clients /></ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute><Invoices /></ProtectedRoute>
        } />
        <Route path="/invoices/create" element={
          <ProtectedRoute><CreateInvoice /></ProtectedRoute>
        } />
        <Route path="/invoices/:id" element={
          <ProtectedRoute><InvoiceDetail /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App