<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div class="text-sm breadcrumbs">
          <ul>
            <li><NuxtLink to="/patients">Patients</NuxtLink></li>
            <li>{{ patient?.fullName || 'Loading...' }}</li>
          </ul>
        </div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">{{ patient?.fullName }}</h1>
          <span v-if="patient?.sex" class="badge" :class="patient.sex === 'male' ? 'badge-info' : 'badge-secondary'">
            {{ patient.sex === 'male' ? 'Male' : 'Female' }}
          </span>
          <span v-if="patient?.age" class="badge badge-outline">{{ patient.age }} {{ patient.ageUnit }}</span>
        </div>
        <p class="text-base-content/60">
          MR: {{ patient?.mrNumber || 'N/A' }}
        </p>
      </div>
      <div>
        <button class="btn btn-primary" @click="showAddRegistrationModal = true">
          <Plus class="w-5 h-5" />
          New Registration
        </button>
      </div>
    </div>

    <!-- Patient Info Card -->
    <div class="card bg-base-100 shadow mb-6" v-if="patient">
      <div class="card-body">
        <h2 class="card-title text-sm uppercase tracking-wide text-base-content/60 mb-2">Patient Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span class="label-text block">Full Name</span>
            <span class="font-medium">{{ patient.fullName }}</span>
          </div>
          <div>
            <span class="label-text block">MR Number</span>
            <span class="font-medium">{{ patient.mrNumber || '-' }}</span>
          </div>
          <div>
            <span class="label-text block">Phone</span>
            <span class="font-medium">{{ patient.phone || '-' }}</span>
          </div>
          <div>
            <span class="label-text block">Nationality</span>
            <span class="font-medium">{{ patient.nationality || '-' }}</span>
          </div>
          <div>
            <span class="label-text block">Current Address</span>
            <span class="font-medium">{{ patient.currentAddress || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Registrations List -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title mb-4">Registrations (Medical Resumes)</h2>
        
        <div v-if="registrations.length > 0" class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Registration No.</th>
                <th>Admission Date</th>
                <th>Ward</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in registrations" :key="reg.id" class="hover">
                <td class="font-medium">{{ reg.registrationNumber }}</td>
                <td>{{ reg.admissionDate || '-' }}</td>
                <td>{{ reg.ward || '-' }}</td>
                <td>{{ formatDate(reg.createdAt) }}</td>
                <td>
                  <NuxtLink :to="`/registrations/${reg.id}`" class="btn btn-sm btn-ghost">
                    View Details
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-base-content/60">
          No registrations found. Create one to start tracking medical history.
        </div>
      </div>
    </div>

    <!-- New Registration Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAddRegistrationModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">New Registration</h3>
        <p class="mb-4">Create a new medical resume for {{ patient?.fullName }}?</p>
        
        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Ward (Optional)</span></label>
          <input v-model="newRegWard" type="text" class="input input-bordered" placeholder="e.g. ICU, General Ward" />
        </div>

        <div class="modal-action">
          <button class="btn" @click="showAddRegistrationModal = false">Cancel</button>
          <button class="btn btn-primary" @click="createRegistration" :disabled="creating">
            {{ creating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import dayjs from 'dayjs';

const route = useRoute();
const patientId = route.params.id as string;

const patient = ref<any>(null);
const registrations = ref<any[]>([]);
const showAddRegistrationModal = ref(false);
const creating = ref(false);
const newRegWard = ref('');

function formatDate(date: string) {
  return dayjs(date).format('DD MMM YYYY');
}

async function fetchPatient() {
  try {
    const response = await $fetch<{ data: any }>(`/api/patients/${patientId}`);
    patient.value = response.data;
  } catch (e) {
    // Handle error
  }
}

async function fetchRegistrations() {
  try {
    const response = await $fetch<{ data: any[] }>(`/api/patients/${patientId}/registrations`);
    registrations.value = response.data || [];
  } catch (e) {
    // Handle error
  }
}

async function createRegistration() {
  creating.value = true;
  try {
    const response = await $fetch<{ data: any }>('/api/registrations', {
      method: 'POST',
      body: {
        patientId,
        ward: newRegWard.value || undefined,
      },
    });
    
    showAddRegistrationModal.value = false;
    newRegWard.value = '';
    
    // Redirect to the new registration page
    navigateTo(`/registrations/${response.data.id}`);
  } catch (e) {
    alert('Failed to create registration');
  } finally {
    creating.value = false;
  }
}

onMounted(() => {
  fetchPatient();
  fetchRegistrations();
});
</script>
