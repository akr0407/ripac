<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Patients</h1>
                <p class="text-base-content/60 mt-1">Manage patient records</p>
            </div>
            <NuxtLink to="/patients/new" class="btn btn-primary gap-2">
                <Plus class="w-4 h-4" />
                Add Patient
            </NuxtLink>
        </div>
        
        <!-- Table -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-lg">
                        <thead>
                            <tr class="bg-base-200/50">
                                <th>Name</th>
                                <th>MR Number</th>
                                <th>Age/Sex</th>
                                <th>Registration No</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="patient in patients" :key="patient.id" class="hover">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-primary text-primary-content rounded-full w-10">
                                                <span>{{ patient.fullName?.charAt(0) || '?' }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold">{{ patient.fullName }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <code class="badge badge-ghost">{{ patient.mrNumber || '-' }}</code>
                                </td>
                                <td>
                                    <span class="badge badge-outline">
                                        {{ patient.age || '-' }} {{ patient.sex === 'male' ? 'M' : patient.sex === 'female' ? 'F' : '' }}
                                    </span>
                                </td>
                                <td class="text-sm">{{ patient.registrationNumber || '-' }}</td>
                                <td>
                                    <NuxtLink :to="`/patients/${patient.id}`" class="btn btn-ghost btn-sm">
                                        View
                                    </NuxtLink>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="patients.length === 0" class="p-12 text-center">
                    <p class="text-base-content/50">No patients found.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

interface Patient {
    id: string;
    registrationNumber?: string;
    mrNumber: string | null;
    fullName: string;
    age: number | null;
    sex: string | null;
}

const patients = ref<Patient[]>([]);

// Fetch patients
async function fetchPatients() {
    try {
        const response = await $fetch<{ data: Patient[] }>('/api/patients');
        patients.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch patients:', error);
    }
}

onMounted(() => {
    fetchPatients();
});
</script>
