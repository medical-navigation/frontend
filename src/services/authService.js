import { apiRequest } from './request';

const BASE = import.meta.env.VITE_BASE_URL;

export async function loginUser(login, password) {
    const url = BASE + import.meta.env.VITE_AUTH_LOGIN;
    return apiRequest(url, 'POST', { login, password }, false);
}

export async function registerUser(login, password) {
    const url = BASE + import.meta.env.VITE_AUTH_REGISTER;
    return apiRequest(url, 'POST', { login, password }, false);
}
