// src/pages/resources/ResourcesTablePage.jsx
import { Table, Tag } from 'antd'

import { useResources }         from '../../hooks/useResources'
import { seatUtilization }      from '../../utils/calculations'
import { formatPercent, formatSY } from '../../utils/formatters'
import { DEPED_RATIO_STANDARD } from '../../data/resourcesData'

export default function ResourcesTablePage() {
  const { data, loading, error } = useResources()

  if (loading) return <div className="loading-state">Loading resources data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  const columns = [
    {
      title: 'School Year',
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      render: (text) => <span style={{ fontWeight: 600 }}>{formatSY(text)}</span>,
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      align: 'right',
      sorter: (a, b) => a.students - b.students,
    },
    {
      title: 'Classrooms',
      dataIndex: 'classrooms',
      key: 'classrooms',
      align: 'right',
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      key: 'seats',
      align: 'right',
    },
    {
      title: 'Teachers',
      dataIndex: 'teachers',
      key: 'teachers',
      align: 'right',
    },
    {
      title: 'Ratio',
      key: 'ratio',
      align: 'right',
      render: (_, record) => {
        const over = record.ratio > DEPED_RATIO_STANDARD
        return <Tag color={over ? 'red' : 'green'}>{record.ratio}:1</Tag>
      },
    },
    {
      title: 'Seat Util.',
      key: 'utilization',
      align: 'right',
      render: (_, record) => {
        const util    = seatUtilization(record.students, record.seats)
        const warning = util > 95
        return <Tag color={warning ? 'orange' : 'blue'}>{formatPercent(util)}</Tag>
      },
    },
  ]

  return (
    <div className="page-wrapper">
      <div className="table-card">
        <div className="table-card-header">
          <h3 className="chart-title">Resources by School Year</h3>
          <p className="chart-sub">Year-over-year resource allocation overview</p>
        </div>
        <Table
          columns={columns}
          dataSource={data.map((item, index) => ({
            ...item,
            key: item.schoolYear || index,
          }))}
          pagination={{ pageSize: 5 }}
          size="middle"
          bordered={false}
        />
      </div>
    </div>
  )
}