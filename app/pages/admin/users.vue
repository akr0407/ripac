<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">User Management</h1>
                <p class="text-base-content/60 mt-1">Manage all users across organizations</p>
            </div>
            <button class="btn btn-primary gap-2" @click="openCreateModal">
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
                                <th>Organization</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th class="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id" class="hover group">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-primary text-primary-content rounded-full w-10">
                                                <span>{{ u.name.charAt(0) }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold">{{ u.name }}</div>
                                            <div class="text-xs text-base-content/60">{{ u.email }}</div>
                                            <div class="text-[10px] mt-0.5" v-if="u.isSuperadmin">
                                                <span class="badge badge-warning badge-xs">SUPERADMIN</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
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
                                    <span :class="u.isActive ? 'badge badge-success badge-outline' : 'badge badge-error badge-outline'" class="badge-sm gap-1">
                                        <div class="w-1.5 h-1.5 rounded-full" :class="u.isActive ? 'bg-success' : 'bg-error'"></div>
                                        {{ u.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="text-sm text-base-content/60">
                                    {{ u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never' }}
                                </td>
                                <td>
                                    <div class="dropdown dropdown-end">
                                        <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square">
                                            <MoreVertical class="w-4 h-4" />
                                        </div>
                                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                                            <li><a @click="openEditModal(u)"><Pencil class="w-4 h-4" /> Edit User</a></li>
                                            <li><a @click="confirmDeleteUser(u)" class="text-error"><Trash class="w-4 h-4" /> Delete</a></li>
                                        </ul>
                                    </div>
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
                    <h3 class="font-bold text-xl mb-6">{{ isEditing ? 'Edit User' : 'Add New User' }}</h3>
                    
                    <form @submit.prevent="saveUser" class="space-y-5">
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
                                <span v-if="isEditing" class="label-text-alt text-base-content/60">Leave blank to keep unchanged</span>
                            </label>
                            <div class="relative">
                                <input 
                                    v-model="newUser.password" 
                                    type="password" 
                                    :required="!isEditing"
                                    minlength="6" 
                                    class="input input-bordered focus:border-primary focus:outline-none h-12 w-full pl-10" 
                                    placeholder="••••••••" 
                                />
                                <Lock class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Organization</span>
                            </label>
                            <div class="dropdown w-full">
                                <div tabindex="0" role="button" class="input input-bordered w-full flex justify-between items-center px-4 h-12 bg-base-100">
                                    <span :class="!newUser.organizationId ? 'text-base-content/60' : ''">
                                        {{ getOrganizationName(newUser.organizationId) || 'Select organization' }}
                                    </span>
                                    <ChevronDown class="w-4 h-4 opacity-50" />
                                </div>
                                <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-full border border-base-200 mt-1 max-h-60 overflow-y-auto block">
                                    <li v-for="org in organizations" :key="org.id">
                                        <a @click="selectOrganization(org.id)" :class="{ 'active': newUser.organizationId === org.id }">
                                            {{ org.name }}
                                            <Check v-if="newUser.organizationId === org.id" class="w-4 h-4 ml-auto" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Role</span>
                            </label>
                            <div class="dropdown w-full">
                                <div tabindex="0" role="button" class="input input-bordered w-full flex justify-between items-center px-4 h-12 bg-base-100">
                                    <span :class="!newUser.role ? 'text-base-content/60' : ''">
                                        {{ getRoleLabel(newUser.role) }}
                                    </span>
                                    <ChevronDown class="w-4 h-4 opacity-50" />
                                </div>
                                <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-full border border-base-200 mt-1 block">
                                    <li v-for="role in availableRoles" :key="role.value">
                                        <a @click="selectRole(role.value)" :class="{ 'active': newUser.role === role.value }">
                                            {{ role.label }}
                                            <Check v-if="newUser.role === role.value" class="w-4 h-4 ml-auto" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div v-if="isEditing" class="form-control">
                            <label class="label cursor-pointer justify-start gap-4">
                                <span class="label-text font-medium">Active Status</span> 
                                <input type="checkbox" v-model="newUser.isActive" class="toggle toggle-success" />
                            </label>
                        </div>


                        
                        <div v-if="createError" class="alert alert-error">
                            <span>{{ createError }}</span>
                        </div>
                        
                        <div class="modal-action mt-8 flex justify-end gap-3">
                            <button type="button" class="btn btn-ghost" @click="showUserModal = false">Cancel</button>
                            <button type="submit" class="btn btn-primary font-bold px-6" :disabled="creatingUser">
                                {{ creatingUser ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create User') }}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="showUserModal = false">close</button>
                </form>
            </dialog>
        </Teleport>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showDeleteModal }" :data-theme="theme">
                <div class="modal-box bg-base-100 text-base-content border border-base-200 p-6 max-w-sm">
                    <div class="flex flex-col items-center gap-4 text-center">
                        <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                            <AlertTriangle class="w-8 h-8" />
                        </div>
                        <h3 class="font-bold text-xl">Delete User?</h3>
                        <p class="text-base-content/70">
                            Are you sure you want to delete <span class="font-bold">{{ userToDelete?.name }}</span>? 
                            This action cannot be undone.
                        </p>
                        <div class="modal-action w-full flex gap-3 mt-4">
                            <button class="btn btn-ghost flex-1" @click="showDeleteModal = false; userToDelete = null">Cancel</button>
                            <button class="btn btn-error flex-1" @click="deleteUser">Delete</button>
                        </div>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="showDeleteModal = false; userToDelete = null">close</button>
                </form>
            </dialog>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Plus, MoreVertical, Pencil, Trash, Lock, Shield, AlertTriangle, ChevronDown, Check } from 'lucide-vue-next';

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
const showDeleteModal = ref(false);
const userToDelete = ref<UserItem | null>(null);
const creatingUser = ref(false);
const createError = ref('');

const newUser = ref({
    name: '',
    email: '',
    password: '',
    organizationId: '',
    role: 'member',
    isActive: true,
});

const isEditing = ref(false);
const editingId = ref('');
const originalOrganizationId = ref<string | null>(null);

const availableRoles = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
    { value: 'readonly', label: 'Read Only' },
];

function getOrganizationName(id: string) {
    return organizations.value.find(o => o.id === id)?.name || '';
}

function getRoleLabel(value: string) {
    return availableRoles.find(r => r.value === value)?.label || value;
}

function selectOrganization(id: string) {
    newUser.value.organizationId = id;
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

function selectRole(role: string) {
    newUser.value.role = role;
     if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
}

// Reset form
function resetForm() {
    newUser.value = {
        name: '',
        email: '',
        password: '',
        organizationId: '',
        role: 'member',
        isActive: true,
    };
    isEditing.value = false;
    editingId.value = '';
    originalOrganizationId.value = null;
    createError.value = '';
}

// Open create modal
function openCreateModal() {
    resetForm();
    showUserModal.value = true;
}

// Open edit modal
function openEditModal(user: UserItem) {
    resetForm();
    isEditing.value = true;
    editingId.value = user.id;
    
    newUser.value = {
        name: user.name,
        email: user.email,
        password: '', // Leave empty to keep unchanged
        organizationId: user.organizations?.[0]?.id || '', // Pre-select first org if any
        role: user.organizations?.[0]?.role || 'member',
        isActive: user.isActive,
    };
    
    originalOrganizationId.value = user.organizations?.[0]?.id || null;
    
    showUserModal.value = true;
}

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
// Save user (create or update)
async function saveUser() {
    try {
        creatingUser.value = true;
        createError.value = '';
        
        if (isEditing.value) {
            // Update
            await $fetch(`/api/admin/users/${editingId.value}`, {
                method: 'PUT',
                body: {
                    name: newUser.value.name,
                    email: newUser.value.email,
                    isActive: newUser.value.isActive,
                    organizationId: newUser.value.organizationId,
                    role: newUser.value.role,
                    previousOrganizationId: originalOrganizationId.value,
                    ...(newUser.value.password ? { password: newUser.value.password } : {}),
                },
            });
        } else {
            // Create
            if (!newUser.value.password) {
                throw new Error('Password is required for new users');
            }
            
            await $fetch('/api/admin/users', {
                method: 'POST',
                body: newUser.value,
            });
        }
        
        showUserModal.value = false;
        await fetchUsers();
        resetForm();
    } catch (error: any) {
        createError.value = error.data?.message || error.message || 'Failed to save user';
    } finally {
        creatingUser.value = false;
    }
}

// Delete user
// Open delete confirmation
function confirmDeleteUser(user: UserItem) {
    userToDelete.value = user;
    showDeleteModal.value = true;
}

// Execute delete
async function deleteUser() {
    if (!userToDelete.value) return;
    
    try {
        await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
            method: 'DELETE',
        });
        showDeleteModal.value = false;
        userToDelete.value = null;
        await fetchUsers();
    } catch (error: any) {
        alert(error.data?.message || 'Failed to delete user');
    }
}

const { isAdmin } = useAuth();

onMounted(() => {
    if (!isAdmin.value) {
         showError({
            statusCode: 403,
            message: 'You do not have permission to access user management',
        });
        return;
    }
    fetchOrganizations();
    fetchUsers();
});
</script>
