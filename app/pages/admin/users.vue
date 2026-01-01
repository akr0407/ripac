<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">User Management</h1>
                <p class="text-base-content/60 mt-1">Manage all users across organizations</p>
            </div>
            <button class="btn btn-primary gap-2" @click="showUserModal = true">
                <Plus class="w-4 h-4" />
                Add User
            </button>
        </div>
        
        <!-- Users Table -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-lg">
                        <thead>
                            <tr class="bg-base-200/50">
                                <th>User</th>
                                <th>Email</th>
                                <th>Organization</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id" class="hover">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-primary text-primary-content rounded-full w-10">
                                                <span>{{ u.name.charAt(0) }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold">{{ u.name }}</div>
                                            <div class="text-sm opacity-50" v-if="u.isSuperadmin">
                                                <span class="badge badge-warning badge-xs">Superadmin</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="text-base-content/70">{{ u.email }}</td>
                                <td>
                                    <div class="flex flex-wrap gap-1">
                                        <span v-for="org in u.organizations" :key="org.id" class="badge badge-ghost badge-sm">
                                            {{ org.name }}
                                        </span>
                                        <span v-if="!u.organizations?.length" class="text-base-content/40 text-sm">-</span>
                                    </div>
                                </td>
                                <td>
                                    <span v-if="u.organizations?.length" class="badge badge-outline badge-sm">
                                        {{ u.organizations[0]?.role || '-' }}
                                    </span>
                                </td>
                                <td>
                                    <span :class="u.isActive ? 'badge badge-success' : 'badge badge-error'" class="badge-sm">
                                        {{ u.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="text-sm text-base-content/60">
                                    {{ u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="users.length === 0" class="p-12 text-center">
                    <p class="text-base-content/50">No users found.</p>
                </div>
            </div>
        </div>
        
        <!-- Create User Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showUserModal }" :data-theme="theme">
                <div class="modal-box bg-base-100 text-base-content border border-base-200 p-8 max-w-md">
                    <h3 class="font-bold text-xl mb-6">Add New User</h3>
                    
                    <form @submit.prevent="createUser" class="space-y-5">
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Name</span>
                            </label>
                            <input 
                                v-model="newUser.name" 
                                type="text" 
                                required 
                                class="input input-bordered focus:border-primary focus:outline-none h-12" 
                                placeholder="John Doe" 
                            />
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Email</span>
                            </label>
                            <input 
                                v-model="newUser.email" 
                                type="email" 
                                required 
                                class="input input-bordered focus:border-primary focus:outline-none h-12" 
                                placeholder="john@example.com" 
                            />
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Password</span>
                            </label>
                            <input 
                                v-model="newUser.password" 
                                type="password" 
                                required 
                                minlength="6" 
                                class="input input-bordered focus:border-primary focus:outline-none h-12" 
                                placeholder="••••••••" 
                            />
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Organization</span>
                            </label>
                            <select 
                                v-model="newUser.organizationId" 
                                required 
                                class="select select-bordered focus:border-primary focus:outline-none h-12"
                            >
                                <option value="" disabled>Select organization</option>
                                <option v-for="org in organizations" :key="org.id" :value="org.id">
                                    {{ org.name }}
                                </option>
                            </select>
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Role</span>
                            </label>
                            <select 
                                v-model="newUser.role" 
                                required 
                                class="select select-bordered focus:border-primary focus:outline-none h-12"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="owner">Owner</option>
                                <option value="readonly">Read Only</option>
                            </select>
                        </div>
                        
                        <div v-if="createError" class="alert alert-error">
                            <span>{{ createError }}</span>
                        </div>
                        
                        <div class="modal-action mt-8 flex justify-end gap-3">
                            <button type="button" class="btn btn-ghost" @click="showUserModal = false">Cancel</button>
                            <button type="submit" class="btn btn-primary font-bold px-6" :disabled="creatingUser">
                                {{ creatingUser ? 'Creating...' : 'Create User' }}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="showUserModal = false">close</button>
                </form>
            </dialog>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

const { theme } = useTheme();

interface Organization {
    id: string;
    name: string;
    slug: string;
}

interface UserItem {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    isSuperadmin: boolean;
    lastLoginAt?: string;
    organizations?: { id: string; name: string; role: string }[];
}

const organizations = ref<Organization[]>([]);
const users = ref<UserItem[]>([]);
const showUserModal = ref(false);
const creatingUser = ref(false);
const createError = ref('');

const newUser = ref({
    name: '',
    email: '',
    password: '',
    organizationId: '',
    role: 'member',
});

// Fetch organizations
async function fetchOrganizations() {
    try {
        const response = await $fetch<{ organizations: Organization[] }>('/api/admin/organizations');
        organizations.value = response.organizations;
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
    }
}

// Fetch users with organizations
async function fetchUsers() {
    try {
        const response = await $fetch<{ users: UserItem[] }>('/api/admin/users');
        users.value = response.users;
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}

// Create user
async function createUser() {
    creatingUser.value = true;
    createError.value = '';
    
    try {
        await $fetch('/api/admin/users', {
            method: 'POST',
            body: newUser.value,
        });
        
        // Reset form and close modal
        newUser.value = {
            name: '',
            email: '',
            password: '',
            organizationId: '',
            role: 'member',
        };
        showUserModal.value = false;
        
        // Refresh users list
        await fetchUsers();
    } catch (error: any) {
        createError.value = error.data?.message || error.message || 'Failed to create user';
    } finally {
        creatingUser.value = false;
    }
}

onMounted(() => {
    fetchOrganizations();
    fetchUsers();
});
</script>
