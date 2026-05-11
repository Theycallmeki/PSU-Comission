import React, { useState, useEffect, useCallback } from 'react';
import { enrollmentsApi } from '../api/api';

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
  const [modal, setModal] = useState({ open: false, mode: 'add', data: defaultForm, editId: null });
  const [detailRow, setDetailRow] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await enrollmentsApi.getAll();
      setEnrollments(data || []);
    } catch (err) {
      setError('Failed to load enrollments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const openAdd = () => setModal({ open: true, mode: 'add', data: defaultForm, editId: null });
  const openEdit = (e) => {
    setDetailRow(null);
    setModal({ open: true, mode: 'edit', data: { ...e }, editId: e.id });
  };
  const closeModal = () => setModal({ open: false, mode: 'add', data: defaultForm, editId: null });

  const handleFieldChange = (field, value) => {
    setModal((m) => {
      const updated = { ...m.data, [field]: value };
      return { ...m, data: computeTotals(updated) };
    });
  };

  const handleSave = async () => {
    const { mode, data, editId } = modal;
    if (!data.school_year.trim()) { setError('School year is required.'); return; }
    setError('');
    try {
      if (mode === 'add') {
        const created = await enrollmentsApi.create(data);
        setEnrollments((prev) => [...prev, created]);
        showToast('Enrollment record added.');
      } else {
        const updated = await enrollmentsApi.update(editId, data);
        setEnrollments((prev) => prev.map((e) => (e.id === editId ? updated : e)));
        showToast('Enrollment record updated.');
      }
      closeModal();
    } catch (err) {
      setError('Failed to save enrollment record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment record?')) return;
    try {
      await enrollmentsApi.delete(id);
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
      if (detailRow?.id === id) setDetailRow(null);
      showToast('Enrollment record removed.');
    } catch (err) {
      setError('Failed to delete enrollment record.');
    }
  };

  const filtered = enrollments.filter((e) =>
    e.school_year.toLowerCase().includes(search.toLowerCase())
  );

  const totalAllEnrollees = enrollments.reduce((s, e) => s + Number(e.total_enrollees || 0), 0);
  const totalDropped = enrollments.reduce((s, e) => s + Number(e.dropped_repeater || 0), 0);

  const s = {
    page: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' },
    title: { color: '#2c3e50', marginBottom: '4px', fontSize: '22px', fontWeight: 600 },
    sub: { color: '#7f8c8d', marginBottom: '24px', fontSize: '14px' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
    statCard: { background: '#f8f9fa', borderRadius: '8px', padding: '16px' },
    statLabel: { fontSize: '12px', color: '#7f8c8d', marginBottom: '4px' },
    statVal: { fontSize: '22px', fontWeight: 600, color: '#2c3e50' },
    toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    searchInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ecf0f1', fontSize: '14px', width: '220px', color: '#2c3e50' },
    btnAdd: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ecf0f1', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#2c3e50', fontWeight: 500 },
    tableWrap: { border: '1px solid #ecf0f1', borderRadius: '8px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
    th: { padding: '10px 14px', color: '#7f8c8d', fontWeight: 500, fontSize: '13px', background: '#f8f9fa', borderBottom: '1px solid #ecf0f1' },
    td: { padding: '12px 14px', borderBottom: '1px solid #ecf0f1', color: '#2c3e50' },
    iconBtn: (variant) => ({
      background: 'none', border: '1px solid #ecf0f1', borderRadius: '6px', padding: '5px 8px',
      cursor: 'pointer', fontSize: '14px', marginLeft: '6px',
      color: variant === 'del' ? '#e74c3c' : variant === 'view' ? '#2980b9' : '#7f8c8d',
    }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, overflowY: 'auto' },
    modal: { background: '#fff', borderRadius: '10px', padding: '24px', width: '520px', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' },
    modalTitle: { fontSize: '16px', fontWeight: 600, color: '#2c3e50', marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', color: '#7f8c8d', marginBottom: '4px' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ecf0f1', fontSize: '14px', color: '#2c3e50', backgroundColor: '#ffffff', boxSizing: 'border-box', marginBottom: '12px' },
    gradeRow: { display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px', gap: '8px', alignItems: 'center', marginBottom: '8px' },
    gradeLabel: { fontSize: '13px', color: '#2c3e50', fontWeight: 500 },
    gradeTotal: { fontSize: '13px', color: '#7f8c8d', textAlign: 'center' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' },
    btnCancel: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ecf0f1', background: 'none', fontSize: '14px', cursor: 'pointer', color: '#7f8c8d' },
    btnSave: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ecf0f1', background: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 600, color: '#2c3e50' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', background: '#2c3e50', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', zIndex: 200 },
    errorBox: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' },
    detailBox: { border: '1px solid #ecf0f1', borderRadius: '8px', padding: '20px', marginTop: '20px' },
    detailTitle: { fontSize: '15px', fontWeight: 600, color: '#2c3e50', marginBottom: '12px' },
    detailTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    detailTh: { padding: '8px 10px', background: '#f8f9fa', color: '#7f8c8d', fontWeight: 500, borderBottom: '1px solid #ecf0f1', textAlign: 'left' },
    detailTd: { padding: '8px 10px', borderBottom: '1px solid #ecf0f1', color: '#2c3e50' },
  };

  return (
    <div style={s.page}>
      <h1 style={s.title}>Enrollments</h1>
      <p style={s.sub}>View and manage student enrollment statistics.</p>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.summaryGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}>School Years on Record</div>
          <div style={s.statVal}>{enrollments.length}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Total Enrollees (All Years)</div>
          <div style={s.statVal}>{totalAllEnrollees.toLocaleString()}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Total Dropped / Repeaters</div>
          <div style={s.statVal}>{totalDropped.toLocaleString()}</div>
        </div>
      </div>

      <div style={s.toolbar}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search school year..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={s.btnAdd} onClick={openAdd}>+ Add Record</button>
      </div>

      {loading ? (
        <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Loading enrollment data...</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>School Year</th>
                <th style={s.th}>Total Enrollees</th>
                <th style={s.th}>Dropped / Repeater</th>
                <th style={{ ...s.th, width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #ecf0f1', background: detailRow?.id === e.id ? '#f0f7ff' : 'transparent' }}>
                  <td style={s.td}>{e.school_year}</td>
                  <td style={s.td}>{Number(e.total_enrollees).toLocaleString()}</td>
                  <td style={s.td}>{e.dropped_repeater ?? '—'}</td>
                  <td style={s.td}>
                    <button style={s.iconBtn('view')} onClick={() => setDetailRow(detailRow?.id === e.id ? null : e)} title="View Details">🔍</button>
                    <button style={s.iconBtn('edit')} onClick={() => openEdit(e)} title="Edit">✏️</button>
                    <button style={s.iconBtn('del')} onClick={() => handleDelete(e.id)} title="Delete">🗑</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ ...s.td, textAlign: 'center', color: '#95a5a6' }}>No enrollment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detailRow && (
        <div style={s.detailBox}>
          <div style={s.detailTitle}>Breakdown — {detailRow.school_year}</div>
          <table style={s.detailTable}>
            <thead>
              <tr>
                <th style={s.detailTh}>Grade Level</th>
                <th style={s.detailTh}>Female</th>
                <th style={s.detailTh}>Male</th>
                <th style={s.detailTh}>Total</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_FIELDS.map(({ key, label }) => (
                <tr key={key}>
                  <td style={s.detailTd}>{label}</td>
                  <td style={s.detailTd}>{detailRow[`${key}_f`] ?? '—'}</td>
                  <td style={s.detailTd}>{detailRow[`${key}_m`] ?? '—'}</td>
                  <td style={s.detailTd}>{detailRow[`${key}_total`] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{modal.mode === 'add' ? 'Add Enrollment Record' : 'Edit Enrollment Record'}</div>

            <label style={s.label}>School Year</label>
            <input
              style={s.input}
              type="text"
              placeholder="e.g. 2024 - 2025"
              value={modal.data.school_year || ''}
              onChange={(e) => handleFieldChange('school_year', e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Grade</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>Female</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>Male</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d', textAlign: 'center' }}>Total</span>
            </div>

            {GRADE_FIELDS.map(({ key, label }) => (
              <div key={key} style={s.gradeRow}>
                <span style={s.gradeLabel}>{label}</span>
                <input
                  type="number" min={0}
                  style={{ ...s.input, marginBottom: 0, textAlign: 'center' }}
                  value={modal.data[`${key}_f`] ?? ''}
                  onChange={(e) => handleFieldChange(`${key}_f`, e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <input
                  type="number" min={0}
                  style={{ ...s.input, marginBottom: 0, textAlign: 'center' }}
                  value={modal.data[`${key}_m`] ?? ''}
                  onChange={(e) => handleFieldChange(`${key}_m`, e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <span style={s.gradeTotal}>{modal.data[`${key}_total`]}</span>
              </div>
            ))}

            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={s.label}>Total Enrollees</label>
                <input style={{ ...s.input, background: '#f8f9fa' }} type="number" value={modal.data.total_enrollees} readOnly />
              </div>
              <div>
                <label style={s.label}>Dropped / Repeater</label>
                <input
                  style={s.input} type="number" min={0}
                  value={modal.data.dropped_repeater ?? ''}
                  onChange={(e) => handleFieldChange('dropped_repeater', e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              </div>
            </div>

            <div style={s.modalActions}>
              <button style={s.btnCancel} onClick={closeModal}>Cancel</button>
              <button style={s.btnSave} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
};

export default EnrollmentPage;