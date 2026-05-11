// src/components/tables/PerformanceTable.jsx
import { Table, Tag } from "antd";
import { formatSY, formatPercent } from "../../utils/formatters";
import { retentionRate, dropoutRate } from "../../utils/calculations";

export default function PerformanceTable({ data = [] }) {
  const columns = [
    {
      title: "School Year",
      dataIndex: "schoolYear",
      key: "schoolYear",
      render: (text) => (
        <span style={{ fontWeight: 600 }}>{formatSY(text)}</span>
      ),
    },
    {
      title: "Enrolled",
      dataIndex: "enrolled",
      key: "enrolled",
      align: "right",
      sorter: (a, b) => a.enrolled - b.enrolled,
    },
    {
      title: "Promoted",
      dataIndex: "promoted",
      key: "promoted",
      align: "right",
      render: (value) => (
        <span style={{ color: "#10b981", fontWeight: 500 }}>
          {value ?? "—"}
        </span>
      ),
    },
    {
      title: "Repeaters",
      dataIndex: "repeaters",
      key: "repeaters",
      align: "right",
      render: (value) => <Tag color="default">{value}</Tag>,
    },
    {
      title: "Dropouts",
      dataIndex: "dropouts",
      key: "dropouts",
      align: "right",
      render: (value) => <Tag color="red">{value}</Tag>,
    },
    {
      title: "Retention Rate",
      key: "retention",
      align: "right",
      render: (_, record) => {
        const retention = retentionRate(record.promoted, record.enrolled);

        if (!retention) return "—";

        const isHigh = retention >= 95;

        return (
          <Tag color={isHigh ? "green" : "blue"}>
            {formatPercent(retention)}
          </Tag>
        );
      },
    },
    {
      title: "Dropout Rate",
      key: "dropoutRate",
      align: "right",
      render: (_, record) => {
        const dropout = dropoutRate(record.dropouts, record.enrolled);

        if (!dropout && dropout !== 0) return "—";

        const isLow = dropout <= 2;

        return (
          <Tag color={isLow ? "green" : "red"}>
            {formatPercent(dropout, 2)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="table-card">
      <div className="table-card-header">
        <h3 className="chart-title">Performance Summary by Year</h3>
        <p className="chart-sub">Promoted, repeaters, dropouts & rates</p>
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
  );
}