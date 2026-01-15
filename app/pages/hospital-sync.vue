<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Hospital Sync</h1>
                <p class="text-base-content/60 mt-1">Search and import data from external hospital API</p>
            </div>
        </div>

        <!-- Hospital API Status -->
        <div v-if="!hospitalApiEnabled" class="alert alert-warning">
            <AlertTriangle class="w-5 h-5" />
            <div v-if="!envConfigured">
                <h3 class="font-bold">Missing Server Credentials</h3>
                <p class="text-sm">Server environment variables HOSPITAL_API_USERNAME or PASSWORD are missing.</p>
                <p class="text-xs mt-1">Please check .env file and server configuration.</p>
            </div>
            <div v-else-if="!urlConfigured">
                <h3 class="font-bold">Hospital API Not Configured</h3>
                <p class="text-sm">Please configure Hospital API URL in organization settings first.</p>
                <div class="mt-2">
                    <NuxtLink to="/admin/organizations" class="btn btn-sm">Configure Organization</NuxtLink>
                </div>
            </div>
            <div v-else>
                 <h3 class="font-bold">Hospital API Validation Failed</h3>
                 <p class="text-sm">Configuration seems correct but validation failed.</p>
            </div>
        </div>

        <!-- Tabs -->
        <div v-else class="tabs tabs-boxed bg-base-100 p-1 w-fit">
            <a class="tab" :class="{ 'tab-active': activeTab === 'patients' }" @click="activeTab = 'patients'">
                <Users class="w-4 h-4 mr-2" />
                Patients
            </a>
            <a class="tab" :class="{ 'tab-active': activeTab === 'doctors' }" @click="activeTab = 'doctors'">
                <Stethoscope class="w-4 h-4 mr-2" />
                Doctors
            </a>
        </div>

        <!-- Patients Tab -->
        <div v-if="hospitalApiEnabled && activeTab === 'patients'" class="space-y-4">
            <!-- Search Box -->
            <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
                <div class="card-body">
                    <h2 class="card-title text-lg">Search Patient from Hospital</h2>
                    <div class="flex gap-2">
                        <input 
                            v-model="patientSearchQuery" 
                            type="text" 
                            class="input input-bordered flex-1" 
                            placeholder="Enter patient name or MR number..."
                            @keyup.enter="searchPatients"
                        />
                        <button class="btn btn-primary" :disabled="patientSearching || patientSearchQuery.length < 2" @click="searchPatients">
                            <Search class="w-4 h-4" />
                            Search
                        </button>
                    </div>
                    <p class="text-xs text-base-content/50">Minimum 2 characters required</p>
                </div>
            </div>

            <!-- Local Patients -->
            <div v-if="localPatients.length > 0" class="card bg-base-100/70 backdrop-blur shadow border border-base-200">
                <div class="card-body">
                    <h3 class="card-title text-base">
                        <Database class="w-4 h-4" />
                        Local Database ({{ localPatients.length }})
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>MR Number</th>
                                    <th>Phone</th>
                                    <th>External Ref</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="patient in localPatients" :key="patient.id">
                                    <td class="font-medium">{{ patient.fullName }}</td>
                                    <td><code class="badge badge-ghost badge-sm">{{ patient.mrNumber }}</code></td>
                                    <td>{{ patient.phone || '-' }}</td>
                                    <td class="text-xs">{{ patient.externalRegistrationNo || '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Hospital Registrations -->
            <div v-if="hospitalRegistrations.length > 0" class="card bg-base-100/70 backdrop-blur shadow border border-base-200">
                <div class="card-body">
                    <h3 class="card-title text-base">
                        <Building2 class="w-4 h-4" />
                        Hospital API Results ({{ hospitalRegistrations.length }})
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>MR Number</th>
                                    <th>Registration</th>
                                    <th>Service Unit</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="reg in hospitalRegistrations" :key="reg.RegistrationNo">
                                    <td class="font-medium">{{ reg.PatientName }}</td>
                                    <td><code class="badge badge-ghost badge-sm">{{ reg.MedicalNo }}</code></td>
                                    <td class="text-xs">{{ reg.RegistrationNo }}</td>
                                    <td>{{ reg.ServiceUnitName }}</td>
                                    <td class="text-sm">{{ reg.ParamedicName }}</td>
                                    <td class="text-sm">{{ formatDate(reg.RegistrationDate) }}</td>
                                    <td>
                                        <button 
                                            class="btn btn-primary btn-xs" 
                                            :disabled="importingPatient === reg.RegistrationNo"
                                            @click="importPatient(reg)"
                                        >
                                            <Download class="w-3 h-3" />
                                            {{ importingPatient === reg.RegistrationNo ? 'Importing...' : 'Import' }}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="patientSearched && localPatients.length === 0 && hospitalRegistrations.length === 0" class="alert">
                <Info class="w-5 h-5" />
                <span>No patients found for "{{ patientSearchQuery }}"</span>
            </div>

            <!-- Error -->
            <div v-if="patientError" class="alert alert-error">
                <AlertCircle class="w-5 h-5" />
                <span>{{ patientError }}</span>
            </div>
        </div>

        <!-- Doctors Tab -->
        <div v-if="hospitalApiEnabled && activeTab === 'doctors'" class="space-y-4">
            <!-- Search/Fetch Box -->
            <div class="card bg-base-100/70 backdrop-blur shadow-xl border border-base-200">
                <div class="card-body">
                    <h2 class="card-title text-lg">Fetch Doctors from Hospital</h2>
                    <div class="flex gap-2 items-end">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Page</span></label>
                            <input v-model.number="doctorPage" type="number" min="1" class="input input-bordered w-24" />
                        </div>
                        <div class="form-control">
                            <label class="label"><span class="label-text">Limit</span></label>
                            <input v-model.number="doctorLimit" type="number" min="1" max="100" class="input input-bordered w-24" />
                        </div>
                        <button class="btn btn-primary" :disabled="doctorSearching" @click="fetchDoctors">
                            <Search class="w-4 h-4" />
                            Fetch Doctors
                        </button>
                    </div>
                </div>
            </div>

            <!-- Doctors Results -->
            <div v-if="hospitalDoctors.length > 0" class="card bg-base-100/70 backdrop-blur shadow border border-base-200">
                <div class="card-body">
                    <div class="flex items-center justify-between">
                        <h3 class="card-title text-base">
                            <Stethoscope class="w-4 h-4" />
                            Hospital Doctors ({{ hospitalDoctors.length }} of {{ doctorTotal }})
                        </h3>
                        <button class="btn btn-primary btn-sm" :disabled="importingAllDoctors" @click="importAllDoctors">
                            <Download class="w-4 h-4" />
                            {{ importingAllDoctors ? 'Importing...' : 'Import All' }}
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>License No</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="doc in hospitalDoctors" :key="doc.ParamedicCode">
                                    <td><code class="badge badge-primary badge-sm">{{ doc.ParamedicCode }}</code></td>
                                    <td class="font-medium">{{ doc.Name }}</td>
                                    <td class="text-xs">{{ doc.LicenseNo }}</td>
                                    <td>
                                        <button 
                                            class="btn btn-primary btn-xs" 
                                            :disabled="importingDoctor === doc.ParamedicCode"
                                            @click="importDoctor(doc)"
                                        >
                                            <Download class="w-3 h-3" />
                                            {{ importingDoctor === doc.ParamedicCode ? 'Importing...' : 'Import' }}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="flex justify-center gap-2 mt-4">
                        <button class="btn btn-sm" :disabled="doctorPage <= 1" @click="doctorPage--; fetchDoctors()">
                            Previous
                        </button>
                        <span class="btn btn-sm btn-ghost">Page {{ doctorPage }} of {{ doctorTotalPages }}</span>
                        <button class="btn btn-sm" :disabled="doctorPage >= doctorTotalPages" @click="doctorPage++; fetchDoctors()">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <!-- Error -->
            <div v-if="doctorError" class="alert alert-error">
                <AlertCircle class="w-5 h-5" />
                <span>{{ doctorError }}</span>
            </div>
        </div>

        <!-- Success Toast -->
        <div v-if="successMessage" class="toast toast-end">
            <div class="alert alert-success">
                <CheckCircle class="w-5 h-5" />
                <span>{{ successMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    Search, Download, Users, Stethoscope, Database, Building2, 
    AlertTriangle, AlertCircle, Info, CheckCircle 
} from 'lucide-vue-next';

definePageMeta({
    middleware: ['auth'],
});

// Types
interface LocalPatient {
    id: string;
    mrNumber: string | null;
    fullName: string;
    phone: string | null;
    externalRegistrationNo: string | null;
}

interface HospitalRegistration {
    RegistrationNo: string;
    RegistrationDate: string;
    ServiceUnitCode: string;
    ServiceUnitName: string;
    MedicalNo: string;
    PatientName: string;
    PatientAddress: string;
    NoTelp: string;
    ParamedicCode: string;
    ParamedicName: string;
}

interface HospitalDoctor {
    ParamedicID: number;
    ParamedicCode: string;
    Name: string;
    LicenseNo: string;
}

// State
const activeTab = ref<'patients' | 'doctors'>('patients');
const hospitalApiEnabled = ref(true);
const envConfigured = ref(true);
const urlConfigured = ref(true);

// Patient search state
const patientSearchQuery = ref('');
const patientSearching = ref(false);
const patientSearched = ref(false);
const patientError = ref('');
const localPatients = ref<LocalPatient[]>([]);
const hospitalRegistrations = ref<HospitalRegistration[]>([]);
const importingPatient = ref<string | null>(null);

// Doctor search state
const doctorPage = ref(1);
const doctorLimit = ref(10);
const doctorSearching = ref(false);
const doctorError = ref('');
const hospitalDoctors = ref<HospitalDoctor[]>([]);
const doctorTotal = ref(0);
const doctorTotalPages = ref(0);
const importingDoctor = ref<string | null>(null);
const importingAllDoctors = ref(false);

// Success message
const successMessage = ref('');

// Check if hospital API is configured
async function checkHospitalApiStatus() {
    try {
        const response = await $fetch<{ 
            configured: boolean; 
            enabled: boolean;
            baseUrl: string | null;
            organizationName: string;
            isEnvConfigured: boolean;
            isUrlConfigured: boolean;
        }>('/api/external/status');
        
        hospitalApiEnabled.value = response.configured;
        envConfigured.value = response.isEnvConfigured;
        urlConfigured.value = response.isUrlConfigured;
        
        console.log('Hospital API Status:', response);
    } catch (error: any) {
        console.error('Failed to check hospital API status:', error);
        // If error, assume not configured
        hospitalApiEnabled.value = false;
    }
}

// Search patients
async function searchPatients() {
    if (patientSearchQuery.value.length < 2) return;
    
    patientSearching.value = true;
    patientSearched.value = false;
    patientError.value = '';
    localPatients.value = [];
    hospitalRegistrations.value = [];

    try {
        const response = await $fetch<{
            localPatients: LocalPatient[];
            hospitalRegistrations: HospitalRegistration[];
            hospitalApiEnabled: boolean;
            hospitalError: string | null;
        }>(`/api/external/patients/search?q=${encodeURIComponent(patientSearchQuery.value)}`);

        localPatients.value = response.localPatients;
        hospitalRegistrations.value = response.hospitalRegistrations;
        hospitalApiEnabled.value = response.hospitalApiEnabled;
        
        if (response.hospitalError) {
            patientError.value = response.hospitalError;
        }
        
        patientSearched.value = true;
    } catch (error: any) {
        patientError.value = error.data?.message || error.message || 'Failed to search patients';
    } finally {
        patientSearching.value = false;
    }
}

// Import patient
async function importPatient(reg: HospitalRegistration) {
    importingPatient.value = reg.RegistrationNo;

    try {
        await $fetch('/api/external/patients/import', {
            method: 'POST',
            body: {
                medicalNo: reg.MedicalNo,
                patientName: reg.PatientName,
                patientAddress: reg.PatientAddress,
                phone: reg.NoTelp,
                registrationNo: reg.RegistrationNo,
                paramedicCode: reg.ParamedicCode,
                paramedicName: reg.ParamedicName,
            },
        });

        showSuccess(`Patient "${reg.PatientName}" imported successfully`);
        
        // Refresh search to update local results
        await searchPatients();
    } catch (error: any) {
        patientError.value = error.data?.message || 'Failed to import patient';
    } finally {
        importingPatient.value = null;
    }
}

// Fetch doctors
async function fetchDoctors() {
    doctorSearching.value = true;
    doctorError.value = '';

    try {
        const response = await $fetch<{
            success: boolean;
            data: HospitalDoctor[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`/api/external/paramedics/search?page=${doctorPage.value}&limit=${doctorLimit.value}`);

        hospitalDoctors.value = response.data;
        doctorTotal.value = response.total;
        doctorTotalPages.value = response.totalPages;
    } catch (error: any) {
        doctorError.value = error.data?.message || error.message || 'Failed to fetch doctors';
    } finally {
        doctorSearching.value = false;
    }
}

// Import single doctor
async function importDoctor(doc: HospitalDoctor) {
    importingDoctor.value = doc.ParamedicCode;

    try {
        await $fetch('/api/external/paramedics/import', {
            method: 'POST',
            body: {
                paramedicCode: doc.ParamedicCode,
                name: doc.Name,
            },
        });

        showSuccess(`Doctor "${doc.Name}" imported successfully`);
    } catch (error: any) {
        doctorError.value = error.data?.message || 'Failed to import doctor';
    } finally {
        importingDoctor.value = null;
    }
}

// Import all doctors on current page
async function importAllDoctors() {
    importingAllDoctors.value = true;
    let imported = 0;

    try {
        for (const doc of hospitalDoctors.value) {
            await $fetch('/api/external/paramedics/import', {
                method: 'POST',
                body: {
                    paramedicCode: doc.ParamedicCode,
                    name: doc.Name,
                },
            });
            imported++;
        }

        showSuccess(`${imported} doctors imported successfully`);
    } catch (error: any) {
        doctorError.value = error.data?.message || 'Failed to import doctors';
    } finally {
        importingAllDoctors.value = false;
    }
}

// Format date
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

// Show success message
function showSuccess(message: string) {
    successMessage.value = message;
    setTimeout(() => {
        successMessage.value = '';
    }, 3000);
}

onMounted(() => {
    checkHospitalApiStatus();
});
</script>
