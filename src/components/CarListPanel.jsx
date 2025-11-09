import {
  FaTimes,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaLink,
  FaUnlink,
  FaUser,
  FaHospital,
  FaSignOutAlt,
  FaCheck
} from 'react-icons/fa'

export default function CarListPanel({
  open,
  cars = [],
  hospitalOptions = [],
  orgSearchValue,
  carSearchValue,
  selectedHospitals = [],
  onOrgSearchChange,
  onCarSearchChange,
  onHospitalSelect,
  onHospitalRemove,
  onClearFilter,
  onClose,
  onEditCar,
  onDeleteCar,
  onBindTracker,
  onUnbindTracker,
  currentHospitalName,
  currentUserName,
  onLogout
}) {
  if (!open) return null

  const orgValue = orgSearchValue ?? ''
  const carValue = carSearchValue ?? ''
  const trimmed = orgValue.trim()
  const suggestions = trimmed
    ? hospitalOptions
        .filter((opt) =>
          opt.name.toLowerCase().includes(trimmed.toLowerCase())
        )
        .slice(0, 6)
    : []
  const hasSelection = selectedHospitals.length > 0

  return (
    <aside className="side-panel left car-panel">
      <div className="side-header with-actions">
        <span>Машины</span>
        <div className="actions">
          <button className="text-btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>

      <div className="panel-fields">
        <span className="field-label">Фильтр по медорганизации</span>
        <div className="field typeahead">
          <input
            className="field-input"
            placeholder="Начните вводить название больницы"
            value={orgValue}
            onChange={(e) => onOrgSearchChange?.(e.target.value)}
          />
          {trimmed && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((option) => (
                <button
                  key={option.id}
                  className="suggestion"
                  type="button"
                  onClick={() => onHospitalSelect?.(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasSelection && (
          <div className="selected-filters">
            {selectedHospitals.map((hospital) => (
              <div className="selected-filter" key={hospital.id}>
                <span className="checkbox checked">
                  <FaCheck size={12} />
                </span>
                <span>{hospital.name}</span>
                <button
                  className="icon-btn"
                  title="Убрать из фильтра"
                  type="button"
                  onClick={() => onHospitalRemove?.(hospital.id)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              className="text-btn clear-filters"
              type="button"
              onClick={onClearFilter}
            >
              Сбросить все
            </button>
          </div>
        )}

        <span className="field-label">Поиск машины по номеру</span>
        <div className="field">
          <input
            className="field-input"
            placeholder="Например, А123БВ"
            value={carValue}
            onChange={(e) => onCarSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <div className="car-list">
        {cars.length === 0 && (
          <div className="empty-placeholder">Нет машин для отображения</div>
        )}
        {cars.map((car) => (
          <div className="car-row" key={car.carId || car.id || car.regNum}>
            <div className="car-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="car-info">
              <div className="car-regnum">{car.regNum || 'Без номера'}</div>
              <div className="car-gpslabel">
                {car.gpsTracker ? `GPS: ${car.gpsTracker}` : 'GPS не привязан'}
              </div>
            </div>
            <div className="row-actions">
              {car.gpsTracker ? (
                <button
                  className="icon-btn"
                  title="Отвязать трекер"
                  type="button"
                  onClick={() => onUnbindTracker?.(car)}
                >
                  <FaUnlink />
                </button>
              ) : (
                <button
                  className="icon-btn"
                  title="Привязать трекер"
                  type="button"
                  onClick={() => onBindTracker?.(car)}
                >
                  <FaLink />
                </button>
              )}
              <button
                className="icon-btn"
                title="Редактировать"
                type="button"
                onClick={() => onEditCar?.(car)}
              >
                <FaEdit />
              </button>
              <button
                className="icon-btn danger"
                title="Удалить"
                type="button"
                onClick={() => onDeleteCar?.(car)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-footer">
        <div className="panel-footer-info meta-block">
          <div className="meta-row">
            <div className="meta-icon">
              <FaUser />
            </div>
            <div className="meta-text">{currentUserName || 'Нет пользователя'}</div>
          </div>
          <div className="meta-row">
            <div className="meta-icon">
              <FaHospital />
            </div>
            <div className="meta-text">{currentHospitalName || 'Нет организации'}</div>
          </div>
        </div>
        <button className="icon-btn" title="Выйти" type="button" onClick={onLogout}>
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  )
}
