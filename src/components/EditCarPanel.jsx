import { FaTimes, FaCheck } from 'react-icons/fa'

export default function EditCarPanel({ car, hospitalOptions = [], onChange, onSave, onClose }) {
  if (!car) return null

  const fallbackId =
    car.hospitalName
      ? hospitalOptions.find((opt) => opt.name === car.hospitalName)?.id || ''
      : ''
  const selectedHospitalId = car.hospitalId || fallbackId || ''

  const handleHospitalChange = (e) => {
    const nextId = e.target.value
    const selected = hospitalOptions.find((opt) => opt.id === nextId) || {}
    onChange({
      ...car,
      hospitalId: nextId,
      medInstitutionId: nextId,
      hospitalName: selected.name || '',
      hospital: selected.name || car.hospital
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="side-header with-actions">
          <span>Редактирование машины</span>
          <div className="actions">
            <button className="icon-btn success" title="Сохранить" onClick={onSave}><FaCheck /></button>
            <button className="icon-btn danger" title="Закрыть" onClick={onClose}><FaTimes /></button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <div className="label">Госномер</div>
            <input
              className="field-input outline"
              value={car.regNum || ''}
              onChange={(e) => onChange({ ...car, regNum: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div className="label">GPS-трекер</div>
            <input
              className="field-input outline"
              value={car.gpsTracker || ''}
              onChange={(e) => onChange({ ...car, gpsTracker: e.target.value })}
            />
          </div>

          <div className="form-group">
            <div className="label">Медорганизация</div>
            {hospitalOptions.length ? (
              <select
                className="field-input outline"
                value={selectedHospitalId}
                onChange={handleHospitalChange}
              >
                {hospitalOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            ) : (
              <input
                className="field-input outline"
                value={car.hospitalName || car.hospital || ''}
                readOnly
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

