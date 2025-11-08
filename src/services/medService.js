import { apiRequest } from './request';
const BASE = import.meta.env.VITE_BASE_URL;

export async function getAllMedInstitutions() {
    return apiRequest(BASE + import.meta.env.VITE_MED_ALL);
}

export async function getMedInstitutionById(id) {
    return apiRequest(BASE + import.meta.env.VITE_MED_BY_ID + id);
}

export async function createMedInstitution(name) {
    return apiRequest(BASE + import.meta.env.VITE_MED_CREATE, 'POST', { name });
}

export async function updateMedInstitution(id, name) {
    return apiRequest(BASE + import.meta.env.VITE_MED_UPDATE + id, 'PUT', { name });
}

export async function deleteMedInstitution(id) {
    return apiRequest(BASE + import.meta.env.VITE_MED_DELETE + id, 'DELETE');
}
