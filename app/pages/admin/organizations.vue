<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Organizations</h1>
                <p class="text-base-content/60 mt-1">Manage platform tenants</p>
            </div>
            <button class="btn btn-primary gap-2" @click="openCreateModal">
                <Plus class="w-4 h-4" />
                New Organization
            </button>
        </div>
        
        <!-- Organizations Table -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-lg">
                        <thead>
                            <tr class="bg-base-200/50">
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Address</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="org in organizations" :key="org.id" class="hover">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-primary text-primary-content rounded-lg w-10">
                                                <img v-if="org.logo" :src="org.logo" alt="Logo" />
                                                <span v-else>{{ org.name.charAt(0) }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold">{{ org.name }}</div>
                                            <div class="text-sm opacity-50">{{ org.address || '—' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <code class="badge badge-ghost">{{ org.slug }}</code>
                                </td>
                                <td>
                                    <span :class="org.isActive ? 'badge badge-success' : 'badge badge-error'" class="badge-sm">
                                        {{ org.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td class="text-sm max-w-xs truncate">{{ org.address || '-' }}</td>
                                <td class="text-sm">{{ new Date(org.createdAt).toLocaleDateString() }}</td>
                                <td>
                                    <div class="join">

                                        <button class="btn btn-ghost btn-xs join-item text-warning" @click="openEditModal(org)" title="Edit">
                                            <Edit class="w-3 h-3" />
                                        </button>
                                        <button class="btn btn-ghost btn-xs join-item text-error" @click="deleteOrg(org.id)" title="Delete">
                                            <Trash2 class="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="organizations.length === 0" class="p-12 text-center">
                    <p class="text-base-content/50">No organizations found. Create one to get started.</p>
                </div>
            </div>
        </div>
        
        <!-- Create/Edit Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showModal }" :data-theme="theme">
                <div class="modal-box bg-base-100 text-base-content border border-base-200 p-8 max-w-md">
                    <h3 class="font-bold text-xl mb-6">{{ isEditing ? 'Edit Organization' : 'Create New Organization' }}</h3>
                    
                    <form @submit.prevent="saveOrg" class="space-y-4">
                        <!-- Name -->
                        <div class="form-control">
                            <label class="label pl-0"><span class="label-text font-medium">Name</span></label>
                            <input v-model="formData.name" type="text" required class="input input-bordered h-10" placeholder="Organization Name" />
                        </div>
                        
                        <!-- Slug -->
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Slug</span>
                                <span class="label-text-alt opacity-60">URL identifier</span>
                            </label>
                            <input v-model="formData.slug" type="text" required pattern="[a-z0-9-]+" class="input input-bordered h-10" placeholder="org-slug" />
                        </div>

                         <!-- Logo Upload -->
                        <div class="form-control">
                            <label class="label pl-0"><span class="label-text font-medium">Logo</span></label>
                             <div v-if="formData.logo" class="mb-4 p-4 border border-base-200 rounded-lg bg-base-50/50 flex justify-center">
                                <img :src="formData.logo" class="max-w-full h-auto max-h-32 object-contain shadow-sm rounded" />
                             </div>
                             
                             <div class="flex items-center gap-4">
                                <div class="avatar placeholder">
                                    <div class="bg-neutral text-neutral-content rounded w-12 h-12">
                                         <img v-if="formData.logo" :src="formData.logo" />
                                         <span v-else>Logo</span>
                                    </div>
                                </div>
                                <input type="file" accept="image/*" class="file-input file-input-bordered w-full" @change="handleFileUpload" />
                             </div>
                        </div>

                        <!-- Address -->
                        <div class="form-control">
                            <label class="label pl-0"><span class="label-text font-medium">Address</span></label>
                            <textarea v-model="formData.address" class="textarea textarea-bordered h-20" placeholder="Full Address"></textarea>
                        </div>

                         <!-- Contact Info -->
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-control">
                                <label class="label pl-0"><span class="label-text font-medium">Phone</span></label>
                                <input v-model="formData.phone" type="text" class="input input-bordered h-10" placeholder="+62..." />
                            </div>
                            <div class="form-control">
                                <label class="label pl-0"><span class="label-text font-medium">Fax</span></label>
                                <input v-model="formData.fax" type="text" class="input input-bordered h-10" placeholder="+62..." />
                            </div>
                         </div>
                         
                         <div class="form-control">
                            <label class="label pl-0"><span class="label-text font-medium">Email</span></label>
                            <input v-model="formData.email" type="email" class="input input-bordered h-10" placeholder="contact@example.com" />
                         </div>
                        
                        <!-- Description -->
                        <div class="form-control">
                            <label class="label pl-0"><span class="label-text font-medium">Description</span></label>
                            <textarea v-model="formData.description" class="textarea textarea-bordered h-16" placeholder="Brief description"></textarea>
                        </div>

                        <!-- Hospital API Integration -->
                        <div class="divider text-xs text-base-content/50">Hospital API Integration</div>
                        
                        <div class="form-control">
                            <label class="cursor-pointer label justify-start gap-4">
                                <span class="label-text font-medium">Enable Hospital API</span>
                                <input type="checkbox" v-model="formData.hospitalApiEnabled" class="toggle toggle-primary" />
                            </label>
                            <span class="label-text-alt text-base-content/50 ml-1">Enable integration with external hospital API</span>
                        </div>
                        
                        <div v-if="formData.hospitalApiEnabled" class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Hospital API Base URL</span>
                            </label>
                            <input v-model="formData.hospitalApiBaseUrl" type="text" class="input input-bordered h-10" placeholder="http://10.10.10.99:3020/api" />
                            <span class="label-text-alt text-base-content/50 mt-1">Base URL of the hospital API (e.g., http://10.10.10.99:3020/api)</span>
                        </div>

                         <!-- Is Active -->
                         <div class="form-control">
                            <label class="cursor-pointer label justify-start gap-4">
                                <span class="label-text font-medium">Active Status</span>
                                <input type="checkbox" v-model="formData.isActive" class="toggle toggle-success" />
                            </label>
                        </div>
                        
                        <div v-if="error" class="alert alert-error text-sm py-2"><span>{{ error }}</span></div>
                        
                        <div class="modal-action mt-6 flex justify-end gap-3">
                            <button type="button" class="btn btn-ghost" @click="showModal = false">Cancel</button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="showModal = false">close</button>
                </form>
            </dialog>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2, Upload } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

const { theme } = useTheme();

interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    logo?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    fax?: string | null;
    settings?: {
        hospitalApi?: {
            enabled: boolean;
            baseUrl: string;
        };
        [key: string]: unknown;
    };
}

const organizations = ref<Organization[]>([]);
const showModal = ref(false);
const isEditing = ref(false);

// Organization create/edit state
const loading = ref(false);
const error = ref('');
const formData = ref({
    id: '',
    name: '',
    slug: '',
    description: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    fax: '',
    isActive: true,
    hospitalApiEnabled: false,
    hospitalApiBaseUrl: ''
});

// Fetch organizations
async function fetchOrganizations() {
    try {
        const response = await $fetch<{ organizations: Organization[] }>('/api/admin/organizations');
        organizations.value = response.organizations;
    } catch (err) {
        console.error('Failed to fetch organizations:', err);
    }
}

// Open modal for create
function openCreateModal() {
    isEditing.value = false;
    formData.value = { 
        id: '', name: '', slug: '', description: '', logo: '', 
        address: '', phone: '', email: '', fax: '', isActive: true,
        hospitalApiEnabled: false, hospitalApiBaseUrl: ''
    };
    error.value = '';
    showModal.value = true;
}

// Open modal for edit
function openEditModal(org: Organization) {
    isEditing.value = true;
    formData.value = { 
        id: org.id,
        name: org.name, 
        slug: org.slug, 
        description: org.description || '', 
        logo: org.logo || '',
        address: org.address || '',
        phone: org.phone || '',
        email: org.email || '',
        fax: org.fax || '',
        isActive: org.isActive,
        hospitalApiEnabled: org.settings?.hospitalApi?.enabled || false,
        hospitalApiBaseUrl: org.settings?.hospitalApi?.baseUrl || ''
    };
    error.value = '';
    showModal.value = true;
}

// Handle file upload
async function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const navFormData = new FormData();
    navFormData.append('file', file);

    try {
        const response = await $fetch<{ url: string }>('/api/upload', {
            method: 'POST',
            body: navFormData
        });
        formData.value.logo = response.url;
    } catch (e) {
        alert('Failed to upload logo');
    }
}

// Save organization (Create or Update)
async function saveOrg() {
    loading.value = true;
    error.value = '';
    
    try {
        if (isEditing.value) {
            await $fetch(`/api/admin/organizations/${formData.value.id}`, {
                method: 'PUT',
                body: formData.value,
            });
        } else {
            await $fetch('/api/admin/organizations', {
                method: 'POST',
                body: formData.value,
            });
        }
        
        showModal.value = false;
        await fetchOrganizations();
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to save organization';
    } finally {
        loading.value = false;
    }
}

// Delete organization
async function deleteOrg(id: string) {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
    
    try {
        await $fetch(`/api/admin/organizations/${id}`, { method: 'DELETE' });
        await fetchOrganizations();
    } catch (err) {
        alert('Failed to delete organization');
    }
}

const { isAdmin } = useAuth();
onMounted(() => {
    if (!isAdmin.value) {
         showError({
            statusCode: 403,
            message: 'You do not have permission to manage organizations',
        });
        return;
    }
    fetchOrganizations();
});
</script>
