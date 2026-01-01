<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center gap-4">
                        <NuxtLink to="/" class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-white">RIPAC</h1>
                                <p class="text-xs text-slate-400">{{ currentOrganization?.name || 'Loading...' }}</p>
                            </div>
                        </NuxtLink>
                        
                        <!-- Organization Switcher -->
                        <div v-if="user?.organizations && user.organizations.length > 1" class="relative">
                            <select
                                v-model="selectedOrgId"
                                @change="handleOrgChange"
                                class="appearance-none bg-slate-700/50 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option
                                    v-for="org in user.organizations"
                                    :key="org.id"
                                    :value="org.id"
                                >
                                    {{ org.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Navigation -->
                    <nav class="hidden md:flex items-center gap-1">
                        <NuxtLink
                            :to="`/org/${currentOrg}/patients`"
                            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            :class="route.path.includes('/patients') ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'"
                        >
                            Patients
                        </NuxtLink>
                        <NuxtLink
                            :to="`/org/${currentOrg}/doctors`"
                            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            :class="route.path.includes('/doctors') ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'"
                        >
                            Doctors
                        </NuxtLink>
                        <NuxtLink
                            :to="`/org/${currentOrg}/registrations`"
                            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            :class="route.path.includes('/registrations') ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'"
                        >
                            Registrations
                        </NuxtLink>
                    </nav>
                    
                    <div class="flex items-center gap-4">
                        <NuxtLink
                            v-if="user?.isSuperadmin"
                            to="/admin"
                            class="text-sm text-slate-400 hover:text-slate-300"
                        >
                            Admin
                        </NuxtLink>
                        <span class="text-sm text-slate-300">{{ user?.name }}</span>
                        <button
                            @click="handleLogout"
                            class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { user, logout, currentOrganization, switchOrganization } = useAuth();

const currentOrg = computed(() => route.params.org as string);

const selectedOrgId = ref(currentOrganization.value?.id || '');

watch(() => currentOrganization.value, (newOrg) => {
    if (newOrg) {
        selectedOrgId.value = newOrg.id;
    }
}, { immediate: true });

async function handleOrgChange() {
    if (selectedOrgId.value && selectedOrgId.value !== currentOrganization.value?.id) {
        await switchOrganization(selectedOrgId.value);
    }
}

async function handleLogout() {
    await logout();
}
</script>
