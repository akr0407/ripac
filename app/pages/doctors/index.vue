<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Doctors</h1>
                <p class="text-base-content/60 mt-1">Manage doctor profiles</p>
            </div>
            <button class="btn btn-primary gap-2" @click="showCreateModal = true">
                <Plus class="w-4 h-4" />
                Add Doctor
            </button>
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
                                    <NuxtLink :to="`/doctors/${doctor.id}`" class="btn btn-ghost btn-sm">
                                        View
                                    </NuxtLink>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div v-if="doctors.length === 0" class="p-12 text-center">
                    <p class="text-base-content/50">No doctors found.</p>
                </div>
            </div>
        </div>
        
        <!-- Create Doctor Modal -->
        <Teleport to="body">
            <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showCreateModal }" :data-theme="theme">
                <div class="modal-box bg-base-100 text-base-content border border-base-200 p-8 max-w-lg">
                    <h3 class="font-bold text-xl mb-6">Add New Doctor</h3>
                    
                    <form @submit.prevent="createDoctor" class="space-y-4">
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
                            <button type="button" class="btn btn-ghost" @click="showCreateModal = false">Cancel</button>
                            <button type="submit" class="btn btn-primary font-bold px-6" :disabled="creating">
                                {{ creating ? 'Creating...' : 'Add Doctor' }}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                    <button @click="showCreateModal = false">close</button>
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

interface Doctor {
    id: string;
    doctorId: string;
    nickName: string | null;
    fullName: string;
    phone1: string | null;
    specialization: string | null;
    isActive: boolean;
}

const doctors = ref<Doctor[]>([]);
const showCreateModal = ref(false);
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

// Fetch doctors
async function fetchDoctors() {
    try {
        const response = await $fetch<{ data: Doctor[] }>('/api/doctors');
        doctors.value = response.data || [];
    } catch (error) {
        console.error('Failed to fetch doctors:', error);
    }
}

// Create doctor
async function createDoctor() {
    creating.value = true;
    createError.value = '';
    
    try {
        await $fetch('/api/doctors', {
            method: 'POST',
            body: newDoctor.value,
        });
        
        // Reset form and close modal
        newDoctor.value = {
            doctorId: '',
            nickName: '',
            fullName: '',
            phone1: '',
            phone2: '',
            address: '',
        };
        showCreateModal.value = false;
        
        // Refresh list
        await fetchDoctors();
    } catch (error: any) {
        createError.value = error.data?.message || error.message || 'Failed to create doctor';
    } finally {
        creating.value = false;
    }
}

onMounted(() => {
    fetchDoctors();
});
</script>
