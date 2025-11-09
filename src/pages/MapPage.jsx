import { useEffect, useMemo, useState, useCallback } from 'react';
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
import CarListPanel from '../components/CarListPanel.jsx';
import HospitalManagementPanel from '../components/HospitalManagementPanel.jsx';

import {
    getAllCars,
    createCar,
    updateCar,
    deleteCar,
    bindTracker,
    unbindTracker
} from '../services/carsService.js';
import {
    getAllMedInstitutions,
    createMedInstitution,
    updateMedInstitution,
    deleteMedInstitution
} from '../services/medService.js';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
} from '../services/usersService.js';
import { logout } from '../redux/reducers/user.js';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadowUrl, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

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

const generateId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const hashString = (value) => {
    let hash = 0;
    const str = value || '';
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const getCarPosition = (carData) => {
    const seedSource = (carData?.carId || carData?.id || carData?.regNum || generateId()).toString();
    const hash = hashString(seedSource);
    const baseLat = 58.0;
    const baseLng = 56.2;
    const lat = baseLat + ((hash % 1000) / 10000);      // 58.0000 – 58.0999
    const lng = baseLng + (((hash >> 5) % 1000) / 10000); // 56.2000 – 56.2999
    return [lat, lng];
};

const buildHospitalOptions = (items = []) => {
    return (items || [])
        .map((h) => {
            const id =
                h?.id ??
                h?._id ??
                h?.medInstitutionId ??
                h?.medOrgId ??
                h?.uuid ??
                h?.code ??
                null;
            const name = h?.name ?? h?.title ?? h?.hospitalName ?? h?.fullName ?? h?.orgName ?? '';
            if (!id || !name) return null;
            return { id: String(id), name };
        })
        .filter(Boolean);
};

const normalizeCarWithHospitals = (carData, hospitalOptions = []) => {
    if (!carData) return null;

    const id =
        carData.carId ??
        carData.CarId ??
        carData.id ??
        carData.Id ??
        carData.regNum ??
        carData.RegNum ??
        generateId();
    const regNum = carData.regNum ?? carData.regNumber ?? '';
    const gpsTracker = carData.gpsTracker ?? carData.gpsNumber ?? '';
    const rawHospitalId =
        carData.medInstitutionId ??
        carData.hospitalId ??
        (typeof carData.hospital === 'object' ? carData.hospital?.id : undefined);
    const rawHospitalName =
        carData.medInstitutionName ??
        carData.hospitalName ??
        (typeof carData.hospital === 'string' ? carData.hospital : '') ??
        '';

    const match =
        (rawHospitalId ? hospitalOptions.find(opt => opt.id === String(rawHospitalId)) : null) ||
        (rawHospitalName
            ? hospitalOptions.find(opt => opt.name.trim().toLowerCase() === rawHospitalName.trim().toLowerCase())
            : null);

    const hospitalLabel = match?.name || rawHospitalName || '';
    const hospitalId = match?.id || (rawHospitalId ? String(rawHospitalId) : '');

    return {
        ...carData,
        id,
        carId: carData.carId ?? carData.CarId ?? id,
        regNum,
        gpsTracker,
        hospital: hospitalLabel,
        hospitalName: hospitalLabel,
        hospitalId,
        medInstitutionId: hospitalId || (rawHospitalId ? String(rawHospitalId) : ''),
        position: carData.position || getCarPosition(carData)
    };
};

const normalizeUserWithHospitals = (user, hospitalOptions = []) => {
    if (!user) return null;
    const userId =
        user.userId ??
        user.UserId ??
        user.id ??
        user.Id ??
        user.login ??
        user.Login ??
        generateId();
    const login = user.login ?? user.Login ?? '';
    const rawHospitalId =
        user.medInstitutionId ??
        user.MedInstitutionId ??
        user.medInstitutionID ??
        user.hospitalId ??
        user.HospitalId ??
        '';
    const match = rawHospitalId
        ? hospitalOptions.find(opt => opt.id === String(rawHospitalId))
        : null;

    return {
        ...user,
        id: userId,
        userId,
        login,
        medInstitutionId: rawHospitalId ? String(rawHospitalId) : '',
        hospitalName: match?.name || user.hospitalName || '',
        role: Number.isFinite(Number(user.role)) ? Number(user.role) : 0,
        isRemoved: Boolean(user.isRemoved)
    };
};

const initialUserState = { login: '', password: '', hospitalId: '', medInstitutionId: '', hospitalName: '', role: 0 };

export default function MapPage({ regionBounds, regionCenter }) {
    const [hospitals, setHospitals] = useState([]);
    const [cars, setCars] = useState([]);
    const [users, setUsers] = useState([]);
    const [showCarPanel, setShowCarPanel] = useState(false);
    const [showHospitalPanel, setShowHospitalPanel] = useState(false);
    const [orgSearchValue, setOrgSearchValue] = useState('');
    const [carSearchValue, setCarSearchValue] = useState('');
    const [selectedHospitalFilter, setSelectedHospitalFilter] = useState(null);
    const [editCar, setEditCar] = useState(null);
    const [showAddHospital, setShowAddHospital] = useState(false);
    const [newHospitalName, setNewHospitalName] = useState('');
    const [editingHospitalId, setEditingHospitalId] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState(initialUserState);
    const [editingUserId, setEditingUserId] = useState(null);
    const [expandedHospitalId, setExpandedHospitalId] = useState(null);
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.user);

    const mapBounds = useMemo(() => regionBounds && regionBounds.length === 2 ? regionBounds : null, [regionBounds]);
    const center = useMemo(() => regionCenter || [58.01, 56.23], [regionCenter]);

    const hospitalOptions = hospitals;

    const mapCarForUi = useCallback(
        (carData) => normalizeCarWithHospitals(carData, hospitalOptions),
        [hospitalOptions]
    );

    const filteredCars = useMemo(() => {
        let list = selectedHospitalFilter
            ? cars.filter(car => (car.medInstitutionId || car.hospitalId) === selectedHospitalFilter.id)
            : cars;

        if (carSearchValue.trim()) {
            const q = carSearchValue.trim().toLowerCase();
            list = list.filter(car => (car.regNum || '').toLowerCase().includes(q));
        }

        return list;
    }, [cars, selectedHospitalFilter, carSearchValue]);

    const carsByHospital = useMemo(() => {
        const map = {};
        cars.forEach((car) => {
            const id = String(car.medInstitutionId || car.hospitalId || 'none');
            if (!map[id]) map[id] = [];
            map[id].push(car);
        });
        return map;
    }, [cars]);

    const usersByHospital = useMemo(() => {
        const map = {};
        users.forEach((user) => {
            const id = String(user.medInstitutionId || user.hospitalId || 'none');
            if (!map[id]) map[id] = [];
            map[id].push(user);
        });
        return map;
    }, [users]);

    const loadInitialData = useCallback(async () => {
        try {
            const [carsRes, hospRes, usersRes] = await Promise.all([
                getAllCars(),
                getAllMedInstitutions(),
                getAllUsers()
            ]);

            const hospitalsDataRaw = Array.isArray(hospRes?.data)
                ? hospRes.data
                : Array.isArray(hospRes)
                    ? hospRes
                    : [];
            const normalizedHospitals = hospRes?.isSuccess === false
                ? []
                : buildHospitalOptions(hospitalsDataRaw);
            setHospitals(normalizedHospitals);

            const carsDataRaw = Array.isArray(carsRes?.data)
                ? carsRes.data
                : Array.isArray(carsRes)
                    ? carsRes
                    : [];
            const normalizedCars = carsRes?.isSuccess === false
                ? []
                : carsDataRaw
                    .map(car => normalizeCarWithHospitals(car, normalizedHospitals))
                    .filter(Boolean);
            setCars(normalizedCars);

            const usersDataRaw = Array.isArray(usersRes?.data)
                ? usersRes.data
                : Array.isArray(usersRes)
                    ? usersRes
                    : [];
            const normalizedUsers = usersRes?.isSuccess === false
                ? []
                : usersDataRaw
                    .map(user => normalizeUserWithHospitals(user, normalizedHospitals))
                    .filter(Boolean);
            setUsers(normalizedUsers);
        } catch (err) {
            console.error('Ошибка загрузки данных', err);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        if (!hospitalOptions.length) return;
        setCars(prev => prev.map(car => mapCarForUi(car)).filter(Boolean));
        setUsers(prev => prev.map(user => normalizeUserWithHospitals(user, hospitalOptions)).filter(Boolean));
    }, [hospitalOptions, mapCarForUi]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        dispatch(logout());
    }, [dispatch]);

    const handleHospitalFilterSelect = (option) => {
        if (!option) return;
        setSelectedHospitalFilter(option);
        setOrgSearchValue('');
    };

    const clearHospitalFilter = () => {
        setSelectedHospitalFilter(null);
        setOrgSearchValue('');
    };

    const pickDefaultHospital = useCallback((preferredName) => {
        if (!hospitalOptions.length) return null;
        if (preferredName) {
            const found = hospitalOptions.find(opt => opt.name.trim().toLowerCase() === preferredName.trim().toLowerCase());
            if (found) return found;
        }
        return hospitalOptions[0];
    }, [hospitalOptions]);

    const handleAddCarFromHospital = (hospital) => {
        const target = hospital || pickDefaultHospital(newHospitalName || currentUser?.hospitalName);
        if (!target) {
            alert('Сначала добавьте медорганизацию');
            return;
        }
        setEditCar({
            carId: null,
            regNum: '',
            gpsTracker: '',
            hospitalId: target.id,
            medInstitutionId: target.id,
            hospitalName: target.name,
            hospital: target.name
        });
    };

    const handleSaveCar = async () => {
        if (!editCar) return;

        const hospitalMatch = hospitalOptions.find(opt => opt.id === String(editCar.hospitalId || editCar.medInstitutionId))
            || pickDefaultHospital(editCar.hospitalName || editCar.hospital);
        const hospitalId = hospitalMatch?.id || editCar.hospitalId || editCar.medInstitutionId;

        if (!hospitalId) {
            alert('Выберите медорганизацию');
            return;
        }

        if (!editCar.regNum?.trim()) {
            alert('Укажите государственный номер');
            return;
        }

        const payload = {
            regNum: editCar.regNum.trim(),
            gpsTracker: editCar.gpsTracker?.trim() || '',
            medInstitutionId: hospitalId
        };

        let result;
        const carIdentifier = editCar.carId || editCar.id;
        if (carIdentifier) {
            result = await updateCar(carIdentifier, payload);
        } else {
            result = await createCar(payload);
        }

        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка сохранения машины');
            return;
        }

        const savedCar = mapCarForUi(result?.data || { ...editCar, ...payload });
        if (!carIdentifier) {
            await loadInitialData();
        } else if (savedCar) {
            setCars(prev => {
                const rest = prev.filter(car => (car.carId || car.id) !== (savedCar.carId || savedCar.id));
                return [...rest, savedCar];
            });
        }
        setEditCar(null);
    };

    const handleDeleteCar = async (car) => {
        const id = car.carId || car.id;
        if (!id) return;
        if (!confirm('Удалить машину?')) return;
        const result = await deleteCar(id);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка удаления');
            return;
        }
        setCars(prev => prev.filter(item => (item.carId || item.id) !== id));
    };

    const handleBindTracker = async (car) => {
        const tracker = prompt('Введите идентификатор трекера', car.gpsTracker || '');
        if (!tracker) return;
        const id = car.carId || car.id;
        const result = await bindTracker(id, tracker);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Не удалось привязать трекер');
            return;
        }
        const updated = mapCarForUi(result?.data || { ...car, gpsTracker: tracker });
        setCars(prev => prev.map(item => (item.carId || item.id) === id ? updated : item));
    };

    const handleUnbindTracker = async (car) => {
        const id = car.carId || car.id;
        const result = await unbindTracker(id);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Не удалось отвязать трекер');
            return;
        }
        const updated = mapCarForUi(result?.data || { ...car, gpsTracker: null });
        setCars(prev => prev.map(item => (item.carId || item.id) === id ? updated : item));
    };

    const openHospitalModal = (hospital = null) => {
        if (hospital) {
            setEditingHospitalId(hospital.id);
            setNewHospitalName(hospital.name);
        } else {
            setEditingHospitalId(null);
            setNewHospitalName('');
        }
        setShowAddHospital(true);
    };

    const closeHospitalModal = () => {
        setShowAddHospital(false);
        setNewHospitalName('');
        setEditingHospitalId(null);
    };

    const handleSaveHospital = async () => {
        if (!newHospitalName.trim()) {
            alert('Укажите название медорганизации');
            return;
        }
        let result;
        if (editingHospitalId) {
            result = await updateMedInstitution(editingHospitalId, newHospitalName.trim());
        } else {
            result = await createMedInstitution(newHospitalName.trim());
        }
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка сохранения организации');
            return;
        }
        const created = buildHospitalOptions([result?.data || { id: editingHospitalId || generateId(), name: newHospitalName.trim() }]);
        if (created.length) {
            setHospitals(prev => {
                const rest = prev.filter(h => h.id !== created[0].id);
                return [...rest, created[0]];
            });
        }
        closeHospitalModal();
    };

    const handleDeleteHospital = async (hospital) => {
        if (!hospital?.id) return;
        if (!confirm('Удалить медорганизацию и связанные данные?')) return;
        const result = await deleteMedInstitution(hospital.id);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка удаления организации');
            return;
        }
        setHospitals(prev => prev.filter(h => h.id !== hospital.id));
        setCars(prev => prev.filter(car => (car.medInstitutionId || car.hospitalId) !== hospital.id));
        setUsers(prev => prev.filter(user => (user.medInstitutionId || user.hospitalId) !== hospital.id));
        if (selectedHospitalFilter?.id === hospital.id) {
            setSelectedHospitalFilter(null);
            setOrgSearchValue('');
        }
        if (expandedHospitalId === hospital.id) {
            setExpandedHospitalId(null);
        }
    };

    const handleAddUserClick = (hospital) => {
        if (!hospitalOptions.length) {
            alert('Нет доступных медорганизаций. Сначала добавьте их.');
            return;
        }
        const target = hospital || pickDefaultHospital(currentUser?.hospitalName);
        if (!target) {
            alert('Нет доступных медорганизаций');
            return;
        }
        setNewUser({
            login: '',
            password: '',
            role: 0,
            hospitalId: target.id,
            medInstitutionId: target.id,
            hospitalName: target.name
        });
        setEditingUserId(null);
        setShowAddUser(true);
    };

    const handleEditUser = (user) => {
        setNewUser({
            login: user.login || '',
            password: '',
            role: user.role ?? 0,
            hospitalId: user.medInstitutionId || user.hospitalId || '',
            medInstitutionId: user.medInstitutionId || user.hospitalId || '',
            hospitalName: user.hospitalName || ''
        });
        setEditingUserId(user.userId || user.id);
        setShowAddUser(true);
    };

    const handleDeleteUser = async (user) => {
        const id = user.userId || user.id;
        if (!id) return;
        if (!confirm('Удалить сотрудника?')) return;
        const result = await deleteUser(id);
        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка удаления сотрудника');
            return;
        }
        setUsers(prev => prev.filter(item => (item.userId || item.id) !== id));
    };

    const handleSaveUser = async () => {
        const hospitalMatch = hospitalOptions.find(opt => opt.id === String(newUser.hospitalId || newUser.medInstitutionId))
            || pickDefaultHospital(newUser.hospitalName);
        const hospitalId = hospitalMatch?.id || newUser.hospitalId || newUser.medInstitutionId;

        if (!hospitalId) {
            alert('Выберите медорганизацию');
            return;
        }

        if (!newUser.login?.trim()) {
            alert('Укажите логин пользователя');
            return;
        }

        if (!newUser.password?.trim() && !editingUserId) {
            alert('Укажите пароль пользователя');
            return;
        }

        const payload = {
            login: newUser.login.trim(),
            password: newUser.password,
            role: Number.isFinite(Number(newUser.role)) ? Number(newUser.role) : 0,
            medInstitutionId: hospitalId
        };

        let result;
        if (editingUserId) {
            const updatePayload = { ...payload };
            if (!updatePayload.password) delete updatePayload.password;
            result = await updateUser(editingUserId, updatePayload);
        } else {
            result = await createUser(payload);
        }

        if (result?.isSuccess === false) {
            alert(result.errorMessage || 'Ошибка сохранения сотрудника');
            return;
        }

        const savedUser = normalizeUserWithHospitals(
            result?.data || { ...payload, userId: editingUserId }
            , hospitalOptions);
        if (savedUser) {
            setUsers(prev => {
                const rest = prev.filter(user => (user.userId || user.id) !== savedUser.userId);
                return [...rest, savedUser];
            });
        }
        setShowAddUser(false);
        setNewUser(initialUserState);
        setEditingUserId(null);
    };

    const closeUserModal = () => {
        setShowAddUser(false);
        setNewUser(initialUserState);
        setEditingUserId(null);
    };

    const toggleHospitalExpansion = (id) => {
        setExpandedHospitalId(prev => prev === id ? null : id);
    };

    return (
        <div className="map-page">
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

                {filteredCars.map(car => (
                    <Marker key={car.carId || car.id || car.regNum} position={car.position || [58.01, 56.23]}>
                        <Popup>
                            <div className="car-popup">
                                <div className="car-reg">{car.regNum || 'Без номера'}</div>
                                <div className="car-gps">GPS: {car.gpsTracker || 'не подключен'}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="floating left-top">
                <SearchButton onClick={() => setShowCarPanel(v => !v)} active={showCarPanel} />
            </div>
            <div className="floating right-top">
                <HospitalButton onClick={() => setShowHospitalPanel(v => !v)} />
            </div>
            <div className="floating right-middle">
                <ZoomControls />
            </div>

            <CarListPanel
                open={showCarPanel}
                cars={filteredCars}
                hospitalOptions={hospitalOptions}
                orgSearchValue={orgSearchValue}
                carSearchValue={carSearchValue}
                selectedHospital={selectedHospitalFilter}
                onOrgSearchChange={setOrgSearchValue}
                onCarSearchChange={setCarSearchValue}
                onHospitalSelect={handleHospitalFilterSelect}
                onClearFilter={clearHospitalFilter}
                onClose={() => setShowCarPanel(false)}
                onEditCar={(car) => setEditCar(mapCarForUi(car))}
                onDeleteCar={handleDeleteCar}
                onBindTracker={handleBindTracker}
                onUnbindTracker={handleUnbindTracker}
                currentHospitalName={currentUser?.hospitalName}
                currentUserName={currentUser?.login}
                onLogout={handleLogout}
            />

            <HospitalManagementPanel
                open={showHospitalPanel}
                hospitals={hospitalOptions}
                carsByHospital={carsByHospital}
                usersByHospital={usersByHospital}
                expandedHospitalId={expandedHospitalId}
                onToggleHospital={toggleHospitalExpansion}
                onAddHospital={() => openHospitalModal()}
                onEditHospital={openHospitalModal}
                onDeleteHospital={handleDeleteHospital}
                onAddUser={handleAddUserClick}
                onAddCar={handleAddCarFromHospital}
                onEditCar={(car) => setEditCar(mapCarForUi(car))}
                onDeleteCar={handleDeleteCar}
                onBindTracker={handleBindTracker}
                onUnbindTracker={handleUnbindTracker}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onClose={() => setShowHospitalPanel(false)}
            />

            <EditCarPanel
                car={editCar}
                hospitalOptions={hospitalOptions}
                onChange={setEditCar}
                onSave={handleSaveCar}
                onClose={() => setEditCar(null)}
            />

            <AddHospitalPanel
                open={showAddHospital}
                value={newHospitalName}
                onChange={setNewHospitalName}
                onAddCar={() => handleAddCarFromHospital()}
                onAddUser={handleAddUserClick}
                onSave={handleSaveHospital}
                onClose={closeHospitalModal}
            />

            <AddUserModal
                open={showAddUser}
                value={newUser}
                hospitalOptions={hospitalOptions}
                onChange={setNewUser}
                onSave={handleSaveUser}
                onClose={closeUserModal}
            />
        </div>
    );
}


