<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Profile</h1>
                <p class="text-base-content/60 mt-1">Manage your account settings</p>
            </div>
        </div>
        
        <!-- Profile Card -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body">
                <div class="flex items-center gap-6">
                    <div class="avatar placeholder">
                        <div class="bg-primary text-primary-content rounded-full w-20">
                            <span class="text-3xl">{{ userInitials }}</span>
                        </div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">{{ user?.name || 'User' }}</h2>
                        <p class="text-base-content/60">{{ user?.email }}</p>
                        <div class="mt-2">
                            <span v-if="user?.isSuperadmin" class="badge badge-warning">Superadmin</span>
                            <span v-else class="badge badge-outline">Member</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Account Info -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body">
                <h3 class="card-title mb-4">Account Information</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">Full Name</span>
                        </label>
                        <input 
                            type="text" 
                            :value="user?.name" 
                            disabled
                            class="input input-bordered bg-base-200/50" 
                        />
                    </div>
                    
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">Email</span>
                        </label>
                        <input 
                            type="email" 
                            :value="user?.email" 
                            disabled
                            class="input input-bordered bg-base-200/50" 
                        />
                    </div>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm text-base-content/60">
                        To update your account information, please contact an administrator.
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Organizations -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body">
                <h3 class="card-title mb-4">Organizations</h3>
                
                <div class="space-y-2">
                    <div 
                        v-for="org in user?.organizations" 
                        :key="org.id"
                        class="flex items-center justify-between p-3 rounded-lg bg-base-200/50"
                    >
                        <div class="flex items-center gap-3">
                            <div class="avatar placeholder">
                                <div class="bg-primary text-primary-content rounded w-10">
                                    <span>{{ org.name.charAt(0) }}</span>
                                </div>
                            </div>
                            <div>
                                <p class="font-medium">{{ org.name }}</p>
                                <p class="text-sm text-base-content/60">{{ org.role }}</p>
                            </div>
                        </div>
                        <span 
                            v-if="currentOrganization?.id === org.id" 
                            class="badge badge-primary"
                        >
                            Current
                        </span>
                    </div>
                    
                    <div v-if="!user?.organizations?.length" class="text-center py-4">
                        <p class="text-base-content/50">No organizations found.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
});

const { user, currentOrganization } = useAuth();

const userInitials = computed(() => {
    const name = user.value?.name || 'User';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.substring(0, 2).toUpperCase();
});
</script>
