<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-base-content/60">Configure application preferences</p>
    </div>

    <!-- Tabs -->
    <div class="tabs tabs-boxed bg-base-100 p-1 mb-6 w-fit">
      <a class="tab" :class="{ 'tab-active': activeTab === 'appearance' }" @click="activeTab = 'appearance'">
        Appearance
      </a>
      <a class="tab" :class="{ 'tab-active': activeTab === 'data' }" @click="activeTab = 'data'">
        Data
      </a>
      <a class="tab" :class="{ 'tab-active': activeTab === 'about' }" @click="activeTab = 'about'">
        About
      </a>
    </div>

    <!-- Appearance Tab -->
    <div v-show="activeTab === 'appearance'" class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">Appearance Settings</h2>
        <div class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <span class="label-text w-48">Dark Mode</span>
              <input type="checkbox" class="toggle toggle-primary" :checked="isDark" @change="toggleDark" />
            </label>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Theme</span></label>
            <select v-model="selectedTheme" class="select select-bordered w-64" @change="setTheme(selectedTheme)">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="corporate">Corporate</option>
              <option value="emerald">Emerald</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Tab -->
    <div v-show="activeTab === 'data'" class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">Data Management</h2>
        <div class="stats shadow mt-4">
          <div class="stat">
            <div class="stat-title">Total Doctors</div>
            <div class="stat-value text-primary">{{ stats.doctors }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Total Patients</div>
            <div class="stat-value text-secondary">{{ stats.patients }}</div>
          </div>
        </div>
        <div class="mt-6">
          <button class="btn btn-warning">Export All Data</button>
        </div>
      </div>
    </div>

    <!-- About Tab -->
    <div v-show="activeTab === 'about'" class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">About RIPAC</h2>
        <div class="overflow-x-auto mt-4">
          <table class="table">
            <tbody>
              <tr><td class="font-semibold w-48">Application</td><td>RIPAC HIS</td></tr>
              <tr><td class="font-semibold">Version</td><td>1.0.0</td></tr>
              <tr><td class="font-semibold">Framework</td><td>Nuxt 4 + DaisyUI 4</td></tr>
              <tr><td class="font-semibold">Database</td><td>PostgreSQL + Drizzle ORM</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { theme, isDark, setTheme, toggleDark } = useTheme();

const activeTab = ref('appearance');
const selectedTheme = ref(theme.value);

const stats = ref({ doctors: 0, patients: 0 });

async function fetchStats() {
  try {
    const [doctorsRes, patientsRes] = await Promise.all([
      $fetch<{ data: any[] }>('/api/doctors'),
      $fetch<{ data: any[] }>('/api/patients'),
    ]);
    stats.value.doctors = doctorsRes.data?.length || 0;
    stats.value.patients = patientsRes.data?.length || 0;
  } catch (e) {
    console.error('Failed to fetch stats');
  }
}

onMounted(() => {
  selectedTheme.value = theme.value;
  fetchStats();
});
</script>
