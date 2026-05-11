import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  BookOpen,
  Lightbulb,
  GraduationCap,
  CircleDot,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart2,
  Table2,
} from 'lucide-react'
import { ROUTES } from './../constants/routes'
import { SCHOOL_INFO, CURRENT_SY } from './../constants/schoolInfo'

const MANAGE_ITEMS = [
  {
    label: 'Enrollment',
    icon: Users,
    base: ROUTES.ENROLLMENT,
    children: [
      { to: ROUTES.ENROLLMENT_ANALYTICS, label: 'Analytics', icon: BarChart2 },
      { to: ROUTES.ENROLLMENT_TABLE,     label: 'Table Data', icon: Table2 },
    ],
  },
  {
    label: 'Performance',
    icon: TrendingUp,
    base: ROUTES.PERFORMANCE,
    children: [
      { to: ROUTES.PERFORMANCE_ANALYTICS, label: 'Analytics', icon: BarChart2 },
      { to: ROUTES.PERFORMANCE_TABLE,     label: 'Table Data', icon: Table2 },
    ],
  },
  {
    label: 'Resources',
    icon: BookOpen,
    base: ROUTES.RESOURCES,
    children: [
      { to: ROUTES.RESOURCES_ANALYTICS, label: 'Analytics', icon: BarChart2 },
      { to: ROUTES.RESOURCES_TABLE,     label: 'Table Data', icon: Table2 },
    ],
  },
]

function DropdownItem({ item, collapsed }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(item.base)
  const [open, setOpen] = useState(isActive)
  const Icon = item.icon

  return (
    <div className="nav-dropdown">
      <button
        className={`nav-link nav-dropdown-trigger${isActive ? ' active' : ''}`}
        onClick={() => !collapsed && setOpen(o => !o)}
        title={collapsed ? item.label : undefined}
        style={{ width: '100%', textAlign: 'left' }}
      >
        <Icon size={16} />
        <span className="nav-link-label">{item.label}</span>
        {!collapsed && (
          <ChevronDown
            size={13}
            className="nav-dropdown-arrow"
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              opacity: 0.65,
            }}
          />
        )}
      </button>

      {/* Sub-links — hidden when collapsed or closed */}
      {!collapsed && open && (
        <div className="nav-dropdown-children">
          {item.children.map(({ to, label, icon: CIcon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link nav-child-link${isActive ? ' active' : ''}`}
            >
              <CIcon size={13} style={{ flexShrink: 0 }} />
              <span className="nav-link-label">{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(false)

  const handleToggle = () => {
    const next = !collapsed
    setCollapsed(next)
    if (onToggle) onToggle(next)
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="school-badge">
          <div className="badge-icon">
            <GraduationCap size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div className="school-name">{SCHOOL_INFO.shortName}</div>
            <div className="school-id">ID: {SCHOOL_INFO.schoolId}</div>
          </div>
        </div>
        <button
          className="sidebar-toggle"
          onClick={handleToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {/* ── Admin Dashboard ── */}
        <div className="nav-section-label">Admin Dashboard</div>
        <NavLink
          to={ROUTES.DASHBOARD}
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <LayoutDashboard size={16} />
          <span className="nav-link-label">Dashboard</span>
        </NavLink>

        {/* ── Manage ── */}
        <div className="nav-section-label">Manage</div>
        {MANAGE_ITEMS.map(item => (
          <DropdownItem key={item.base} item={item} collapsed={collapsed} />
        ))}

        {/* ── Recommend ── */}
        <div className="nav-section-label">Recommend</div>
        <NavLink
          to={ROUTES.RECOMMENDATIONS}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          title={collapsed ? 'Recommendations' : undefined}
        >
          <Lightbulb size={16} />
          <span className="nav-link-label">Recommendations</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="school-year-badge">
          <CircleDot size={12} style={{ flexShrink: 0 }} />
          <span className="sy-label">SY {CURRENT_SY}</span>
        </div>
      </div>
    </aside>
  )
}