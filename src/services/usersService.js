import { apiRequest } from './request';
const BASE = import.meta.env.VITE_BASE_URL;

export async function getAllUsers(orgId) {
    let url = BASE + import.meta.env.VITE_USERS_ALL;
    if (orgId) url += `?orgId=${orgId}`;
    return apiRequest(url);
}

export async function createUser(data) {
    return apiRequest(BASE + import.meta.env.VITE_USERS_CREATE, 'POST', data);
}

export async function updateUser(id, data) {
    return apiRequest(BASE + import.meta.env.VITE_USERS_UPDATE + id, 'PUT', data);
}

export async function deleteUser(id) {
    return apiRequest(BASE + import.meta.env.VITE_USERS_DELETE + id, 'DELETE');
}
