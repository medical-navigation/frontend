import {
  FaTimes,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaLink,
  FaUnlink,
  FaUser,
  FaHospital,
  FaSignOutAlt
} from 'react-icons/fa';

export default function CarListPanel({
  open,
  cars = [],
  hospitalOptions = [],
  filterQuery,
  selectedHospital,
  onFilterQueryChange,
  onHospitalSelect,
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
  if (!open) return null;

  // Фильтрация подсказок по введённому тексту
  const suggestions = filterQuery.trim()
    ? hospitalOptions
        .filter((opt) =>
          opt.name.toLowerCase().includes(filterQuery.trim().toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <aside className="side-panel left car-panel">
      {/* Заголовок */}
      <div className="side-header with-actions">
        <span>Машины</span>
        <div className="actions">
          <button className="text-btn" onClick={onClose}>
            Скрыть
          </button>
        </div>
      </div>

      {/* Поиск и фильтр */}
      <div className="panel-fields">
        <div className="field typeahead">
          <input
            className="field-input"
            placeholder="Поиск медорганизации"
            value={filterQuery}
            onChange={(e) => onFilterQueryChange(e.target.value)}
          />
          {filterQuery && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((option) => (
                <button
                  key={option.id}
                  className="suggestion"
                  type="button"
                  onClick={() => onHospitalSelect(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Выбранный фильтр */}
        {selectedHospital && (
          <div className="selected-filter">
            <span className="checkbox checked"></span>
            <span>{selectedHospital.name}</span>
            <button className="icon-btn" title="Сбросить" onClick={onClearFilter}>
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Список машин */}
      <div className="car-list">
        {cars.length === 0 ? (
          <div className="empty-placeholder">Нет машин для отображения</div>
        ) : (
          cars.map((car) => (
            <div className="car-row" key={car.carId || car.id || car.regNum}>
              <div className="car-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="car-info">
                <div className="car-regnum">{car.regNum || 'Без номера'}</div>
                <div className="car-gpslabel">
                  {car.gpsTracker ? `GPS: ${car.gpsTracker}` : 'GPS не подключен'}
                </div>
              </div>
              <div className="row-actions">
                {car.gpsTracker ? (
                  <button
                    className="icon-btn"
                    title="Отвязать трекер"
                    onClick={() => onUnbindTracker(car)}
                  >
                    <FaUnlink />
                  </button>
                ) : (
                  <button
                    className="icon-btn"
                    title="Привязать трекер"
                    onClick={() => onBindTracker(car)}
                  >
                    <FaLink />
                  </button>
                )}
                <button
                  className="icon-btn"
                  title="Редактировать"
                  onClick={() => onEditCar(car)}
                >
                  <FaEdit />
                </button>
                <button
                  className="icon-btn danger"
                  title="Удалить"
                  onClick={() => onDeleteCar(car)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Футер: пользователь, организация, выход */}
      <div className="panel-footer">
        <div className="panel-footer-info meta-block">
          <div className="meta-row">
            <div className="meta-icon">
              <FaUser />
            </div>
            <div className="meta-text">
              {currentUserName || 'Неизвестный пользователь'}
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-icon">
              <FaHospital />
            </div>
            <div className="meta-text">
              {currentHospitalName || 'Нет организации'}
            </div>
          </div>
        </div>
        <button className="icon-btn" title="Выйти" onClick={onLogout}>
          <FaSignOutAlt />
        </button>
      </div>
    </aside>
  );
}