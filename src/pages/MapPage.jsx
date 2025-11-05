import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './pages-css.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import SearchButton from '../components/SearchButton.jsx'
import HospitalButton from '../components/HospitalButton.jsx'
import ZoomControls from '../components/ZoomControls.jsx'
import { FaSearch, FaFilter, FaRegStickyNote, FaHospital, FaPlus, FaSignOutAlt, FaUsers, FaAmbulance } from 'react-icons/fa'

// Иконка по умолчанию для маркеров Leaflet поправка путей (иначе не видно маркеров в Vite)
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadowUrl, iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = DefaultIcon

export default function MapPage({ regionBounds, regionCenter, user, hospitals = [], ambulances = [] }) {
  // regionBounds: [[southWestLat, southWestLng],[northEastLat, northEastLng]] или null
  // regionCenter: [lat, lng] если нет bounds
  // user: { login, role, hospitalName }

  const [showSearch, setShowSearch] = useState(false)
  const [showHospitals, setShowHospitals] = useState(false)
  const [filterOrg, setFilterOrg] = useState('')
  const [query, setQuery] = useState('')

  const mapBounds = useMemo(() => {
    if (regionBounds && regionBounds.length === 2) return regionBounds
    return null
  }, [regionBounds])

  const center = useMemo(() => {
    if (regionCenter) return regionCenter
    return [58.01, 56.23] // пример: Пермь
  }, [regionCenter])

  const filteredAmbulances = useMemo(() => {
    // фильтрация по орг-ции (для супер-админа) и по тексту (рег.номер)
    return ambulances.filter(a => {
      const byOrg = filterOrg ? a.hospital?.toLowerCase().includes(filterOrg.toLowerCase()) : true
      const byQuery = query ? (a.regNumber?.toLowerCase().includes(query.toLowerCase())) : true
      return byOrg && byQuery
    })
  }, [ambulances, filterOrg, query])

  return (
    <div className="map-page">
      {/* Карта */}
      <MapContainer className="map-root" center={center} zoom={10} bounds={mapBounds || undefined} style={{height: '100vh', width: '100vw'}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredAmbulances.map((car) => (
          <Marker key={car.id} position={car.position}>
            <Popup>
              <div className="car-popup">
                <div className="car-reg">{car.regNumber}</div>
                <div className="car-gps">GPS: {car.gpsNumber}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Кнопки поверх карты */}
      <div className="floating left-top">
        <SearchButton onClick={() => setShowSearch(v => !v)} />
      </div>

      <div className="floating right-top">
        <HospitalButton onClick={() => setShowHospitals(v => !v)} />
      </div>

      <div className="floating right-middle">
        <ZoomControls />
      </div>

      {/* Боковая панель поиска машин */}
      {showSearch && (
        <aside className="side-panel left">
          <div className="side-header">Поиск машин</div>

          {/* Фильтр только для супер-админа */}
          {user?.role === 'superadmin' && (
            <div className="field">
              <div className="field-icon"><FaFilter /></div>
              <input className="field-input" placeholder="Фильтр по мед. организации" value={filterOrg} onChange={(e)=>setFilterOrg(e.target.value)} />
            </div>
          )}

          {/* Поиск доступен всем */}
          <div className="field">
            <div className="field-icon"><FaSearch /></div>
            <input className="field-input" placeholder="Поиск машин (рег. номер)" value={query} onChange={(e)=>setQuery(e.target.value)} />
          </div>

          <div className="list">
            {filteredAmbulances.map((car) => (
              <div className="list-item car" key={car.id}>
                <div className="list-body">
                  <div className="car-title">{car.regNumber}</div>
                  <div className="car-sub">GPS: {car.gpsNumber}</div>
                </div>
                <button className="icon-btn" title="Изменить свойства">
                  <FaRegStickyNote />
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Боковая панель поиска мед. организаций */}
      {showHospitals && (
        <aside className="side-panel right">
          <div className="side-header">Поиск мед. организации</div>

          <button className="add-btn">
            <FaPlus />
            <span>Добавить мед. организацию</span>
          </button>

          <div className="list">
            {hospitals.map((h) => (
              <div className="list-item" key={h.id}>
                <div className="icon-left"><FaHospital /></div>
                <div className="list-body">
                  <div className="hospital-title">{h.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div className="list-item">
            <div className="icon-left"><FaHospital /></div>
            <div className="list-body">
              <div className="hospital-title">{user?.hospitalName || 'Моя организация'}</div>
            </div>
          </div>

          <div className="user-row">
            <div className="icon-left"><FaUsers /></div>
            <div className="user-name">{user?.login || 'user'}</div>
            <button className="icon-btn" title="Выйти">
              <FaSignOutAlt />
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
