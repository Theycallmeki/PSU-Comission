import React, { useState, useEffect, useCallback } from 'react';
import { classroomsApi } from '../api/api';

const GRADE_LEVELS = ['KINDER', 'GRADE 1', 'GRADE 2', 'GRADE 3', 'GRADE 4', 'GRADE 5', 'GRADE 6'];

const defaultForm = { grade_level: 'KINDER', num_classrooms: 1 };

const ClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'add', data: defaultForm, editId: null });
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classroomsApi.getAll();
      setClassrooms(data || []);
    } catch (err) {
      setError('Failed to load classrooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);

  const openAdd = () => setModal({ open: true, mode: 'add', data: defaultForm, editId: null });
  const openEdit = (c) => setModal({ open: true, mode: 'edit', data: { grade_level: c.grade_level, num_classrooms: c.num_classrooms }, editId: c.id });
  const closeModal = () => setModal({ open: false, mode: 'add', data: defaultForm, editId: null });

  const handleSave = async () => {
    const { mode, data, editId } = modal;
    try {
      if (mode === 'add') {
        const created = await classroomsApi.create(data);
        setClassrooms((prev) => [...prev, created]);
        showToast('Classroom added.');
      } else {
        const updated = await classroomsApi.update(editId, data);
        setClassrooms((prev) => prev.map((c) => (c.id === editId ? updated : c)));
        showToast('Classroom updated.');
      }
      closeModal();
    } catch (err) {
      setError('Failed to save classroom.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this classroom?')) return;
    try {
      await classroomsApi.delete(id);
      setClassrooms((prev) => prev.filter((c) => c.id !== id));
      showToast('Classroom removed.');
    } catch (err) {
      setError('Failed to delete classroom.');
    }
  };

  const filtered = classrooms.filter((c) =>
    c.grade_level.toLowerCase().includes(search.toLowerCase())
  );

  const totalClassrooms = classrooms.reduce((s, c) => s + Number(c.num_classrooms), 0);
  const avgPerLevel = classrooms.length ? (totalClassrooms / classrooms.length).toFixed(1) : '0';

  const styles = {
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
    badge: (grade) => ({
      display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
      background: grade === 'KINDER' ? '#EDE9FE' : '#D1FAE5',
      color: grade === 'KINDER' ? '#5B21B6' : '#065F46',
    }),
    iconBtn: (variant) => ({
      background: 'none', border: '1px solid #ecf0f1', borderRadius: '6px', padding: '5px 8px',
      cursor: 'pointer', fontSize: '14px', color: variant === 'del' ? '#e74c3c' : '#7f8c8d',
      marginLeft: '6px',
    }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
    modal: { background: '#fff', borderRadius: '10px', padding: '24px', width: '340px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
    modalTitle: { fontSize: '16px', fontWeight: 600, color: '#2c3e50', marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', color: '#7f8c8d', marginBottom: '6px' },
    input: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ecf0f1', fontSize: '14px', color: '#2c3e50', boxSizing: 'border-box', marginBottom: '14px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' },
    btnCancel: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ecf0f1', background: 'none', fontSize: '14px', cursor: 'pointer', color: '#7f8c8d' },
    btnSave: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ecf0f1', background: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 600, color: '#2c3e50' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', background: '#2c3e50', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', zIndex: 200 },
    error: { background: '#fdecea', color: '#c0392b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Classrooms</h1>
      <p style={styles.sub}>Manage classroom allocations and grade levels.</p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Grade Levels</div>
          <div style={styles.statVal}>{classrooms.length}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Classrooms</div>
          <div style={styles.statVal}>{totalClassrooms}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg per Level</div>
          <div style={styles.statVal}>{avgPerLevel}</div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search grade level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.btnAdd} onClick={openAdd}>+ Add Classroom</button>
      </div>

      {loading ? (
        <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Loading classroom data...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Grade Level</th>
                <th style={styles.th}>No. of Classrooms</th>
                <th style={{ ...styles.th, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((c) => (
                <tr key={c.id}>
                  <td style={styles.td}>
                    <span style={styles.badge(c.grade_level)}>{c.grade_level}</span>
                  </td>
                  <td style={styles.td}>{c.num_classrooms}</td>
                  <td style={styles.td}>
                    <button style={styles.iconBtn('edit')} onClick={() => openEdit(c)} title="Edit">✏️</button>
                    <button style={styles.iconBtn('del')} onClick={() => handleDelete(c.id)} title="Delete">🗑</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ ...styles.td, textAlign: 'center', color: '#95a5a6' }}>No classrooms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{modal.mode === 'add' ? 'Add Classroom' : 'Edit Classroom'}</div>

            <label style={styles.label}>Grade Level</label>
            <select
              style={styles.input}
              value={modal.data.grade_level}
              onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, grade_level: e.target.value } }))}
            >
              {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <label style={styles.label}>Number of Classrooms</label>
            <input
              style={styles.input}
              type="number"
              min={1}
              value={modal.data.num_classrooms}
              onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, num_classrooms: parseInt(e.target.value) || 1 } }))}
            />

            <div style={styles.modalActions}>
              <button style={styles.btnCancel} onClick={closeModal}>Cancel</button>
              <button style={styles.btnSave} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
};

export default ClassroomPage;