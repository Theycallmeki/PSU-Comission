import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'antd';
import {
  Plus,
  School,
  Search,
  X,
  Trash2,
  Save,
  Info
} from 'lucide-react';
import { enrollmentsApi } from '../api/api';
import '../styles/EnrollPage.css';

const GRADE_FIELDS = [
  { key: 'kinder', label: 'Kinder' },
  { key: 'grade1', label: 'Grade 1' },
  { key: 'grade2', label: 'Grade 2' },
  { key: 'grade3', label: 'Grade 3' },
  { key: 'grade4', label: 'Grade 4' },
  { key: 'grade5', label: 'Grade 5' },
  { key: 'grade6', label: 'Grade 6' },
];

const defaultForm = {
  school_year: '',
  kinder_f: 0, kinder_m: 0, kinder_total: 0,
  grade1_f: 0, grade1_m: 0, grade1_total: 0,
  grade2_f: 0, grade2_m: 0, grade2_total: 0,
  grade3_f: 0, grade3_m: 0, grade3_total: 0,
  grade4_f: 0, grade4_m: 0, grade4_total: 0,
  grade5_f: 0, grade5_m: 0, grade5_total: 0,
  grade6_f: 0, grade6_m: 0, grade6_total: 0,
  total_enrollees: 0,
  dropped_repeater: 0,
};

const computeTotals = (form) => {
  const updated = { ...form };
  let grandTotal = 0;

  GRADE_FIELDS.forEach(({ key }) => {
    const f = parseInt(updated[`${key}_f`]) || 0;
    const m = parseInt(updated[`${key}_m`]) || 0;
    updated[`${key}_total`] = f + m;
    grandTotal += f + m;
  });

  updated.total_enrollees = grandTotal;
  return updated;
};

const EnrollmentPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState({
    open: false,
    type: null,
    data: defaultForm,
    editId: null
  });

  // ✅ PLACE IT HERE (same level as other states)
  const [editForm, setEditForm] = useState(null);

  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enrollmentsApi.getAll();
      setEnrollments(data || []);
    } catch {
      setError('Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const openAdd = () => {
    setModal({ open: true, type: 'form', data: defaultForm, editId: null });
  };

  const openInfo = (record) => {
    setDeleteConfirm(false);
    setModal({
      open: true,
      type: 'info',
      data: { ...record }, // IMPORTANT: editable copy
      editId: record.id
    });
  };

  const handleFieldChange = (field, value) => {
    setModal((m) => {
      const updated = {
        ...m.data,
        [field]: value
      };
  
      return {
        ...m,
        data: computeTotals(updated)
      };
    });
  };

  const closeModal = () => {
    setModal({ open: false, type: null, data: defaultForm, editId: null });
    setEditForm(null);
    setDeleteConfirm(false);
  };

  const handleSave = async () => {
    const { data, editId } = modal;

    if (!data.school_year.trim()) {
      setError('School year is required.');
      return;
    }

    try {
      if (editId) {
        const updated = await enrollmentsApi.update(editId, data);
        setEnrollments((prev) =>
          prev.map((e) => (e.id === editId ? updated : e))
        );
        showToast('Enrollment updated.');
      } else {
        const created = await enrollmentsApi.create(data);
        setEnrollments((prev) => [...prev, created]);
        showToast('Enrollment added.');
      }

      closeModal();
    } catch {
      setError('Failed to save enrollment.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await enrollmentsApi.delete(id);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
      showToast('Enrollment deleted.');
      closeModal();
    } catch {
      setError('Failed to delete enrollment.');
    }
  };

  const filtered = enrollments.filter((e) =>
    e.school_year.toLowerCase().includes(search.toLowerCase())
  );

  const totalEnrollees = enrollments.reduce(
    (s, e) => s + Number(e.total_enrollees || 0),
    0
  );

  const totalDropped = enrollments.reduce(
    (s, e) => s + Number(e.dropped_repeater || 0),
    0
  );

  const columns = [
    {
      title: 'School Year',
      dataIndex: 'school_year',
      align: 'center',
    },
    {
      title: 'Total Enrollees',
      dataIndex: 'total_enrollees',
      align: 'center',
      render: (val) => Number(val).toLocaleString(),
    },
    {
      title: 'Dropped / Repeaters',
      dataIndex: 'dropped_repeater',
      align: 'center',
      render: (val) => val ?? '—',
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
            <School size={22} color="#fff" />
          </div>

          <div>
            <h1 className="title">Enrollments</h1>
            <p className="sub">Manage student enrollment statistics.</p>
          </div>
        </div>

        <button className="addBtn" onClick={openAdd}>
          <Plus size={15} style={{ marginRight: 5 }} />
          Add Record
        </button>
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
          <div className="label">Total Records</div>
          <div className="value">{enrollments.length}</div>
        </div>

        <div className="card">
          <div className="label">Total Enrollees</div>
          <div className="value">{totalEnrollees.toLocaleString()}</div>
        </div>

        <div className="card">
          <div className="label">Total Dropped</div>
          <div className="value">{totalDropped.toLocaleString()}</div>
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
      {modal.open && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">

            <div className="modal-header">
              <h2 className="modal-title">
                {modal.type === 'info' ? 'Enrollment Details' : 'Add Enrollment'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

{/* INFO (EDITABLE) */}
{modal.type === 'info' && (
  <>
    <div className="modal-body">

      {/* SCHOOL YEAR */}
      <div className="form-field">
        <label>School Year</label>
        <input
          className="form-input"
          value={modal.data.school_year}
          onChange={(e) =>
            handleFieldChange('school_year', e.target.value)
          }
        />
      </div>

      {/* HEADER */}
      <div className="grade-row header">
        <span>Grade</span>
        <span>Female</span>
        <span>Male</span>
        <span>Total</span>
      </div>

      {/* GRADE INPUTS */}
      {GRADE_FIELDS.map(({ key, label }) => (
        <div key={key} className="grade-row">

          <span>{label}</span>

          <input
            className="form-input"
            type="number"
            value={modal.data[`${key}_f`] || ''}
            onChange={(e) =>
              handleFieldChange(
                `${key}_f`,
                parseInt(e.target.value || 0)
              )
            }
          />

          <input
            className="form-input"
            type="number"
            value={modal.data[`${key}_m`] || ''}
            onChange={(e) =>
              handleFieldChange(
                `${key}_m`,
                parseInt(e.target.value || 0)
              )
            }
          />

          <span style={{ textAlign: 'center', fontWeight: 600 }}>
            {modal.data[`${key}_total`]}
          </span>

        </div>
      ))}

      {/* DROPPED */}
      <div className="form-field">
        <label>Dropped / Repeaters</label>
        <input
          className="form-input"
          type="number"
          value={modal.data.dropped_repeater || 0}
          onChange={(e) =>
            handleFieldChange(
              'dropped_repeater',
              parseInt(e.target.value || 0)
            )
          }
        />
      </div>

      {/* TOTAL */}
      <div className="info-row">
        <span className="info-label">Total Enrollees</span>
        <span style={{ fontWeight: 600 }}>
          {modal.data.total_enrollees}
        </span>
      </div>

    </div>

    {/* FOOTER (OUTSIDE SCROLL — THIS IS THE FIX) */}
    <div className="modal-footer">

    {deleteConfirm ? (
  <div className="confirm-delete">
    <span>Are you sure?</span>

    <button
      className="btn btn-danger"
      onClick={() => handleDelete(modal.editId)}
    >
      <Trash2 size={14} /> Yes, Delete
    </button>

    <button
      className="btn btn-ghost"
      onClick={() => setDeleteConfirm(false)}
    >
      Cancel
    </button>
  </div>
) : (
  <button
    className="btn btn-danger-outline"
    onClick={() => setDeleteConfirm(true)}
  >
    <Trash2 size={14} /> Delete
  </button>
)}

      <button className="btn btn-ghost" onClick={closeModal}>
        Close
      </button>

      <button className="btn btn-primary" onClick={handleSave}>
        <Save size={14} /> Update
      </button>

    </div>
  </>
)}

                    {/* FORM (ADD / CREATE - SAME AS INFO LAYOUT BUT EMPTY) */}
                    {modal.type === 'form' && (
                      <>

                        <div className="modal-body">

                          {/* SCHOOL YEAR */}
                          <div className="form-field">
                            <label>School Year</label>
                            <input
                              className="form-input"
                              value={modal.data.school_year || ''}
                              onChange={(e) =>
                                setModal((m) => ({
                                  ...m,
                                  data: {
                                    ...m.data,
                                    school_year: e.target.value
                                  }
                                }))
                              }
                              placeholder="e.g. 2025-2026"
                            />
                          </div>

                          {/* HEADER (same as INFO modal) */}
                          <div className="grade-row header" style={{ fontWeight: 600, marginBottom: 8 }}>
                            <span>Grade</span>
                            <span>Female</span>
                            <span>Male</span>
                            <span>Total</span>
                          </div>

                          {/* GRADE INPUTS (EMPTY VALUES) */}
                          {GRADE_FIELDS.map(({ key, label }) => (
                            <div key={key} className="grade-row">

                              <span>{label}</span>

                              <input
                                className="form-input"
                                type="number"
                                value={modal.data[`${key}_f`] || 0}
                                onChange={(e) =>
                                  setModal((m) => {
                                    const updated = {
                                      ...m.data,
                                      [`${key}_f`]: parseInt(e.target.value || 0)
                                    };
                                    return {
                                      ...m,
                                      data: computeTotals(updated)
                                    };
                                  })
                                }
                              />

                              <input
                                className="form-input"
                                type="number"
                                value={modal.data[`${key}_m`] || 0}
                                onChange={(e) =>
                                  setModal((m) => {
                                    const updated = {
                                      ...m.data,
                                      [`${key}_m`]: parseInt(e.target.value || 0)
                                    };
                                    return {
                                      ...m,
                                      data: computeTotals(updated)
                                    };
                                  })
                                }
                              />

                              <span style={{ textAlign: 'center', fontWeight: 600 }}>
                                {modal.data[`${key}_total`] || 0}
                              </span>

                            </div>
                          ))}

                          {/* DROPPED / REPEATERS */}
                          <div className="form-field">
                            <label>Dropped / Repeaters</label>
                            <input
                              className="form-input"
                              type="number"
                              value={modal.data.dropped_repeater || 0}
                              onChange={(e) =>
                                setModal((m) => ({
                                  ...m,
                                  data: {
                                    ...m.data,
                                    dropped_repeater: parseInt(e.target.value || 0)
                                  }
                                }))
                              }
                            />
                          </div>

                          {/* TOTAL DISPLAY */}
                          <div className="info-row">
                            <span className="info-label">Total Enrollees</span>
                            <span style={{ fontWeight: 600 }}>
                              {modal.data.total_enrollees || 0}
                            </span>
                          </div>

                        </div>

                        {/* FOOTER (MATCH INFO MODAL STYLE) */}
                        <div className="modal-footer">

                          <button className="btn btn-ghost" onClick={closeModal}>
                            Cancel
                          </button>

                          <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={14} /> Save
                          </button>

                        </div>

                      </>
                    )}

          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default EnrollmentPage;