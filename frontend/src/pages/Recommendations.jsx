import { Lightbulb, TrendingUp, Home, Users, BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const RECOMMENDATIONS = [
  {
    priority: 'High',
    priorityColor: 'rose',
    iconName: 'Home',
    title: 'Plan for Additional Classroom Infrastructure',
    description:
      'With seat utilization approaching 89% and enrollment growing by an average of ~15 students per year, GEMS should begin planning for at least 2 additional classrooms by SY 2027–2028 to avoid overcrowding and ensure quality learning environments.',
    actions: [
      'Submit infrastructure proposal to DepEd Division Office',
      'Coordinate with LGU for possible co-funding of classroom construction',
      'Explore modular classroom options as a short-term solution',
    ],
  },
  {
    priority: 'High',
    priorityColor: 'rose',
    iconName: 'Users',
    title: 'Strengthen Dropout Intervention Programs',
    description:
      'While dropouts have slightly decreased in recent years, an average of 8–10 students per year leave school before completion. Targeted intervention, particularly in lower grades and for at-risk families, can improve retention.',
    actions: [
      'Establish a student-at-risk tracking system per grade level',
      'Partner with barangay officials for home visitation programs',
      'Apply for DepEd conditional cash transfer coordination for financially vulnerable families',
    ],
  },
  {
    priority: 'Medium',
    priorityColor: 'amber',
    iconName: 'BookOpen',
    title: 'Sustain Repeater Reduction Initiatives',
    description:
      'Repeater count has declined from 14 to 8 over 5 years — a positive trend. Continuing instructional support programs (remedial classes, reading intervention) will help maintain and further reduce this number.',
    actions: [
      'Continue Phil-IRI based reading intervention programs',
      'Implement early-grade learning assessment per quarter',
      'Train teachers on differentiated instruction strategies',
    ],
  },
  {
    priority: 'Medium',
    priorityColor: 'amber',
    iconName: 'TrendingUp',
    title: 'Hire an Additional Teacher Ahead of SY 2026–2027',
    description:
      'With enrollment projected to reach 415+ by SY 2026-2027, adding a 12th teacher now will keep the ratio comfortably within DepEd\'s 40:1 standard and reduce workload on current faculty.',
    actions: [
      'File teacher item request with the DepEd Division Office',
      'Utilize available Teacher III or Master Teacher positions',
      'Consider PESFA or BSEP-funded teacher supplementation if applicable',
    ],
  },
  {
    priority: 'Low',
    priorityColor: 'blue',
    iconName: 'Lightbulb',
    title: 'Improve Data Collection for Decision-Making',
    description:
      'A digitized school data system would enable real-time tracking of enrollment, attendance, repeaters, and resource utilization — making annual reporting more accurate and timely.',
    actions: [
      'Adopt DepEd EBEIS consistently for all data encoding',
      'Create internal school-level dashboards (this system) for monitoring',
      'Train school staff in basic data literacy and record management',
    ],
  },
]

const ICON_MAP = {
  Home:      <Home size={18} />,
  Users:     <Users size={18} />,
  BookOpen:  <BookOpen size={18} />,
  TrendingUp:<TrendingUp size={18} />,
  Lightbulb: <Lightbulb size={18} />,
}

const PRIORITY_ICON = {
  High:   <AlertTriangle size={12} />,
  Medium: <Clock size={12} />,
  Low:    <CheckCircle size={12} />,
}

export default function Recommendations() {
  return (
    <div className="page-wrapper">
      <div className="reco-intro">
        <Lightbulb size={20} style={{ color: 'var(--amber)' }} />
        <p>
          The following recommendations are derived from analysis of GEMS enrollment trends,
          performance indicators, and resource utilization data from SY 2021–2022 to 2025–2026.
        </p>
      </div>

      <div className="reco-list">
        {RECOMMENDATIONS.map((r, i) => (
          <div key={i} className={`reco-card ${r.priorityColor}`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="reco-card-header">
              <div className="reco-icon-wrap">
                <div className={`stat-card-icon ${r.priorityColor}`}>
                  {ICON_MAP[r.iconName]}
                </div>
                <div>
                  <h3 className="reco-title">{r.title}</h3>
                  <span className={`stat-badge ${r.priorityColor === 'rose' ? 'down' : r.priorityColor === 'amber' ? 'neutral' : 'up'}`}>
                    {PRIORITY_ICON[r.priority]} {r.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <p className="reco-desc">{r.description}</p>
            <div className="reco-actions">
              <p className="reco-actions-label">Recommended Actions:</p>
              <ul>
                {r.actions.map((a, j) => (
                  <li key={j}>
                    <CheckCircle size={12} style={{ color: 'var(--emerald)', flexShrink: 0, marginTop: 2 }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}