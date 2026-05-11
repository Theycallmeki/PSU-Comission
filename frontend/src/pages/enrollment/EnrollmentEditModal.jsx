// src/pages/enrollment/EnrollmentEditModal.jsx
import { useState } from 'react'
import { X, Trash2, Save } from 'lucide-react'

export default function EnrollmentEditModal({
  record,
  total,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState({
    grade: record.grade ?? '',
    total: record.total ?? '',
    male: record.male ?? '',
    female: record.female ?? '',
  })

  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (onSave) onSave({ ...record, ...form })
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) onDelete(record)
    onClose()
  }

  return (
    <div className="modal-overlay">

      {/* ── MAIN MODAL ── */}
      <div className="modal-box">

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Record</h2>
            <p className="modal-sub">Grade-level enrollment entry</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="modal-icon-btn danger"
              title="Delete record"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} />
            </button>

            <button
              className="modal-icon-btn"
              title="Close"
              onClick={onClose}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Grade Level</label>
            <input
              className="modal-input"
              value={form.grade}
              onChange={e => handleChange('grade', e.target.value)}
              placeholder="e.g. Grade 7"
            />
          </div>

          <div className="modal-row-3">
            <div className="modal-field">
              <label className="modal-label">Total</label>
              <input
                className="modal-input"
                type="number"
                min={0}
                value={form.total}
                onChange={e => handleChange('total', e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Male</label>
              <input
                className="modal-input"
                type="number"
                min={0}
                value={form.male}
                onChange={e => handleChange('male', e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Female</label>
              <input
                className="modal-input"
                type="number"
                min={0}
                value={form.female}
                onChange={e => handleChange('female', e.target.value)}
              />
            </div>
          </div>

          {/* Read-only % of school */}
          {total && (
            <div className="modal-field">
              <label className="modal-label">% of School</label>
              <input
                className="modal-input"
                readOnly
                value={`${((Number(form.total) / total) * 100).toFixed(1)}%`}
                style={{
                  background: '#f5f5f5',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="modal-btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button className="modal-btn primary" onClick={handleSave}>
            <Save size={14} />
            Save Changes
          </button>
        </div>

      </div>

      {/* ── DELETE CONFIRMATION OVERLAY ── */}
      {confirmDelete && (
        <div className="modal-confirm-overlay">

          <div
            className="modal-confirm-box"
            onClick={e => e.stopPropagation()}
          >

            <div className="modal-confirm-icon">
              <Trash2 size={22} />
            </div>

            <h3 className="modal-confirm-title">
              Delete Record?
            </h3>

            <p className="modal-confirm-desc">
              This will permanently remove <strong>{record.grade}</strong> from the grade-level breakdown. This action cannot be undone.
            </p>

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button
                className="modal-btn ghost"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>

              <button
                className="modal-btn danger"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}