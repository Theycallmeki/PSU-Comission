// src/components/tables/EnrollmentTable.jsx
import { Table, Tag, Space, Button } from "antd";
import { Info, PlusCircle } from "lucide-react";
import { formatSY } from "../../utils/formatters";

export default function EnrollmentTable({
  data = [],
  onEdit,
  onAdd
}) {
  const columns = [
    // ─────────────────────────────
    // SCHOOL YEAR
    // ─────────────────────────────
    {
      title: "School Year",
      dataIndex: "schoolYear",
      key: "schoolYear",
      width: 160,
      align: "center",
      render: (text) => (
        <span style={{ fontWeight: 600 }}>
          {formatSY(text)}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // TOTAL
    // ─────────────────────────────
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: "center",
      sorter: (a, b) => (a.total || 0) - (b.total || 0),
      render: (value) => (
        <span style={{ fontWeight: 500 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // MALE
    // ─────────────────────────────
    {
      title: "Male",
      dataIndex: "male",
      key: "male",
      width: 120,
      align: "center",
      render: (value) => (
        <span style={{ color: "#6d28d9", fontWeight: 500 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // FEMALE
    // ─────────────────────────────
    {
      title: "Female",
      dataIndex: "female",
      key: "female",
      width: 120,
      align: "center",
      render: (value) => (
        <span style={{ color: "#e11d48", fontWeight: 500 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
  
    // ─────────────────────────────
    // YOY CHANGE
    // ─────────────────────────────
    {
      title: "YoY Change",
      key: "change",
      width: 140,
      align: "center",
      render: (_, __, index) => {
        const current = data?.[index];
        const prev = data?.[index - 1];
  
        if (!current || !prev) return "—";
  
        const diff = (current.total || 0) - (prev.total || 0);
        const isUp = diff >= 0;
  
        return (
          <Tag color={isUp ? "green" : "red"}>
            {isUp ? "+" : ""}
            {diff}
          </Tag>
        );
      },
    },
  
    // ─────────────────────────────
    // ACTION
    // ─────────────────────────────
    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <button
          onClick={() => setEditRecord(record)}
          title="View / Edit record"
          className="tbl-action-btn"
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Info size={14} />
        </button>
      ),
    },
  ];


  return (
    <div className="table-card">

      {/* ── HEADER ── */}
      <div className="table-card-header table-card-header--row">

        <div>
          <h3 className="chart-title">
            Enrollment by School Year
          </h3>
          <p className="chart-sub">
            Breakdown by total, male & female
          </p>
        </div>

        {/* ADD BUTTON (opens modal in parent) */}
        <button className="btn-add" onClick={onAdd}>
          <PlusCircle size={14} />
          Add Record
        </button>

      </div>

      {/* ── TABLE ── */}
      <Table
        columns={columns}
        dataSource={data.map((item, index) => ({
          ...item,
          key: item.schoolYear || index,
        }))}
        pagination={{ pageSize: 5 }}
        bordered={false}
        size="middle"
      />

    </div>
  );
}