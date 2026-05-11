import { useLocation } from 'react-router-dom'
import { ROUTES } from './../constants/routes'
import { CURRENT_SY } from './../constants/schoolInfo'

const PAGE_META = {
  [ROUTES.DASHBOARD]:       { title: 'Dashboard Overview',     sub: 'Welcome to GEMS Admin Portal' },
  [ROUTES.ENROLLMENT]:      { title: 'Enrollment Analytics',   sub: 'Student enrollment trends & grade distribution' },
  [ROUTES.PERFORMANCE]:     { title: 'Performance Indicators', sub: 'Retention, dropouts & repeater tracking' },
  [ROUTES.RESOURCES]:       { title: 'School Resources',       sub: 'Classrooms, seats & teacher-student ratio' },
  [ROUTES.RECOMMENDATIONS]: { title: 'Recommendations',        sub: 'Data-driven insights & action plans' },
}

export default function Header() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] ?? { title: 'GEMS Dashboard', sub: '' }

  return (
    <header className="header">
      <div className="header-left">
        <h1>{meta.title}</h1>
        <p>{meta.sub}</p>
      </div>
      <div className="header-right">
        <div className="header-chip">
          <span className="dot" />
          SY {CURRENT_SY}
        </div>
        <div className="header-chip">
          Galang Elementary Memorial School
        </div>
      </div>
    </header>
  )
}