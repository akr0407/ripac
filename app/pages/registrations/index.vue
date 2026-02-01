<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Registrations</h1>
                <p class="text-base-content/60 mt-1">View patient registrations</p>
            </div>
        </div>
        
        <!-- Search Bar -->
        <div class="flex items-center gap-2 bg-base-100 p-2 rounded-lg border border-base-200">
             <Search class="w-4 h-4 opacity-50 ml-2" />
             <input v-model="search" @input="handleSearch" type="text" placeholder="Search by patient name, MR Number, or Reg Number..." class="input input-ghost input-sm w-full focus:outline-none" />
        </div>
        
        <!-- Table -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-lg">
                        <thead>
                            <tr class="bg-base-200/50">
                                <th>Patient</th>
                                <th>MR Number</th>
                                <th>Reg. Number</th>
                                <th>Admission Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="reg in registrations" :key="reg.id" class="hover">
                                <td>
                                    <div class="font-bold">{{ reg.patientName || 'Unknown' }}</div>
                                </td>
                                <td>
                                    <code class="badge badge-ghost">{{ reg.patientMrNumber || '-' }}</code>
                                </td>
                                <td>{{ reg.registrationNumber }}</td>
                                <td>{{ formatDate(reg.admissionDate) }}</td>
                                <td>
                                    <NuxtLink :to="`/registrations/${reg.id}`" class="btn btn-ghost btn-sm">
                                        View
                                    </NuxtLink>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="registrations.length === 0" class="p-12 text-center">
                    <p class="text-base-content/50">No registrations found.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

interface Registration {
    id: string;
    patientId: string;
    patientName: string | null;
    patientMrNumber: string | null;
    registrationNumber: string;
    admissionDate: string | null;
}

const registrations = ref<Registration[]>([]);
const search = ref('');
const loading = ref(false);

function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
}

async function fetchRegistrations() {
    loading.value = true;
    try {
        const response = await $fetch<{ data: Registration[] }>('/api/registrations', {
            params: {
                q: search.value
            }
        });
        registrations.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch registrations:', error);
    } finally {
        loading.value = false;
    }
}

// Debounced search
let searchTimeout: any;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchRegistrations();
    }, 500);
}

onMounted(() => {
    fetchRegistrations();
});
</script>
