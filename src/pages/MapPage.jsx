import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import 'leaflet/dist/leaflet.css';
import './pages-css.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import SearchButton from '../components/SearchButton.jsx';
import HospitalButton from '../components/HospitalButton.jsx';
import ZoomControls from '../components/ZoomControls.jsx';
import EditCarPanel from '../components/EditCarPanel.jsx';
import AddHospitalPanel from '../components/AddHospitalPanel.jsx';
import AddUserModal from '../components/AddUserModal.jsx';
import {
    FaSearch, FaFilter, FaEdit, FaHospital, FaPlus,
    FaSignOutAlt, FaUsers, FaAmbulance, FaTimes, FaCheck, FaUser
} from 'react-icons/fa';

// Сервисы
import { getAllCars, createCar, updateCar } from '../services/carsService.js';
import { getAllMedInstitutions, createMedInstitution } from '../services/medService.js';
import { getAllUsers, createUser } from '../services/usersService.js';
import { logout } from '../redux/reducers/user.js';

// Иконка маркера
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadowUrl, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Зум-кнопки
function LeafletZoomBindings() {
    const map = useMap();
    useEffect(() => {
        const handler = (e) => {
            const btn = e.target.closest('.zoom-btn');
            if (!btn) return;
            const act = btn.getAttribute('data-action');
            if (act === 'in') map.zoomIn();
            if (act === 'out') map.zoomOut();
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [map]);
    return null;
}

export default function MapPage({ regionBounds, regionCenter }) {
    const [hospitals, setHospitals] = useState([]);
    const [ambulances, setAmbulances] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showHospitals, setShowHospitals] = useState(false);
    const [filterOrg, setFilterOrg] = useState('');
    const [query, setQuery] = useState('');
    const [editCar, setEditCar] = useState(null);
    const [showAddHospital, setShowAddHospital] = useState(false);
    const [newHospitalName, setNewHospitalName] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', hospital: '' });
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.user);

    // Загрузка данных
    useEffect(() => {
        async function loadData() {
            try {
                const [carsRes, hospRes] = await Promise.all([
                    getAllCars(),
                    getAllMedInstitutions()
                ]);

                if (carsRes?.isSuccess !== false) setAmbulances(carsRes || []);
                if (hospRes?.isSuccess !== false) setHospitals(hospRes || []);
            } catch (err) {
                console.error('Ошибка загрузки данных', err);
            }
        }
        loadData();
    }, []);

    const mapBounds = useMemo(() => regionBounds && regionBounds.length === 2 ? regionBounds : null, [regionBounds]);
    const center = useMemo(() => regionCenter || [58.01, 56.23], [regionCenter]);

    const filteredAmbulances = useMemo(() => {
        return ambulances.filter(a => {
            const byOrg = filterOrg ? a.hospital?.toLowerCase().includes(filterOrg.toLowerCase()) : true;
            const byQuery = query ? a.regNumber?.toLowerCase().includes(query.toLowerCase()) : true;
            return byOrg && byQuery;
        });
    }, [ambulances, filterOrg, query]);

    // Сохранение машины
    const handleSaveCar = async () => {
        if (!editCar?.id) {
            // Создание новой
            const result = await createCar(editCar);
            if (result?.isSuccess === false) {
                alert(result.errorMessage || 'Ошибка создания');
                return;
            }
            setAmbulances(prev => [...prev, result.data || editCar]);
        } else {
            // Обновление
            const result = await updateCar(editCar.id, editCar);
            if (result?.isSuccess === false) {
                alert(result.errorMessage || 'Ошибка сохранения');
                return;
            }
            setAmbulances(prev => prev.map(a => a.id === editCar.id ? editCar : a));
        }
        setEditCar(null);
    };

    const handleAddCarFromHospital = () => {
        setEditCar({ regNumber: '', gpsNumber: '', hospital: newHospitalName || currentUser?.hospitalName || '' });
    };

    const handleSaveHospital = async () => {
        const result = await createMedInstitution(newHospitalName);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка добавления');
            return;
        }
        setHospitals(prev => [...prev, { id: result.data?.id || Date.now(), name: newHospitalName }]);
        setShowAddHospital(false);
        setNewHospitalName('');
    };

    const handleAddUserClick = () => {
        setNewUser({ email: '', password: '', hospital: newHospitalName || currentUser?.hospitalName || '' });
        setShowAddUser(true);
    };

    const handleSaveUser = async () => {
        const result = await createUser(newUser);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка добавления пользователя');
            return;
        }
        setShowAddUser(false);
    };

    return (
        <div className="map-page">
            {/* Карта */}
            <MapContainer
                className="map-root"
                center={center}
                zoom={10}
                bounds={mapBounds || undefined}
                style={{ height: '100vh', width: '100vw' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <div className="leaflet-bottom leaflet-right" style={{ display: 'none' }} />
                <LeafletZoomBindings />

                {filteredAmbulances.map(car => (
                    <Marker key={car.id} position={car.position || [0, 0]}>
                        <Popup>
                            <div className="car-popup">
                                <div className="car-reg">{car.regNumber}</div>
                                <div className="car-gps">GPS: {car.gpsNumber}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Плавающие кнопки */}
            <div className="floating left-top">
                <SearchButton onClick={() => setShowSearch(v => !v)} active={showSearch} />
            </div>
            <div className="floating right-top">
                <HospitalButton onClick={() => setShowHospitals(v => !v)} active={showHospitals} />
            </div>
            <div className="floating right-middle">
                <ZoomControls />
            </div>

            {/* Панель поиска машин */}
            {showSearch && (
                <aside className="side-panel left">
                    <div className="side-header with-actions">
                        <span>Поиск машин</span>
                        <div className="actions">
                            <button className="icon-btn" title="Закрыть" onClick={() => setShowSearch(false)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Фильтр по больнице */}
                    <div className="field">
                        <div className="field-icon"><FaFilter /></div>
                        <input
                            className="field-input"
                            placeholder="Фильтр по больнице"
                            value={filterOrg}
                            onChange={e => setFilterOrg(e.target.value)}
                        />
                    </div>

                    {/* Поиск по номеру */}
                    <div className="field">
                        <div className="field-icon"><FaSearch /></div>
                        <input
                            className="field-input"
                            placeholder="Поиск (рег. номер)"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="list">
                        {filteredAmbulances.map(car => (
                            <div className="list-item car" key={car.id}>
                                <div className="icon-left"><FaAmbulance /></div>
                                <div className="list-body">
                                    <div className="car-title">{car.regNumber}</div>
                                    <div className="car-sub">GPS: {car.gpsNumber}</div>
                                </div>
                                <button
                                    className="icon-btn"
                                    title="Редактировать"
                                    onClick={() => setEditCar({ ...car })}
                                >
                                    <FaEdit />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="spacer" />

                    {/* Текущая организация */}
                    <div className="list-item align-center">
                        <div className="icon-left"><FaHospital /></div>
                        <div className="list-body">
                            <div className="hospital-title">{currentUser?.hospitalName || 'Нет выбранного учреждения'}</div>
                        </div>
                    </div>

                    {/* Пользователь и выход */}
                    <div className="user-row align-center">
                        <div className="icon-left"><FaUser /></div>
                        <div className="user-name">{currentUser?.login || 'user'}</div>
                        <button
                            className="icon-btn"
                            title="Выйти"
                            onClick={() => {
                                localStorage.removeItem('token');
                                dispatch(logout());
                            }}
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </aside>
            )}

            {/* Панель мед. организаций */}
            {showHospitals && (
                <aside className="side-panel right">
                    <div className="side-header with-actions">
                        <span>Мед. организации</span>
                        <div className="actions">
                            <button className="icon-btn" title="Закрыть" onClick={() => setShowHospitals(false)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <button className="add-btn" onClick={() => setShowAddHospital(true)}>
                        <FaPlus /> <span>Добавить организацию</span>
                    </button>

                    <div className="list">
                        {hospitals.map(h => (
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

            {/* Модалки и панели */}
            <EditCarPanel
                car={editCar}
                onChange={setEditCar}
                onSave={handleSaveCar}
                onClose={() => setEditCar(null)}
            />

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
    );
}
