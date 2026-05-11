// src/pages/enrollment/EnrollmentAddModal.jsx
import { useState } from 'react'
import { X, PlusCircle } from 'lucide-react'

export default function EnrollmentAddModal({ schoolYear, onClose, onAdd }) {
  const [form, setForm] = useState({
    grade: '',
    total: '',
    male: '',
    female: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const errs = {}

    if (!form.grade.trim()) errs.grade = 'Grade level is required.'
    if (form.total === '') errs.total = 'Total is required.'
    if (form.male === '') errs.male = 'Male count is required.'
    if (form.female === '') errs.female = 'Female count is required.'

    const m = Number(form.male)
    const f = Number(form.female)
    const t = Number(form.total)

    if (!errs.male && !errs.female && !errs.total && m + f !== t) {
      errs.total = 'Total must equal Male + Female.'
    }

    return errs
  }

  const handleAdd = () => {
    const errs = validate()

    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    if (onAdd) {
      onAdd({
        grade: form.grade.trim(),
        total: Number(form.total),
        male: Number(form.male),
        female: Number(form.female),
      })
    }

    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Record</h2>
            <p className="modal-sub">
              New grade-level entry{schoolYear ? ` — ${schoolYear}` : ''}
            </p>
          </div>

          <button
            className="modal-icon-btn"
            title="Close"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Grade Level</label>
            <input
              className={`modal-input${errors.grade ? ' modal-input--error' : ''}`}
              value={form.grade}
              onChange={e => handleChange('grade', e.target.value)}
              placeholder="e.g. Grade 7"
            />
            {errors.grade && (
              <span className="modal-error">{errors.grade}</span>
            )}
          </div>

          <div className="modal-row-3">
            {['total', 'male', 'female'].map(field => (
              <div className="modal-field" key={field}>
                <label className="modal-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>

                <input
                  type="number"
                  min={0}
                  className={`modal-input${errors[field] ? ' modal-input--error' : ''}`}
                  value={form[field]}
                  onChange={e => handleChange(field, e.target.value)}
                  placeholder="0"
                />

                {errors[field] && (
                  <span className="modal-error">{errors[field]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="modal-btn ghost" onClick={onClose}>
            Cancel
          </button>

          <button className="modal-btn primary" onClick={handleAdd}>
            <PlusCircle size={14} />
            Add Record
          </button>
        </div>

      </div>
    </div>
  )
}