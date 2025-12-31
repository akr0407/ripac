import type { Doctor, NewDoctor } from '~/server/db/schema/doctors';

export function useDoctor() {
    const doctors = ref<Doctor[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Fetch all doctors
    async function fetchDoctors() {
        loading.value = true;
        error.value = null;
        try {
            const response = await $fetch<{ success: boolean; data: Doctor[] }>('/api/doctors');
            doctors.value = response.data;
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch doctors';
        } finally {
            loading.value = false;
        }
    }

    // Fetch single doctor
    async function fetchDoctor(id: string) {
        loading.value = true;
        error.value = null;
        try {
            const response = await $fetch<{ success: boolean; data: Doctor }>(`/api/doctors/${id}`);
            return response.data;
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch doctor';
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Create doctor
    async function createDoctor(data: NewDoctor) {
        loading.value = true;
        error.value = null;
        try {
            const response = await $fetch<{ success: boolean; data: Doctor }>('/api/doctors', {
                method: 'POST',
                body: data,
            });
            await fetchDoctors();
            return response.data;
        } catch (e: any) {
            error.value = e.message || 'Failed to create doctor';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Update doctor
    async function updateDoctor(id: string, data: Partial<NewDoctor>) {
        loading.value = true;
        error.value = null;
        try {
            const response = await $fetch<{ success: boolean; data: Doctor }>(`/api/doctors/${id}`, {
                method: 'PUT',
                body: data,
            });
            await fetchDoctors();
            return response.data;
        } catch (e: any) {
            error.value = e.message || 'Failed to update doctor';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    // Delete doctor (soft delete)
    async function deleteDoctor(id: string) {
        loading.value = true;
        error.value = null;
        try {
            await $fetch(`/api/doctors/${id}`, {
                method: 'DELETE',
            });
            await fetchDoctors();
        } catch (e: any) {
            error.value = e.message || 'Failed to delete doctor';
            throw e;
        } finally {
            loading.value = false;
        }
    }

    return {
        doctors,
        loading,
        error,
        fetchDoctors,
        fetchDoctor,
        createDoctor,
        updateDoctor,
        deleteDoctor,
    };
}
