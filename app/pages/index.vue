<template>

  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
      <div class="relative z-10">
        <h1 class="text-3xl font-bold mb-2">Welcome Back, Doctor!</h1>
        <p class="opacity-90">Here's what's happening in your hospital today.</p>
      </div>
      <!-- Decorative Circles -->
      <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
      <div class="absolute right-20 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.title" class="stats shadow-lg card-hover-effect bg-base-100/60 backdrop-blur border border-base-200">
        <div class="stat">
          <div class="stat-figure text-primary bg-primary/10 p-2 rounded-lg">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="stat-title font-medium text-base-content/70">{{ stat.title }}</div>
          <div class="stat-value text-xl lg:text-3xl text-primary font-bold">{{ stat.value }}</div>
          <div class="stat-desc font-medium" :class="stat.desc.includes('↗︎') ? 'text-success' : stat.desc.includes('↘︎') ? 'text-error' : ''">{{ stat.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Recent Patients</h2>
      <button class="btn btn-primary shadow-lg hover:shadow-primary/50 transition-all gap-2" @click="showModal = true">
        <FileText class="w-5 h-5" />
        New Medical Resume
      </button>
    </div>

    <!-- Recent Patients Table -->
    <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table table-lg">
            <thead>
              <tr class="bg-base-200/50">
                <th class="rounded-tl-xl pl-6">Name</th>
                <th>MR Number</th>
                <th>Age/Sex</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th class="rounded-tr-xl pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="patient in recentPatients" :key="patient.id" class="hover group transition-colors">
                <td class="pl-6">
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-neutral-focus text-neutral-content rounded-full w-10 ring ring-primary ring-offset-base-100 ring-offset-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span class="text-xs">{{ patient.fullName.charAt(0) }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{{ patient.fullName }}</div>
                      <div class="text-xs opacity-50">{{ patient.registrationNumber }}</div>
                    </div>
                  </div>
                </td>
                <td class="font-mono text-sm opacity-80">{{ patient.mrNumber || '-' }}</td>
                <td>
                  <div class="badge badge-ghost gap-2">
                    {{ patient.age }} {{ patient.sex === 'male' ? 'M' : 'F' }}
                  </div>
                </td>
                <td class="text-sm font-medium opacity-70">{{ formatDate(patient.updatedAt) }}</td>
                <td><span class="badge badge-success badge-sm gap-1 bg-success/10 text-success border-0">● Active</span></td>
                <td class="pr-6">
                  <NuxtLink :to="`/patients/${patient.id}`" class="btn btn-sm btn-ghost btn-square">
                     <Search class="w-4 h-4" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Medical Resume Modal -->
    <dialog class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Add Medical Resume</h3>
        
        <div class="flex flex-col gap-4">
          <button class="btn btn-outline justify-between" @click="navigateTo('/patients')">
            <span>Select Existing Patient</span>
            <Search class="w-4 h-4" />
          </button>
          
          <div class="divider">OR</div>
          
          <button class="btn btn-outline justify-between" @click="navigateTo('/patients/new')">
            <span>Register New Patient</span>
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="modal-action">
          <button class="btn" @click="showModal = false">Cancel</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Users, Activity, FileText, Calendar, Wallet, Search, Plus } from 'lucide-vue-next';
import dayjs from 'dayjs';

const showModal = ref(false);

const stats = [
  { title: 'Total Patients', value: '1,234', desc: '↗︎ 40 (12%)', icon: Users },
  { title: 'Active Cases', value: '56', desc: '↘︎ 5 (3%)', icon: Activity },
  { title: 'Appointments', value: '28', desc: 'Today', icon: Calendar },
  { title: 'Revenue', value: '$12k', desc: 'This Month', icon: Wallet },
];

const recentPatients = ref<{ id: string; fullName: string; registrationNumber: string; mrNumber: string | null; age: number; sex: string; updatedAt: string }[]>([]);

function formatDate(date: string) {
  return dayjs(date).format('MMM D, YYYY');
}

onMounted(async () => {
  try {
    const { data } = await $fetch<{ data: any[] }>('/api/patients');
    recentPatients.value = data.slice(0, 5);
  } catch (e) {
    console.error('Failed to fetch patients', e);
  }
});
</script>
