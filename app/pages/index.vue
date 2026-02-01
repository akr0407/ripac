<template>
    <div class="space-y-8">
        <!-- Welcome Header -->
        <div class="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div class="relative z-10">
                <h1 class="text-3xl font-bold mb-2">Welcome to {{ currentOrganization?.name || 'RIPAC' }}</h1>
                <p class="opacity-90">Select a section from the menu to get started.</p>
            </div>
            <!-- Decorative Circles -->
            <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
            <div class="absolute right-20 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink to="/patients" class="group">
                <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200 w-full hover:border-primary/50 transition-all card-hover-effect">
                    <div class="stat">
                        <div class="stat-figure text-primary group-hover:scale-110 transition-transform">
                            <Users class="w-8 h-8" />
                        </div>
                        <div class="stat-title">Patients</div>
                        <div class="stat-value text-primary">{{ stats.patients }}</div>
                        <div class="stat-desc">View all patients →</div>
                    </div>
                </div>
            </NuxtLink>
            
            <NuxtLink to="/doctors" class="group">
                <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200 w-full hover:border-secondary/50 transition-all card-hover-effect">
                    <div class="stat">
                        <div class="stat-figure text-secondary group-hover:scale-110 transition-transform">
                            <UserRound class="w-8 h-8" />
                        </div>
                        <div class="stat-title">Doctors</div>
                        <div class="stat-value text-secondary">{{ stats.doctors }}</div>
                        <div class="stat-desc">View all doctors →</div>
                    </div>
                </div>
            </NuxtLink>
            
            <NuxtLink to="/registrations" class="group">
                <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200 w-full hover:border-accent/50 transition-all card-hover-effect">
                    <div class="stat">
                        <div class="stat-figure text-accent group-hover:scale-110 transition-transform">
                            <ClipboardList class="w-8 h-8" />
                        </div>
                        <div class="stat-title">Registrations</div>
                        <div class="stat-value text-accent">{{ stats.registrations }}</div>
                        <div class="stat-desc">View all registrations →</div>
                    </div>
                </div>
            </NuxtLink>
        </div>
        
        <!-- Quick Actions -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body">
                <h2 class="card-title">Quick Actions</h2>
                <div class="flex flex-wrap gap-4 mt-4">
                    <NuxtLink to="/patients" class="btn btn-primary gap-2">
                        <Plus class="w-4 h-4" />
                        New Patient
                    </NuxtLink>
                    <NuxtLink to="/doctors" class="btn btn-secondary gap-2">
                        <Plus class="w-4 h-4" />
                        Add Doctor
                    </NuxtLink>
                    <NuxtLink to="/registrations" class="btn btn-outline gap-2">
                        <FileText class="w-4 h-4" />
                        View Registrations
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Users, UserRound, ClipboardList, Plus, FileText } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

const { currentOrganization, fetchUser, isAuthenticated } = useAuth();

const stats = ref({
    patients: 0,
    doctors: 0,
    registrations: 0,
});

// Fetch stats
onMounted(async () => {
    // Make sure user is loaded
    await fetchUser();
    
    // Redirect to login if not authenticated
    if (!isAuthenticated.value) {
        return navigateTo('/login');
    }
    
    try {
        const [patientsRes, doctorsRes, registrationsRes] = await Promise.all([
            $fetch<{ total: number }>('/api/patients', { params: { limit: 1 } }),
            $fetch<{ total: number }>('/api/doctors', { params: { limit: 1 } }),
            $fetch<{ total: number }>('/api/registrations', { params: { limit: 1 } }),
        ]);
        
        stats.value = {
            patients: patientsRes.total || 0,
            doctors: doctorsRes.total || 0,
            registrations: registrationsRes.total || 0,
        };
    } catch (error) {
        console.error('Failed to fetch stats:', error);
    }
});
</script>
