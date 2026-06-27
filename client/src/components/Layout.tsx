import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const InvoiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)

const ClientIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const navItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashIcon },
  { path: '/invoices',  label: 'Invoices',  Icon: InvoiceIcon },
  { path: '/clients',   label: 'Clients',   Icon: ClientIcon },
]

const pageTitles: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/invoices':        'Invoices',
  '/invoices/create': 'New Invoice',
  '/clients':         'Clients',
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const navigate  = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const currentPage = pageTitles[location.pathname] || 'BillMate'
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      overflow: 'hidden',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      backgroundColor: '#f7f7f9',
    }}>

      <style>{`
        * { box-sizing: border-box; }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #71717a;
          font-size: 13.5px;
          font-weight: 500;
          transition: background 0.15s ease, color 0.15s ease;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-link:hover {
          background: #f4f4f8;
          color: #18181b;
        }
        .nav-link:hover .nav-icon-wrap { color: #6366f1; }

        .nav-link.active {
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 700;
        }
        .nav-link.active .nav-icon-wrap { color: #6366f1; }
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #6366f1;
          border-radius: 0 3px 3px 0;
        }

        .nav-link.collapsed-link {
          justify-content: center;
          padding: 10px;
        }

        .logout-btn:hover {
          background: #fef2f2 !important;
          color: #dc2626 !important;
        }
        .logout-btn:hover svg { stroke: #dc2626; }

        .topbar-btn:hover { background: #f4f4f8 !important; }

        .new-invoice-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .new-invoice-btn:hover {
          background: #4f46e5 !important;
          box-shadow: 0 6px 18px rgba(99,102,241,0.38) !important;
          transform: translateY(-1px);
        }

        .user-card:hover { background: #f0f0f7 !important; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }

        .nav-label {
          opacity: 1;
          transition: opacity 0.2s ease;
        }
        .nav-label.hidden-label {
          opacity: 0;
          width: 0;
          pointer-events: none;
        }
      `}</style>

      {/* ─────────── SIDEBAR ─────────── */}
      <aside style={{
        width: collapsed ? 64 : 236,
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #ebebef',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: '2px 0 12px rgba(0,0,0,0.03)',
      }}>

        {/* Logo */}
        <div style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 20px',
          borderBottom: '1px solid #ebebef',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Mark */}
          <div style={{
            width: 32, height: 32,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: '-0.5px' }}>B</span>
          </div>

          {/* Wordmark */}
          {!collapsed && (
            <div>
              <div style={{
                fontSize: 15, fontWeight: 800, color: '#18181b',
                letterSpacing: '-0.4px', lineHeight: 1,
              }}>
                BillMate
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.3px', marginTop: 2 }}>
                FREELANCE INVOICING
              </div>
            </div>
          )}
        </div>

        {/* Nav section label */}
        {!collapsed && (
          <div style={{ padding: '16px 20px 6px', flexShrink: 0 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#c4c4cc',
              letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              Menu
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav style={{
          flex: 1,
          padding: collapsed ? '12px 8px' : '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}>
          {navItems.map(({ path, label, Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${isActive ? ' active' : ''}${collapsed ? ' collapsed-link' : ''}`}
                title={collapsed ? label : undefined}
              >
                <span className="nav-icon-wrap" style={{
                  color: isActive ? '#6366f1' : '#a1a1aa',
                  flexShrink: 0,
                  display: 'flex',
                  transition: 'color 0.15s ease',
                }}>
                  <Icon />
                </span>
                {!collapsed && (
                  <span>{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div style={{
          padding: collapsed ? '12px 8px' : '12px 10px',
          borderTop: '1px solid #ebebef',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          flexShrink: 0,
        }}>
          {/* User card */}
          {!collapsed && (
            <div className="user-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 9,
              background: '#f7f7f9',
              marginBottom: 4,
              cursor: 'default',
              transition: 'background 0.15s ease',
            }}>
              <div style={{
                width: 30, height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
              }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials}</span>
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 700, color: '#18181b',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user?.name || 'User'}
                </div>
                <div style={{
                  fontSize: 10.5, color: '#a1a1aa',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user?.email || 'freelancer'}
                </div>
              </div>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e', flexShrink: 0,
                boxShadow: '0 0 0 2px #dcfce7',
              }} />
            </div>
          )}

          {collapsed && (
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: 4,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
              }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials}</span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              width: '100%',
              padding: collapsed ? '9px 0' : '9px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 9,
              color: '#a1a1aa',
              fontSize: 13.5,
              fontWeight: 500,
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogoutIcon />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─────────── MAIN AREA ─────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 60,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #ebebef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          gap: 16,
        }}>

          {/* Left: toggle + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="topbar-btn"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 7,
                color: '#71717a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <MenuIcon />
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: '#e4e4e7' }} />

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 500 }}>BillMate</span>
              <span style={{ fontSize: 12, color: '#d4d4d8' }}>/</span>
              <span style={{ fontSize: 13, color: '#18181b', fontWeight: 700 }}>{currentPage}</span>
            </div>
          </div>

          {/* Right: new invoice btn + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/invoices/create"
              className="new-invoice-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 15px',
                borderRadius: 9,
                background: '#6366f1',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(99,102,241,0.28)',
                letterSpacing: '-0.1px',
              }}
            >
              <PlusIcon />
              New Invoice
            </Link>

            {/* Avatar */}
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(99,102,241,0.28)',
              cursor: 'default',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout