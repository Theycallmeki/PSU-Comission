import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import {
  Users,
  Search,
  X,
  Info,
  GraduationCap,
  Armchair,
  BarChart2,
  Ratio,
} from 'lucide-react';
import { analyticsApi } from '../api/api';
import '../styles/TeachersSeatsPage.css';

const TeachersSeatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getQuickStats();
      const data = res?.data || res;
      setStats(data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openInfo = (record) => {
    setModal({ open: true, data: record });
  };

  const closeModal = () => {
    setModal({ open: false, data: null });
  };

  // Build table rows from stats
  const tableData = stats
    ? [
        {
          id: 1,
          school_year: stats.schoolYear,
          teacher_count: stats.teacherCount,
          seat_count: stats.seatCount,
          total_enrollees: stats.totalEnrollees,
          student_teacher_ratio: stats.studentTeacherRatio,
          utilization: stats.utilization,
          utilization_ratio: stats.utilizationRatio,
        },
      ]
    : [];

  const filtered = tableData.filter((row) =>
    String(row.school_year).toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'School Year',
      dataIndex: 'school_year',
      align: 'center',
    },
    {
      title: 'Teachers',
      dataIndex: 'teacher_count',
      align: 'center',
      render: (val) => Number(val).toLocaleString(),
    },
    {
      title: 'Seats',
      dataIndex: 'seat_count',
      align: 'center',
      render: (val) => Number(val).toLocaleString(),
    },
    {
      title: 'Total Enrollees',
      dataIndex: 'total_enrollees',
      align: 'center',
      render: (val) => Number(val).toLocaleString(),
    },
    {
      title: 'Student : Teacher',
      dataIndex: 'student_teacher_ratio',
      align: 'center',
      render: (val) => `${val}:1`,
    },
    {
      title: 'Seat Utilization',
      dataIndex: 'utilization',
      align: 'center',
      render: (val) => (
        <span
          className={`badge ${
            val >= 90 ? 'badge-high' : val >= 60 ? 'badge-mid' : 'badge-low'
          }`}
        >
          {val}%
        </span>
      ),
    },
    {
      title: 'Action',
      align: 'center',
      render: (_, record) => (
        <button className="infoBtn" onClick={() => openInfo(record)}>
          <Info size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon-wrap" style={{ background: '#800000' }}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <h1 className="title">Teachers & Seats</h1>
            <p className="sub">Analytics overview of teacher and seat utilization.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error">
          <X size={14} style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="summaryGrid">
        <div className="card">
          <div className="label">School Year</div>
          <div className="value">{stats?.schoolYear ?? '—'}</div>
        </div>
        <div className="card">
          <div className="label">Teachers</div>
          <div className="value">{stats ? Number(stats.teacherCount).toLocaleString() : '—'}</div>
        </div>
        <div className="card">
          <div className="label">Seat Count</div>
          <div className="value">{stats ? Number(stats.seatCount).toLocaleString() : '—'}</div>
        </div>
        <div className="card">
          <div className="label">Total Enrollees</div>
          <div className="value">{stats ? Number(stats.totalEnrollees).toLocaleString() : '—'}</div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search"
            placeholder="Search school year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        className="classroom-table"
      />

      {/* MODAL */}
      {modal.open && modal.data && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Analytics Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* School Year */}
              <div className="detail-section-title">School Year</div>
              <div className="detail-value-large">{modal.data.school_year}</div>

              <div className="detail-divider" />

              {/* Stats Grid */}
              <div className="detail-grid">
                <div className="detail-card">
                  <GraduationCap size={20} className="detail-icon" />
                  <div className="detail-card-label">Teachers</div>
                  <div className="detail-card-value">
                    {Number(modal.data.teacher_count).toLocaleString()}
                  </div>
                  <div className="detail-card-note">= No. of Classrooms</div>
                </div>

                <div className="detail-card">
                  <Armchair size={20} className="detail-icon" />
                  <div className="detail-card-label">Seat Count</div>
                  <div className="detail-card-value">
                    {Number(modal.data.seat_count).toLocaleString()}
                  </div>
                  <div className="detail-card-note">= Total Enrollees</div>
                </div>

                <div className="detail-card">
                  <BarChart2 size={20} className="detail-icon" />
                  <div className="detail-card-label">Seat Utilization</div>
                  <div className="detail-card-value">{modal.data.utilization}%</div>
                  <div className="detail-card-note">Ratio: {modal.data.utilization_ratio}</div>
                </div>

                <div className="detail-card">
                  <Ratio size={20} className="detail-icon" />
                  <div className="detail-card-label">Student : Teacher</div>
                  <div className="detail-card-value">
                    {modal.data.student_teacher_ratio}:1
                  </div>
                  <div className="detail-card-note">Per classroom</div>
                </div>
              </div>

              <div className="detail-divider" />

              {/* Row breakdown */}
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">Total Enrollees</span>
                  <span style={{ fontWeight: 600 }}>
                    {Number(modal.data.total_enrollees).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Teacher Count</span>
                  <span style={{ fontWeight: 600 }}>
                    {Number(modal.data.teacher_count).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Seat Count</span>
                  <span style={{ fontWeight: 600 }}>
                    {Number(modal.data.seat_count).toLocaleString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Utilization Ratio</span>
                  <span style={{ fontWeight: 600 }}>{modal.data.utilization_ratio}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Student : Teacher Ratio</span>
                  <span style={{ fontWeight: 600 }}>
                    {modal.data.student_teacher_ratio}:1
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersSeatsPage;