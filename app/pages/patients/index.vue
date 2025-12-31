<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold">Patients</h1>
        <p class="text-base-content/60">Manage patient records</p>
      </div>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search patients..."
          class="input input-bordered w-64"
        />
        <NuxtLink to="/patients/new" class="btn btn-primary">
          <Plus class="w-5 h-5" />
          New Patient
        </NuxtLink>
      </div>
    </div>

    <!-- Patients Table -->
    <div class="card bg-base-100 shadow">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>MR No</th>
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Ward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in filteredPatients" :key="patient.id" class="hover">
                <td class="font-mono text-sm">{{ patient.registrationNumber }}</td>
                <td>{{ patient.mrNumber || '-' }}</td>
                <td>{{ patient.fullName }}</td>
                <td>{{ patient.age || '-' }} {{ patient.ageUnit }}</td>
                <td>
                  <span v-if="patient.sex" class="badge badge-sm" :class="patient.sex === 'male' ? 'badge-info' : 'badge-secondary'">
                    {{ patient.sex === 'male' ? 'M' : 'F' }}
                  </span>
                </td>
                <td>{{ patient.ward || '-' }}</td>
                <td>
                  <span :class="patient.dischargeDate ? 'badge badge-success' : 'badge badge-warning'">
                    {{ patient.dischargeDate ? 'Discharged' : 'Admitted' }}
                  </span>
                </td>
                <td>
                  <NuxtLink :to="`/patients/${patient.id}`" class="btn btn-ghost btn-xs">
                    <Eye class="w-4 h-4" />
                  </NuxtLink>
                </td>
              </tr>
              <tr v-if="filteredPatients.length === 0">
                <td colspan="8" class="text-center py-8 text-base-content/60">
                  {{ loading ? 'Loading...' : 'No patients found' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Eye } from 'lucide-vue-next';
import type { Patient } from '~/server/db/schema/patients';

const loading = ref(false);
const patients = ref<Patient[]>([]);
const searchQuery = ref('');

const filteredPatients = computed(() => {
  if (!searchQuery.value) return patients.value;
  const query = searchQuery.value.toLowerCase();
  return patients.value.filter(
    (p) =>
      p.fullName.toLowerCase().includes(query) ||
      p.registrationNumber.toLowerCase().includes(query) ||
      p.mrNumber?.toLowerCase().includes(query)
  );
});

async function fetchPatients() {
  loading.value = true;
  try {
    const response = await $fetch<{ success: boolean; data: Patient[] }>('/api/patients');
    patients.value = response.data;
  } catch (e) {
    console.error('Failed to fetch patients:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPatients();
});
</script>
