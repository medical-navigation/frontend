import {
  FaHospital,
  FaChevronDown,
  FaChevronRight,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaUser,
  FaLink,
  FaUnlink
} from 'react-icons/fa'

export default function HospitalManagementPanel({
  open,
  hospitals = [],
  carsByHospital = {},
  usersByHospital = {},
  expandedHospitalId,
  onToggleHospital,
  onAddHospital,
  onEditHospital,
  onDeleteHospital,
  onAddUser,
  onAddCar,
  onEditCar,
  onDeleteCar,
  onBindTracker,
  onUnbindTracker,
  onEditUser,
  onDeleteUser,
  onClose
}) {
  if (!open) return null

  const renderCarRow = (car) => (
    <div className="car-row compact" key={car.carId || car.id}>
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
            type="button"
            title="Отвязать трекер"
            onClick={() => onUnbindTracker?.(car)}
          >
            <FaUnlink />
          </button>
        ) : (
          <button
            className="icon-btn"
            type="button"
            title="Привязать трекер"
            onClick={() => onBindTracker?.(car)}
          >
            <FaLink />
          </button>
        )}
        <button
          className="icon-btn"
          type="button"
          title="Редактировать"
          onClick={() => onEditCar?.(car)}
        >
          <FaEdit />
        </button>
        <button
          className="icon-btn danger"
          type="button"
          title="Удалить"
          onClick={() => onDeleteCar?.(car)}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )

  const renderUserRow = (user) => (
    <div className="user-row-card compact" key={user.userId || user.id}>
      <div className="user-icon">
        <FaUser />
      </div>
      <div className="user-info">
        <div className="user-name-strong">{user.login}</div>
        <div className="user-hospital">{user.hospitalName || 'Без организации'}</div>
      </div>
      <div className="row-actions">
        <button
          className="icon-btn"
          type="button"
          title="Редактировать"
          onClick={() => onEditUser?.(user)}
        >
          <FaEdit />
        </button>
        <button
          className="icon-btn danger"
          type="button"
          title="Удалить"
          onClick={() => onDeleteUser?.(user)}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )

  return (
    <aside className="side-panel right user-panel">
      <div className="side-header with-actions">
        <span>Медорганизации</span>
        <div className="actions">
          <button className="text-btn" type="button" onClick={onClose}>Закрыть</button>
        </div>
      </div>

      <div className="panel-actions stretch">
        <button className="add-btn" type="button" onClick={onAddHospital}>
          <FaHospital /> <span>Добавить медорганизацию</span>
        </button>
      </div>

      <div className="hospital-list grow">
        {hospitals.length === 0 && (
          <div className="empty-placeholder">Нет медорганизаций</div>
        )}

        {hospitals.map((hospital) => {
          const isExpanded = expandedHospitalId === hospital.id
          const cars = carsByHospital[hospital.id] || []
          const staff = usersByHospital[hospital.id] || []

          return (
            <div key={hospital.id} className="hospital-group">
              <div className="hospital-row">
                <div className="hospital-icon">
                  <FaHospital />
                </div>
                <div className="hospital-name">{hospital.name}</div>
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    type="button"
                    title={isExpanded ? 'Свернуть детали' : 'Показать детали'}
                    onClick={() => onToggleHospital?.(hospital.id)}
                  >
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    title="Редактировать"
                    onClick={() => onEditHospital?.(hospital)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    title="Удалить"
                    onClick={() => onDeleteHospital?.(hospital)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="hospital-detail">
                  <div className="detail-section">
                    <div className="section-header">
                      <div className="section-title">Машины</div>
                      <button
                        className="text-btn"
                        type="button"
                        onClick={() => onAddCar?.(hospital)}
                      >
                        + Добавить
                      </button>
                    </div>
                    {cars.length === 0 ? (
                      <div className="empty-placeholder">Нет машин</div>
                    ) : (
                      cars.map(renderCarRow)
                    )}
                  </div>
                  <div className="detail-section">
                    <div className="section-header">
                      <div className="section-title">Сотрудники</div>
                      <button
                        className="text-btn"
                        type="button"
                        onClick={() => onAddUser?.(hospital)}
                      >
                        + Добавить
                      </button>
                    </div>
                    {staff.length === 0 ? (
                      <div className="empty-placeholder">Нет сотрудников</div>
                    ) : (
                      staff.map(renderUserRow)
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
