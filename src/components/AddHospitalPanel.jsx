import { FaTimes, FaCheck, FaAmbulance, FaUsers, FaPlus } from 'react-icons/fa'

export default function AddHospitalPanel({ open, value, onChange, onAddCar, onAddUser, onSave, onClose }) {
  if (!open) return null

  return (
    <aside className="side-panel right overlay">
      <div className="side-header with-actions">
        <span>Новая медорганизация</span>
        <div className="actions">
          <button className="icon-btn success" title="Сохранить" type="button" onClick={onSave}>
            <FaCheck />
          </button>
          <button className="icon-btn danger" title="Закрыть" type="button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="form-group">
        <input
          className="field-input outline"
          placeholder="Название медорганизации"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <div className="two-cols">
        <div className="col">
          <div className="col-header">
            <FaAmbulance />
            <span>Машины</span>
          </div>
          <button className="add-btn ghost" type="button" onClick={onAddCar}>
            <FaPlus />
            <span>Добавить машину</span>
          </button>
        </div>
        <div className="col">
          <div className="col-header">
            <FaUsers />
            <span>Сотрудники</span>
          </div>
          <button className="add-btn ghost" type="button" onClick={onAddUser}>
            <FaPlus />
            <span>Добавить сотрудника</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
