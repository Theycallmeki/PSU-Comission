// src/pages/enrollment/EnrollmentTablePage.jsx
import { useState }        from 'react'
import { Table }           from 'antd'
import { PlusCircle, Info } from 'lucide-react'

import EnrollmentTable     from '../../components/tables/EnrollmentTable'
import EnrollmentEditModal from './EnrollmentEditModal'
import EnrollmentAddModal  from './EnrollmentAddModal'

import { useEnrollment }           from '../../hooks/useEnrollment'
import { formatPercent }           from '../../utils/formatters'

export default function EnrollmentTablePage() {
  const { data, current, loading, error } = useEnrollment()

  const [editRecord, setEditRecord] = useState(null)
  const [addOpen,    setAddOpen]    = useState(false)

  // ── Local grade rows state (seeded from hook) ──────────────
  const [gradeRows, setGradeRows] = useState(null)

  // Seed once current loads
  const rows = gradeRows ?? current?.byGrade ?? []

  if (loading) return <div className="loading-state">Loading enrollment data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  // ── Handlers ────────────────────────────────────────────────
  const handleSave = (updated) => {
    setGradeRows(prev =>
      (prev ?? current?.byGrade ?? []).map(r =>
        r.grade === updated.grade ? { ...r, ...updated } : r
      )
    )
    setEditRecord(null)
  }

  const handleDelete = (record) => {
    setGradeRows(prev =>
      (prev ?? current?.byGrade ?? []).filter(r => r.grade !== record.grade)
    )
    setEditRecord(null)
  }

  const handleAdd = (newRow) => {
    setGradeRows(prev => [...(prev ?? current?.byGrade ?? []), newRow])
    setAddOpen(false)
  }

  // ── Derived total for % of School ───────────────────────────
  const schoolTotal = rows.reduce((sum, r) => sum + Number(r.total ?? 0), 0)

  // ── Grade-level columns ──────────────────────────────────────
  const gradeColumns = [
    // ─────────────────────────────
    // GRADE LEVEL
    // ─────────────────────────────
    {
      title: 'Grade Level',
      dataIndex: 'grade',
      key: 'grade',
      width: 160,
      align: 'center',
      render: (text) => (
        <span className="font-bold">
          {text}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // TOTAL
    // ─────────────────────────────
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.total || 0) - (b.total || 0),
      render: (value) => (
        <span className="font-bold">
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // MALE
    // ─────────────────────────────
    {
      title: 'Male',
      dataIndex: 'male',
      key: 'male',
      width: 110,
      align: 'center',
      render: (value) => (
        <span style={{ color: '#6d28d9', fontWeight: 500 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // FEMALE
    // ─────────────────────────────
    {
      title: 'Female',
      dataIndex: 'female',
      key: 'female',
      width: 110,
      align: 'center',
      render: (value) => (
        <span style={{ color: '#e11d48', fontWeight: 500 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // % OF SCHOOL
    // ─────────────────────────────
    {
      title: '% of School',
      key: 'percent',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const percent = schoolTotal
          ? (record.total / schoolTotal) * 100
          : 0;
  
        return (
          <span className="table-badge neutral">
            {formatPercent(percent)}
          </span>
        );
      },
    },
  
    // ─────────────────────────────
    // ACTION
    // ─────────────────────────────
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <button
          onClick={() => setEditRecord(record)}
          title="View / Edit record"
          className="tbl-action-btn"
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <Info size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="page-wrapper">

      {/* ── Grade-Level Breakdown ── */}
      {current?.byGrade && (
        <div className="table-card" style={{ animationDelay: '0ms' }}>
          <div className="table-card-header table-card-header--row">
            <div>
              <h3 className="chart-title">
                Grade-Level Breakdown — {current.schoolYear}
              </h3>
              <p className="chart-sub">Enrollment per grade with gender split</p>
            </div>
            <button className="btn-add" onClick={() => setAddOpen(true)}>
              <PlusCircle size={14} />
              Add Record
            </button>
          </div>

          <Table
            columns={gradeColumns}
            dataSource={rows.map((g, i) => ({ ...g, key: g.grade || i }))}
            pagination={{ pageSize: 5 }}
            size="middle"
            bordered={false}
          />
        </div>
      )}

      {/* ── Enrollment by School Year ── */}
      <EnrollmentTable data={data} />

      {/* ── Modals ── */}
      {editRecord && (
        <EnrollmentEditModal
          record={editRecord}
          total={schoolTotal}
          onClose={() => setEditRecord(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      {addOpen && (
        <EnrollmentAddModal
          schoolYear={current?.schoolYear}
          onClose={() => setAddOpen(false)}
          onAdd={handleAdd}
        />
      )}

    </div>
  )
}