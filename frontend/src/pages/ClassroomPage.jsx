import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'antd';
import {
  Plus,
  School,
  Search,
  X,
  Trash2,
  Save,
  Info,
  Download
} from 'lucide-react';
import { classroomsApi } from '../api/api';
import '../styles/ClassroomPage.css';

const DEFAULT_SORT_ORDER = [
  'KINDER',
  'GRADE 1',
  'GRADE 2',
  'GRADE 3',
  'GRADE 4',
  'GRADE 5',
  'GRADE 6'
];

const defaultForm = { grade_level: '', num_classrooms: 1 };

const ClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editForm, setEditForm] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: null,
    data: defaultForm,
    editId: null
  });

  const [toast, setToast] = useState({ msg: '', type: '' });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 2500);
  };

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classroomsApi.getAll();
      setClassrooms(data || []);
    } catch {
      setError('Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  /* ── Download PDF ── */
  const handleDownloadPDF = () => {
    const chartContainers = [...document.querySelectorAll('.chart-container')];
    const responsiveContainers = [...document.querySelectorAll('.recharts-responsive-container')];
    const svgs = [...document.querySelectorAll('.recharts-responsive-container svg')];
    const origCC = chartContainers.map(el => ({ h: el.style.height, mh: el.style.minHeight }));
    const origRC = responsiveContainers.map(el => ({ w: el.style.width, h: el.style.height }));
    const origSVG = svgs.map(el => ({ w: el.getAttribute('width'), h: el.getAttribute('height') }));
    const restore = () => {
      chartContainers.forEach((el, i) => { el.style.height = origCC[i].h; el.style.minHeight = origCC[i].mh; });
      responsiveContainers.forEach((el, i) => { el.style.width = origRC[i].w; el.style.height = origRC[i].h; });
      svgs.forEach((el, i) => {
        if (origSVG[i].w === null) el.removeAttribute('width'); else el.setAttribute('width', origSVG[i].w);
        if (origSVG[i].h === null) el.removeAttribute('height'); else el.setAttribute('height', origSVG[i].h);
      });
    };
    chartContainers.forEach(el => { el.style.height = el.offsetHeight + 'px'; el.style.minHeight = el.offsetHeight + 'px'; });
    responsiveContainers.forEach(el => { el.style.width = el.offsetWidth + 'px'; el.style.height = el.offsetHeight + 'px'; });
    svgs.forEach(el => { const r = el.getBoundingClientRect(); el.setAttribute('width', r.width + 'px'); el.setAttribute('height', r.height + 'px'); });
    const onAfterPrint = () => { restore(); window.removeEventListener('afterprint', onAfterPrint); };
    window.addEventListener('afterprint', onAfterPrint);
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => window.print(), 300)));
  };

  const openInfo = (record) => {
    setDeleteConfirm(false);
    setEditForm(record);
    setModal({ open: true, type: 'info', data: record, editId: record.id });
  };

  const openAdd = () => {
    setModal({ open: true, type: 'form', data: defaultForm, editId: null });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, data: defaultForm, editId: null });
    setDeleteConfirm(false);
    setEditForm(null);
  };

  const handleSave = async () => {
    const { data, editId } = modal;
    if (!data.grade_level.trim()) return;

    try {
      if (editId) {
        const updated = await classroomsApi.update(editId, data);
        setClassrooms((prev) => prev.map((c) => (c.id === editId ? updated : c)));
        showToast('Classroom updated successfully.');
      } else {
        const created = await classroomsApi.create(data);
        setClassrooms((prev) => [...prev, created]);
        showToast('Classroom added successfully.');
      }
      closeModal();
    } catch {
      setError('Failed to save classroom.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await classroomsApi.delete(id);
      setClassrooms((prev) => prev.filter((c) => c.id !== id));
      showToast('Classroom deleted.', 'danger');
      closeModal();
    } catch {
      setError('Failed to delete classroom.');
    }
  };

  const sortedClassrooms = [...classrooms].sort((a, b) => {
    const indexA = DEFAULT_SORT_ORDER.indexOf(a.grade_level.toUpperCase());
    const indexB = DEFAULT_SORT_ORDER.indexOf(b.grade_level.toUpperCase());
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.grade_level.localeCompare(b.grade_level);
  });

  const filtered = sortedClassrooms.filter((c) =>
    c.grade_level.toLowerCase().includes(search.toLowerCase())
  );

  const totalClassrooms = classrooms.reduce((s, c) => s + Number(c.num_classrooms), 0);
  const avgPerLevel = classrooms.length
    ? (totalClassrooms / classrooms.length).toFixed(1)
    : '0';

  const columns = [
    {
      title: 'Grade Level',
      dataIndex: 'grade_level',
      key: 'grade_level',
      align: 'center',
      render: (text) => (
        <span>{text}</span>
      ),
    },
    {
      title: 'No. of Classrooms',
      dataIndex: 'num_classrooms',
      key: 'num_classrooms',
      align: 'center',
      render: (val) => (
        <span className="num-cell">{val}</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <button
          className="infoBtn"
          onClick={() => openInfo(record)}
          title="View details"
        >
          <Info size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="page">

      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/" className="breadcrumb-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item breadcrumb-inactive">Menu</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item breadcrumb-inactive">Classrooms</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-item breadcrumb-active">Classroom Table</span>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon-wrap">
            <School size={22} color="#ffffff" />
          </div>
          <div>
            <h1 className="title">Classrooms</h1>
            <p className="sub">
              Manage classroom allocations and grade levels.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="pdf-download-btn" onClick={handleDownloadPDF} type="button">
            <Download size={15} />
            Download PDF
          </button>
          <button className="addBtn" onClick={openAdd}>
            <Plus size={15} style={{ marginRight: 5 }} />
            Add Classroom
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          <X size={14} style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="summaryGrid">
        <div className="card">
          <div>
            <div className="label">Total Grade Levels</div>
            <div className="value">{classrooms.length}</div>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="label">Total Classrooms</div>
            <div className="value">{totalClassrooms}</div>
          </div>
        </div>
        <div className="card">
          <div>
            <div className="label">Avg per Level</div>
            <div className="value">{avgPerLevel}</div>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search"
            placeholder="Search grade level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        className="classroom-table"
      />

      {/* Modal */}
      {modal.open && (
        <div className="overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">
                {modal.type === 'info'
                  ? 'Classroom Details'
                  : modal.editId
                    ? 'Edit Classroom'
                    : 'Add Classroom'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {/* Info Modal */}
            {modal.type === 'info' && (
              <div className="modal-body">
                <div className="info-row">
                  <span className="info-label">Grade Level</span>
                  <span className={`badge ${modal.data.grade_level.toUpperCase() === 'KINDER' ? 'kinder' : 'normal'}`}>
                    {modal.data.grade_level}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">No. of Classrooms</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={editForm?.num_classrooms || ''}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        num_classrooms: Number(e.target.value)
                      }))
                    }
                  />
                </div>

                <div className="modal-footer">
                  {deleteConfirm ? (
                    <div className="confirm-delete">
                      <span>Are you sure?</span>
                      <button className="btn btn-danger" onClick={() => handleDelete(modal.editId)}>
                        <Trash2 size={14} /> Yes, Delete
                      </button>
                      <button className="btn btn-ghost" onClick={() => setDeleteConfirm(false)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-danger-outline" onClick={() => setDeleteConfirm(true)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        const updated = await classroomsApi.update(modal.editId, editForm);
                        setClassrooms((prev) =>
                          prev.map((c) => (c.id === modal.editId ? updated : c))
                        );
                        showToast('Classroom updated successfully.');
                        closeModal();
                      } catch {
                        setError('Failed to update classroom.');
                      }
                    }}
                  >
                    <Save size={14} /> Update
                  </button>
                </div>
              </div>
            )}

            {/* Form Modal */}
            {modal.type === 'form' && (
              <div className="modal-body">
                <div className="form-field">
                  <label className="form-label">Grade Level</label>
                  <input
                    className="form-input"
                    placeholder="e.g. GRADE 1"
                    value={modal.data.grade_level || ''}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, grade_level: e.target.value.toUpperCase() }
                      }))
                    }
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Number of Classrooms</label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={modal.data.num_classrooms}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        data: { ...m.data, num_classrooms: Number(e.target.value) }
                      }))
                    }
                  />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.msg && (
        <div className={`toast ${toast.type === 'danger' ? 'toast-danger' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;