<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Registrations</h1>
                <p class="text-base-content/60 mt-1">View patient registrations</p>
            </div>
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

function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
}

onMounted(async () => {
    try {
        const response = await $fetch<{ data: Registration[] }>('/api/registrations');
        registrations.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch registrations:', error);
    }
});
</script>
