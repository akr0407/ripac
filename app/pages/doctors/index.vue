<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Doctors</h1>
                <p class="text-base-content/60 mt-1">Manage doctor profiles</p>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-outline gap-2" @click="openSyncModal">
                    <RefreshCw class="w-4 h-4" />
                    Sync
                </button>
                <button class="btn btn-primary gap-2" @click="openCreateModal">
                    <Plus class="w-4 h-4" />
                    Add Doctor
                </button>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="flex items-center gap-2 bg-base-100 p-2 rounded-lg border border-base-200">
             <Search class="w-4 h-4 opacity-50 ml-2" />
             <input v-model="search" @input="handleSearch" type="text" placeholder="Search doctors..." class="input input-ghost input-sm w-full focus:outline-none" />
        </div>
        
        <!-- Table -->
        <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-lg">
                        <thead>
                            <tr class="bg-base-200/50">
                                <th>Name</th>
                                <th>Specialization</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="doctor in doctors" :key="doctor.id" class="hover">
                                <td>
                                    <div class="flex items-center gap-3">
                                        <div class="avatar placeholder">
                                            <div class="bg-secondary text-secondary-content rounded-full w-10">
                                                <span>{{ doctor.fullName?.charAt(0) || '?' }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="font-bold">{{ doctor.fullName }}</div>
                                            <div class="text-sm opacity-50">{{ doctor.nickName || doctor.doctorId }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{{ doctor.specialization || '-' }}</td>
                                <td>{{ doctor.phone1 || '-' }}</td>
                                <td>
                                    <span :class="doctor.isActive ? 'badge badge-success' : 'badge badge-error'" class="badge-sm">
                                        {{ doctor.isActive ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <button class="btn btn-ghost btn-xs text-warning" @click="editDoctor(doctor)">
                                            <Edit class="w-4 h-4" />
                                        </button>
                                        <button class="btn btn-ghost btn-xs text-error" @click="confirmDeleteDoctor(doctor)">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="doctors.length === 0 && !loading" class="p-12 text-center">
                    <p class="text-base-content/50">No doctors found.</p>
                </div>

                <div v-if="loading" class="p-12 text-center text-base-content/50">
                    <span class="loading loading-spinner loading-md"></span>
                    <p class="mt-2">Loading...</p>
                </div>

                <!-- Pagination -->
                <div v-if="!loading && total > 0" class="p-4 border-t border-base-200 flex items-center justify-between">
                    <div class="text-sm text-base-content/60">
                        Showing {{ ((page - 1) * limit) + 1 }} to {{ Math.min(page * limit, total) }} of {{ total }} doctors
                    </div>
                    <div class="join">
                        <button class="join-item btn btn-sm" :disabled="page === 1" @click="page--; fetchDoctors()">«</button>
                        <button class="join-item btn btn-sm">Page {{ page }}</button>
                        <button class="join-item btn btn-sm" :disabled="page >= totalPages" @click="page++; fetchDoctors()">»</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Sync Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showSyncModal }">
                <div class="modal-box w-11/12 !max-w-7xl bg-base-100 p-0 overflow-hidden flex flex-col max-h-[90vh] text-base-content">
                    <div class="p-6 border-b border-base-200 sticky top-0 bg-base-100 z-10">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-bold text-lg flex items-center gap-2">
                                    <RefreshCw class="w-5 h-5 text-primary" />
                                    Sync Doctors from Hospital
                                </h3>
                                <p class="text-sm opacity-60">Search and import doctors from hospital database</p>
                            </div>
                            <div class="flex items-center gap-2 min-h-[32px]">
                                <div v-if="isSyncingAll" class="flex items-center gap-3 bg-base-200 px-4 py-1.5 rounded-lg h-8">
                                    <span class="loading loading-spinner loading-xs text-primary"></span>
                                    <div class="flex flex-col w-32">
                                        <div class="flex justify-between text-[10px] mb-0.5 leading-none">
                                            <span>Syncing...</span>
                                            <span>{{ syncProgress.current }}/{{ syncProgress.total }}</span>
                                        </div>
                                        <progress class="progress progress-primary w-full h-1" :value="syncProgress.current" :max="syncProgress.total"></progress>
                                    </div>
                                </div>
                                <button v-else class="btn btn-sm btn-outline btn-primary h-8 min-h-[32px]" @click="syncAllDoctors" :disabled="syncLoading || hospitalDoctors.length === 0">
                                    Sync All Pages
                                </button>
                                <button class="btn btn-sm btn-ghost btn-circle" @click="closeSyncModal">
                                    <X class="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                    </div>

                    <div class="p-6 overflow-y-auto flex-1">
                        <!-- Search -->
                        <div class="flex items-center gap-2 bg-base-200/50 p-2 rounded-lg border border-base-200 mb-6">
                            <Search class="w-4 h-4 opacity-50 ml-2" />
                            <input 
                                v-model="syncSearch" 
                                @input="handleSyncSearch" 
                                type="text" 
                                placeholder="Search by name or code..." 
                                class="input input-ghost input-sm w-full focus:outline-none" 
                            />
                        </div>

                        <!-- Table -->
                        <div v-if="syncLoading" class="text-center py-12">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                            <p class="mt-2 opacity-60">Fetching from hospital...</p>
                        </div>

                        <div v-else-if="hospitalDoctors.length === 0" class="text-center py-12 bg-base-200/30 rounded-box">
                            <p class="opacity-60">No doctors found matching your search.</p>
                        </div>

                        <div v-else class="overflow-x-auto">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>License No</th>
                                        <th class="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="doc in hospitalDoctors" :key="doc.ParamedicID">
                                        <tr v-if="!doc.isImported || doc.isDifferent" class="hover">
                                            <td class="font-mono text-sm opacity-70">{{ doc.ParamedicCode }}</td>
                                            <td class="font-medium">
                                                {{ doc.Name }}
                                                <div v-if="doc.isDifferent" class="text-xs text-warning mt-1">
                                                    Local: {{ doc.localData?.fullName }}
                                                </div>
                                            </td>
                                            <td class="text-sm opacity-70">{{ doc.LicenseNo || '-' }}</td>
                                            <td class="text-right">
                                                <button 
                                                    class="btn btn-sm"
                                                    :class="doc.isDifferent ? 'btn-warning' : 'btn-primary'"
                                                    :disabled="!!importingId"
                                                    @click="importDoctor(doc)"
                                                >
                                                    <span v-if="importingId === doc.ParamedicCode" class="loading loading-spinner loading-xs"></span>
                                                    <span v-else>{{ doc.isDifferent ? 'Update' : 'Import' }}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                    <tr v-if="hospitalDoctors.length > 0 && !hospitalDoctors.some(d => !d.isImported || d.isDifferent)">
                                        <td colspan="4" class="text-center py-8 text-base-content/50 italic">
                                            All doctors entirely synced.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination -->
                        <div v-if="!syncLoading && syncTotal > 0" class="mt-6 flex justify-center">
                            <div class="join">
                                <button class="join-item btn btn-sm" :disabled="syncPage === 1" @click="syncPage--; fetchHospitalDoctors()">«</button>
                                <button class="join-item btn btn-sm">Page {{ syncPage }}</button>
                                <button class="join-item btn btn-sm" :disabled="syncPage >= syncTotalPages" @click="syncPage++; fetchHospitalDoctors()">»</button>
                            </div>
                        </div>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="closeSyncModal">close</button>
                </form>
            </dialog>
        </Teleport>

        <!-- Create Doctor Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showCreateModal }" :data-theme="theme">
                <div class="modal-box bg-base-100 text-base-content border border-base-200 p-8 max-w-lg">
                    <h3 class="font-bold text-xl mb-6">{{ editingId ? 'Edit Doctor' : 'Add New Doctor' }}</h3>
                    
                    <form @submit.prevent="saveDoctor" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-control">
                                <label class="label pl-0">
                                    <span class="label-text font-medium">Doctor ID <span class="text-error">*</span></span>
                                </label>
                                <input 
                                    v-model="newDoctor.doctorId" 
                                    type="text" 
                                    required 
                                    class="input input-bordered focus:border-primary focus:outline-none" 
                                    placeholder="DR001" 
                                />
                            </div>
                            
                            <div class="form-control">
                                <label class="label pl-0">
                                    <span class="label-text font-medium">Nickname</span>
                                </label>
                                <input 
                                    v-model="newDoctor.nickName" 
                                    type="text" 
                                    class="input input-bordered focus:border-primary focus:outline-none" 
                                    placeholder="Dr. Smith" 
                                />
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Full Name <span class="text-error">*</span></span>
                            </label>
                            <input 
                                v-model="newDoctor.fullName" 
                                type="text" 
                                required 
                                class="input input-bordered focus:border-primary focus:outline-none" 
                                placeholder="Dr. John Smith" 
                            />
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-control">
                                <label class="label pl-0">
                                    <span class="label-text font-medium">Phone 1</span>
                                </label>
                                <input 
                                    v-model="newDoctor.phone1" 
                                    type="tel" 
                                    class="input input-bordered focus:border-primary focus:outline-none" 
                                    placeholder="+62..." 
                                />
                            </div>
                            
                            <div class="form-control">
                                <label class="label pl-0">
                                    <span class="label-text font-medium">Phone 2</span>
                                </label>
                                <input 
                                    v-model="newDoctor.phone2" 
                                    type="tel" 
                                    class="input input-bordered focus:border-primary focus:outline-none" 
                                    placeholder="+62..." 
                                />
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <label class="label pl-0">
                                <span class="label-text font-medium">Address</span>
                            </label>
                            <textarea 
                                v-model="newDoctor.address" 
                                class="textarea textarea-bordered focus:border-primary focus:outline-none" 
                                placeholder="Doctor's address"
                            ></textarea>
                        </div>
                        
                        <div v-if="createError" class="alert alert-error">
                            <span>{{ createError }}</span>
                        </div>
                        
                        <div class="modal-action mt-6 flex justify-end gap-3">
                            <button type="button" class="btn btn-ghost" @click="closeFormModal">Cancel</button>
                            <button type="submit" class="btn btn-primary font-bold px-6" :disabled="creating">
                                {{ creating ? 'Saving...' : (editingId ? 'Update Doctor' : 'Add Doctor') }}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="closeFormModal">close</button>
                </form>
            </dialog>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, X, Check, Search, Trash2, Edit } from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

const { theme } = useTheme();

interface Doctor {
    id: string;
    doctorId: string;
    nickName: string | null;
    fullName: string;
    phone1: string | null;
    specialization: string | null;
    isActive: boolean;
}

interface HospitalDoctor {
    ParamedicID: number;
    ParamedicCode: string;
    Name: string;
    LicenseNo: string;
    isImported: boolean;
    isDifferent?: boolean;
    localData?: { fullName: string } | null;
}
// Local Doctors State
const doctors = ref<Doctor[]>([]);


// Debounced search for local
let searchTimeout: any;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        page.value = 1;
        fetchDoctors();
    }, 500);
}

// Debounced search for sync
let syncSearchTimeout: any;
function handleSyncSearch() {
    clearTimeout(syncSearchTimeout);
    syncSearchTimeout = setTimeout(() => {
        syncPage.value = 1;
        fetchHospitalDoctors();
    }, 500);
}
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);
const search = ref('');
const loading = ref(false);

// Modal States
const showCreateModal = ref(false);
const showSyncModal = ref(false);

// Create Doctor State
const creating = ref(false);
const createError = ref('');
const newDoctor = ref({
    doctorId: '',
    nickName: '',
    fullName: '',
    phone1: '',
    phone2: '',
    address: '',
});

// Sync State
const syncLoading = ref(false);
const syncPage = ref(1);
const syncLimit = ref(20);
const syncTotal = ref(0);
const syncTotalPages = ref(1);
const hospitalDoctors = ref<HospitalDoctor[]>([]);
const syncSearch = ref('');
const importingId = ref<string | null>(null);
const isSyncingAll = ref(false);
const syncProgress = ref({ current: 0, total: 0 });

async function syncAllDoctors() {
    const confirmed = await confirm({
        title: 'Sync All Doctors',
        message: 'This will iterate through all pages of results and import/update them. Continue?',
        type: 'warning',
        confirmText: 'Sync All'
    });
    
    if (!confirmed) return;

    isSyncingAll.value = true;
    syncProgress.value = { current: 0, total: 0 };
    let importedCount = 0;
    
    try {
        // First get total count
        syncPage.value = 1;
        await fetchHospitalDoctors();
        const totalDocs = syncTotal.value;
        syncProgress.value = { current: 0, total: totalDocs };
        
        // Loop through pages
        let currentPage = 1;
        while (currentPage <= syncTotalPages.value && isSyncingAll.value) {
             const candidates = hospitalDoctors.value; // Get all on current page
            
            for (const doc of candidates) {
                // Only import if needed (optional optimization, but user asked for sync all)
                // For simplicity tracking progress exactly matching array loop
                if (!doc.isImported || doc.isDifferent) {
                     await importDoctor(doc, true);
                }
                importedCount++;
                syncProgress.value.current = Math.min(importedCount, totalDocs);
            }
            
            // Move to next page
            if (currentPage < syncTotalPages.value) {
                currentPage++;
                syncPage.value = currentPage; // Update ref triggers fetch
                await fetchHospitalDoctors();
            } else {
                break;
            }
        }
    } catch (error) {
        console.error('Sync All Error:', error);
    } finally {
        isSyncingAll.value = false;
        syncProgress.value = { current: 0, total: 0 };
        fetchDoctors(); // Refresh local
    }
}

// Fetch local doctors
async function fetchDoctors() {
    loading.value = true;
    try {
        const response = await $fetch<any>('/api/doctors', {
            params: {
                page: page.value,
                limit: limit.value,
                q: search.value,
            }
        });
        doctors.value = response.data || [];
        total.value = response.total || 0;
        totalPages.value = response.totalPages || 1;
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
    } finally {
        loading.value = false;
    }
}

// Fetch hospital doctors for sync
async function fetchHospitalDoctors() {
    syncLoading.value = true;
    try {
        const response = await $fetch<any>('/api/external/paramedics/search', {
            params: {
                page: syncPage.value,
                limit: syncLimit.value,
                q: syncSearch.value
            }
        });
        
        if (response.success) {
            hospitalDoctors.value = response.data || [];
            syncTotal.value = response.total || 0;
            syncTotalPages.value = response.totalPages || 1;
        }
    } catch (error) {
        console.error('Failed to fetch hospital doctors:', error);
    } finally {
        syncLoading.value = false;
    }
}

// Import single doctor
async function importDoctor(doctor: HospitalDoctor, silent = false) {
    importingId.value = doctor.ParamedicCode;
    try {
        const result = await $fetch<any>('/api/external/paramedics/import', {
            method: 'POST',
            body: {
                paramedicCode: doctor.ParamedicCode,
                name: doctor.Name
            },
            // @ts-ignore
            silent: silent // Pass silent to plugin interceptor
        });
        
        if (result.success) {
            // Update local stat
            doctor.isImported = true;
            doctor.isDifferent = false; // Reset difference flag since we just synced
            
            // Show toast only if not silent
            if (!silent) {
                 const { success } = useToast();
                 success(result.message || 'Doctor imported');
            }
        }
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        importingId.value = null;
    }
}

function openSyncModal() {
    showSyncModal.value = true;
    fetchHospitalDoctors();
}

function closeSyncModal() {
    showSyncModal.value = false;
    fetchDoctors(); // Refresh local list to show newly imported
}



// Create/Edit doctor
async function saveDoctor() {
    creating.value = true;
    createError.value = '';
    
    try {
        if (editingId.value) {
            // Update
            await $fetch(`/api/doctors/${editingId.value}`, {
                method: 'PUT',
                body: newDoctor.value,
            });
        } else {
            // Create
            await $fetch('/api/doctors', {
                method: 'POST',
                body: newDoctor.value,
            });
        }
        
        // Reset form and close modal
        closeFormModal();
        
        // Refresh list
        await fetchDoctors();
    } catch (error: any) {
        createError.value = error.data?.message || error.message || 'Failed to save doctor';
    } finally {
        creating.value = false;
    }
}

const editingId = ref<string | null>(null);

function openCreateModal() {
    editingId.value = null;
    newDoctor.value = {
        doctorId: '',
        nickName: '',
        fullName: '',
        phone1: '',
        phone2: '',
        address: '',
    };
    showCreateModal.value = true;
}

function editDoctor(doc: Doctor) {
    editingId.value = doc.id;
    newDoctor.value = {
        doctorId: doc.doctorId,
        nickName: doc.nickName || '',
        fullName: doc.fullName,
        phone1: doc.phone1 || '',
        phone2: (doc as any).phone2 || '', // Type assertion if phone2 missing in interface
        address: (doc as any).address || '',
    };
    showCreateModal.value = true;
}

function closeFormModal() {
    showCreateModal.value = false;
    editingId.value = null;
    newDoctor.value = {
        doctorId: '',
        nickName: '',
        fullName: '',
        phone1: '',
        phone2: '',
        address: '',
    };
}

const { confirm } = useConfirm();

async function confirmDeleteDoctor(doc: Doctor) {
    const confirmed = await confirm({
        title: 'Delete Doctor',
        message: `Are you sure you want to delete ${doc.fullName}?`,
        type: 'danger',
        confirmText: 'Delete'
    });
    
    if (!confirmed) return;
    
    try {
        await $fetch(`/api/doctors/${doc.id}`, { method: 'DELETE' });
        await fetchDoctors();
    } catch (e) {
        // Error toast handled by global plugin
    }
}

onMounted(() => {
    fetchDoctors();
});
</script>
