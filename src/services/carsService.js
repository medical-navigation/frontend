import { apiRequest } from './request';
const BASE = import.meta.env.VITE_BASE_URL;

export async function getAllCars(orgId) {
    let url = BASE + import.meta.env.VITE_CARS_ALL;
    if (orgId) url += `?orgId=${orgId}`;
    return apiRequest(url);
}

export async function searchCars(query, orgId) {
    let url = BASE + import.meta.env.VITE_CARS_SEARCH + encodeURIComponent(query);
    if (orgId) url += `&orgId=${orgId}`;
    return apiRequest(url);
}

export async function getCarById(id) {
    return apiRequest(BASE + import.meta.env.VITE_CARS_BY_ID + id);
}

export async function createCar(data) {
    return apiRequest(BASE + import.meta.env.VITE_CARS_CREATE, 'POST', data);
}

export async function updateCar(id, data) {
    return apiRequest(BASE + import.meta.env.VITE_CARS_UPDATE + id, 'PUT', data);
}

export async function deleteCar(id) {
    return apiRequest(BASE + import.meta.env.VITE_CARS_DELETE + id, 'DELETE');
}
