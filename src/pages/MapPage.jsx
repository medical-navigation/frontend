import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import './pages-css.css'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import SearchButton from '../components/SearchButton.jsx'
import HospitalButton from '../components/HospitalButton.jsx'
import ZoomControls from '../components/ZoomControls.jsx'
import EditCarPanel from '../components/EditCarPanel.jsx'
import AddHospitalPanel from '../components/AddHospitalPanel.jsx'
import AddUserModal from '../components/AddUserModal.jsx'
import { FaSearch, FaFilter, FaEdit, FaHospital, FaPlus, FaSignOutAlt, FaUsers, FaAmbulance, FaTimes, FaCheck, FaUser } from 'react-icons/fa'

// Иконка по умолчанию для маркеров Leaflet поправка путей (иначе не видно маркеров в Vite)
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadowUrl, iconAnchor: [12, 41] })
L.Marker.prototype.options.icon = DefaultIcon

function LeafletZoomBindings() {
    const map = useMap()
    useEffect(() => {
        const handler = (e) => {
            const btn = e.target.closest('.zoom-btn')
            if (!btn) return
            const act = btn.getAttribute('data-action')
            if (act === 'in') map.zoomIn()
            if (act === 'out') map.zoomOut()
        }
        document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [map])
    return null
}

export default function MapPage({ regionBounds, regionCenter, user, hospitals = [], ambulances = [] }) {
    // regionBounds: [[southWestLat, southWestLng],[northEastLat, northEastLng]] или null
    // regionCenter: [lat, lng] если нет bounds
    // user: { login, role, hospitalName }

    const [showSearch, setShowSearch] = useState(false)
    const [showHospitals, setShowHospitals] = useState(false)
    const [filterOrg, setFilterOrg] = useState('')
    const [query, setQuery] = useState('')

    const [editCar, setEditCar] = useState(null) // {regNumber,gpsNumber,hospital}
    const [showAddHospital, setShowAddHospital] = useState(false)
    const [newHospitalName, setNewHospitalName] = useState('')
    const [showAddUser, setShowAddUser] = useState(false)
    const [newUser, setNewUser] = useState({ email: '', password: '', hospital: '' })

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

    const handleSaveCar = () => {
        // TODO: сохранить изменения через API/Redux
        setEditCar(null)
    }
    const handleAddCarFromHospital = () => {
        // открываем форму добавления/редактирования машины пустой
        setEditCar({ regNumber: '', gpsNumber: '', hospital: newHospitalName || '' })
    }
    const handleSaveHospital = () => {
        // TODO: отправить newHospitalName на сервер
        setShowAddHospital(false)
        setNewHospitalName('')
    }
    const handleAddUserClick = () => {
        setNewUser({ email: '', password: '', hospital: newHospitalName || '' })
        setShowAddUser(true)
    }
    const handleSaveUser = () => {
        // TODO: отправить newUser на сервер
        setShowAddUser(false)
    }

    return (
        <div className="map-page">
            {/* Карта */}
            <MapContainer className="map-root" center={center} zoom={10} bounds={mapBounds || undefined} style={{height: '100vh', width: '100vw'}} zoomControl={false} attributionControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <div className="leaflet-bottom leaflet-right" style={{display:'none'}} />
                <LeafletZoomBindings />
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
                    <div className="side-header with-actions">
                        <span>Поиск машин</span>
                        <div className="actions">
                            <button className="icon-btn" title="Закрыть" onClick={() => setShowSearch(false)}><FaTimes /></button>
                        </div>
                    </div>

                    {/* Фильтр только для супер-админа */}
                    {/* Поле Фильтр (для всех, фильтрация по больнице) */}
                    <div className="field">
                        <div className="field-icon"><FaHospital /></div>
                        <input className="field-input" placeholder="Фильтр по больнице" value={filterOrg} onChange={(e)=>setFilterOrg(e.target.value)} />
                    </div>

                    {/* Поиск доступен всем */}
                    <div className="field">
                        <div className="field-icon"><FaSearch /></div>
                        <input className="field-input" placeholder="Поиск машин (рег. номер)" value={query} onChange={(e)=>setQuery(e.target.value)} />
                    </div>

                    <div className="list">
                        {filteredAmbulances.map((car) => (
                            <div className="list-item car" key={car.id}>
                                <div className="icon-left"><FaAmbulance /></div>
                                <div className="list-body">
                                    <div className="car-title">{car.regNumber}</div>
                                    <div className="car-sub">GPS: {car.gpsNumber}</div>
                                </div>
                                <button className="icon-btn" title="Изменить" onClick={() => setEditCar({ ...car })}>
                                    <FaEdit />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="spacer" />

                    <div className="list-item align-center">
                        <div className="icon-left"><FaHospital /></div>
                        <div className="list-body">
                            <div className="hospital-title">{user?.hospitalName || 'Моя организация'}</div>
                        </div>
                    </div>

                    <div className="user-row align-center">
                        <div className="icon-left"><FaUser /></div>
                        <div className="user-name">{user?.login || 'user'}</div>
                        <button className="icon-btn" title="Выйти" onClick={() => window.location.assign('/login')}>
                            <FaSignOutAlt />
                        </button>
                    </div>
                </aside>
            )}

            {/* Боковая панель поиска мед. организаций */}
            {showHospitals && (
                <aside className="side-panel right">
                    <div className="side-header with-actions">
                        <span>Поиск мед. организации</span>
                        <div className="actions">
                            <button className="icon-btn" title="Закрыть" onClick={() => setShowHospitals(false)}><FaTimes /></button>
                        </div>
                    </div>

                    <button className="add-btn" onClick={() => setShowAddHospital(true)}>
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


                </aside>
            )}

            {/* Панель редактирования машины */}
            <EditCarPanel
                car={editCar}
                onChange={setEditCar}
                onSave={handleSaveCar}
                onClose={() => setEditCar(null)}
            />

            {/* Панель добавления ме��. организации */}
            <AddHospitalPanel
                open={showAddHospital}
                value={newHospitalName}
                onChange={setNewHospitalName}
                onAddCar={handleAddCarFromHospital}
                onAddUser={handleAddUserClick}
                onSave={handleSaveHospital}
                onClose={() => setShowAddHospital(false)}
            />

            <AddUserModal
                open={showAddUser}
                value={newUser}
                onChange={setNewUser}
                onSave={handleSaveUser}
                onClose={() => setShowAddUser(false)}
            />
        </div>
    )
}
