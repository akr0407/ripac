<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">System Administration</h1>
                <p class="text-base-content/60 mt-1">Manage organizations and users across the platform</p>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink to="/admin/organizations" class="group">
                <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200 w-full hover:border-primary/50 transition-all card-hover-effect">
                    <div class="stat">
                        <div class="stat-figure text-primary group-hover:scale-110 transition-transform">
                            <Building class="w-8 h-8" />
                        </div>
                        <div class="stat-title">Organizations</div>
                        <div class="stat-value text-primary">{{ stats.organizations }}</div>
                        <div class="stat-desc">Active tenants</div>
                    </div>
                </div>
            </NuxtLink>
            
            <NuxtLink to="/admin/users" class="group">
                <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200 w-full hover:border-secondary/50 transition-all card-hover-effect">
                    <div class="stat">
                        <div class="stat-figure text-secondary group-hover:scale-110 transition-transform">
                            <Users class="w-8 h-8" />
                        </div>
                        <div class="stat-title">Total Users</div>
                        <div class="stat-value text-secondary">{{ stats.users }}</div>
                        <div class="stat-desc">Across all organizations</div>
                    </div>
                </div>
            </NuxtLink>
            
            <div class="stats shadow-lg bg-base-100/60 backdrop-blur border border-base-200">
                <div class="stat">
                    <div class="stat-figure text-accent">
                        <Shield class="w-8 h-8" />
                    </div>
                    <div class="stat-title">Your Role</div>
                    <div class="stat-value text-accent text-2xl">Superadmin</div>
                    <div class="stat-desc">Full system access</div>
                </div>
            </div>
        </div>
        
        <!-- Recent Activity (Placeholder for Overview) -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body">
                <h2 class="card-title mb-4">Quick Links</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NuxtLink to="/admin/organizations" class="btn btn-outline h-auto py-4 flex-col gap-2">
                        <Building class="w-6 h-6" />
                        <span>Manage Organizations</span>
                        <span class="text-xs font-normal opacity-60">Add, edit, or view tenants</span>
                    </NuxtLink>
                    <NuxtLink to="/admin/users" class="btn btn-outline h-auto py-4 flex-col gap-2">
                        <Users class="w-6 h-6" />
                        <span>Manage Users</span>
                        <span class="text-xs font-normal opacity-60">Create users, assign roles</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Building, Users, Shield } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

const stats = ref({
    organizations: 0,
    users: 0,
});

onMounted(async () => {
    try {
        const [orgsRes, usersRes] = await Promise.all([
            $fetch<{ organizations: any[] }>('/api/admin/organizations'),
            $fetch<{ users: any[] }>('/api/admin/users'),
        ]);
        
        stats.value = {
            organizations: orgsRes.organizations?.length || 0,
            users: usersRes.users?.length || 0,
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
    }
});
</script>
