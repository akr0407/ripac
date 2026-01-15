<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <div class="text-sm breadcrumbs">
          <ul>
            <li><NuxtLink to="/patients">Patients</NuxtLink></li>
            <li>New Registration</li>
          </ul>
        </div>
        <h1 class="text-2xl font-bold">New Patient Registration</h1>
      </div>
      <button class="btn btn-primary" @click="handleSubmit" :disabled="loading">
        <Save class="w-5 h-5" />
        {{ loading ? 'Saving...' : 'Save & Continue' }}
      </button>
    </div>

    <!-- Form -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Patient Lookup Button -->
            <div class="col-span-full mb-6 flex justify-end">
                <button type="button" class="btn btn-outline btn-primary gap-2" @click="showLookupModal = true">
                    <ScanLine class="w-4 h-4" />
                    Lookup Patient
                </button>
            </div>

            <!-- Lookup Modal -->
            <Teleport to="body">
                <dialog class="modal" :class="{ 'modal-open': showLookupModal }">
                    <div class="modal-box w-11/12 max-w-4xl max-h-[85vh] flex flex-col p-0">
                        <div class="p-4 border-b border-base-200 flex justify-between items-center sticky top-0 bg-base-100 z-10">
                            <h3 class="font-bold text-lg flex items-center gap-2">
                                <ScanLine class="w-5 h-5 text-primary" />
                                Patient Lookup
                            </h3>
                            <button type="button" class="btn btn-sm btn-ghost btn-circle" @click="showLookupModal = false">
                                ✕
                            </button>
                        </div>
                        
                        <div class="p-4 overflow-y-auto flex-1">
                            <!-- Search Input -->
                            <div class="flex gap-2 mb-6">
                                <input 
                                    v-model="lookupQuery" 
                                    @keyup.enter="lookupPatient"
                                    type="text" 
                                    placeholder="Search by Name or MR Number..." 
                                    class="input input-bordered w-full" 
                                    :disabled="lookupLoading"
                                    autofocus
                                />
                                <button type="button" class="btn btn-primary" @click="lookupPatient" :disabled="lookupLoading || lookupQuery.length < 2">
                                    <Search class="w-4 h-4" />
                                    {{ lookupLoading ? 'Searching...' : 'Search' }}
                                </button>
                            </div>

                            <!-- Results -->
                            <div v-if="searched" class="space-y-6">
                                <!-- Local Results -->
                                <div v-if="lookupResults.localPatients.length > 0">
                                    <h4 class="font-bold text-sm mb-3 opacity-70 uppercase tracking-wider">Local Matches</h4>
                                    <div class="grid gap-3">
                                        <div v-for="p in lookupResults.localPatients" :key="p.id" class="flex justify-between items-center p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                                            <div>
                                                <div class="font-bold text-lg">{{ p.fullName }}</div>
                                                <div class="text-sm opacity-60 font-mono">MR: {{ p.mrNumber || '-' }}</div>
                                                <div class="text-xs opacity-60 mt-1">Phone: {{ p.phone || '-' }} | Address: {{ p.currentAddress || '-' }}</div>
                                            </div>
                                            <button type="button" class="btn btn-sm btn-ghost gap-2" @click="useLocalPatient(p)">
                                                Use
                                                <ArrowRight class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Hospital Results -->
                                <div v-if="lookupResults.hospitalApiEnabled && uniqueHospitalRegistrations.length > 0">
                                    <h4 class="font-bold text-sm mb-3 flex items-center gap-2 text-primary uppercase tracking-wider">
                                        <span>Hospital Database Matches</span>
                                        <span class="badge badge-xs badge-primary">External</span>
                                    </h4>
                                    <div class="grid gap-3">
                                        <div v-for="reg in uniqueHospitalRegistrations" :key="reg.RegistrationNo" class="flex justify-between items-center p-3 border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                                            <div>
                                                <div class="font-bold text-lg">{{ reg.PatientName }}</div>
                                                <div class="text-sm opacity-60 font-mono">MR: {{ reg.MedicalNo }}</div>
                                                <div class="text-xs opacity-60 mt-1 truncate max-w-md">{{ reg.PatientAddress }}</div>
                                            </div>
                                            <button type="button" class="btn btn-sm btn-primary gap-2" @click="importHospitalPatient(reg)">
                                                Import & Use
                                                <ArrowRight class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="lookupResults.localPatients.length === 0 && uniqueHospitalRegistrations.length === 0" class="text-center py-12 text-base-content/50 italic bg-base-200 rounded-lg">
                                    No patients found locally or in hospital database.
                                </div>
                            </div>
                        </div>
                    </div>
                </dialog>
            </Teleport>

            <!-- Patient Info -->
            <div class="form-control md:col-span-2">
              <h3 class="font-semibold text-lg mb-2">Patient Details</h3>
            </div>
            
            <div class="form-control md:col-span-2">
              <label class="label"><span class="label-text">Full Name *</span></label>
              <input v-model="form.fullName" type="text" class="input input-bordered" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">MR Number</span></label>
              <input 
                :value="form.mrNumber" 
                @input="handleMrNumberInput" 
                type="text" 
                class="input input-bordered" 
                maxlength="11"
                placeholder="00-00-00-01" 
              />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Phone</span></label>
              <input v-model="form.phone" type="text" class="input input-bordered" />
            </div>
            <div class="form-control">
              <NationalitySelect v-model="form.nationality" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Age</span></label>
              <div class="join">
                <input v-model.number="form.age" type="number" class="input input-bordered join-item w-24" min="0" />
                <select v-model="form.ageUnit" class="select select-bordered join-item">
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Sex</span></label>
              <div class="flex gap-4">
                <label class="label cursor-pointer gap-2">
                  <input v-model="form.sex" type="radio" value="male" class="radio radio-primary" />
                  <span class="label-text">Male</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input v-model="form.sex" type="radio" value="female" class="radio radio-primary" />
                  <span class="label-text">Female</span>
                </label>
              </div>
            </div>
             <div class="form-control md:col-span-2">
              <label class="label"><span class="label-text">Current Address</span></label>
              <textarea v-model="form.currentAddress" class="textarea textarea-bordered" rows="2"></textarea>
            </div>

            <!-- Registration Info -->
            <div class="form-control md:col-span-2 mt-4">
              <h3 class="font-semibold text-lg mb-2">Admission Details</h3>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">Admission Date</span></label>
              <input v-model="form.admissionDate" type="date" class="input input-bordered" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Ward</span></label>
              <input v-model="form.ward" type="text" class="input input-bordered" />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Save, Search, ScanLine, ArrowRight } from 'lucide-vue-next';
import dayjs from 'dayjs';


const loading = ref(false);

// Lookup State
const showLookupModal = ref(false);
const lookupQuery = ref('');
const lookupLoading = ref(false);
const searched = ref(false);
const lookupResults = ref<{
    localPatients: any[];
    hospitalRegistrations: any[];
    hospitalApiEnabled: boolean;
}>({
    localPatients: [],
    hospitalRegistrations: [],
    hospitalApiEnabled: false,
});

// Deduplicated hospital results
const uniqueHospitalRegistrations = computed(() => {
    const seen = new Set();
    return lookupResults.value.hospitalRegistrations.filter(reg => {
        const key = `${reg.MedicalNo}-${reg.PatientName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
});

// Look up patient
async function lookupPatient() {
    if (lookupQuery.value.length < 2) return;
    
    lookupLoading.value = true;
    searched.value = false;
    
    try {
        const response = await $fetch<any>(`/api/external/patients/search?q=${encodeURIComponent(lookupQuery.value)}`);
        lookupResults.value = response;
        searched.value = true;
    } catch (e) {
        console.error(e);
    } finally {
        lookupLoading.value = false;
    }
}

// Select Local Patient
function useLocalPatient(patient: any) {
    form.value.patientId = patient.id;
    form.value.fullName = patient.fullName;
    form.value.mrNumber = patient.mrNumber || '';
    form.value.phone = patient.phone || '';
    form.value.age = patient.age;
    form.value.ageUnit = patient.ageUnit || 'years';
    form.value.sex = patient.sex || '';
    form.value.currentAddress = patient.currentAddress || '';
    form.value.nationality = patient.nationality || '';
    
    // Clear search results and close modal
    searched.value = false;
    lookupQuery.value = '';
    showLookupModal.value = false;
}

// Import Hospital Patient
async function importHospitalPatient(reg: any) {
    loading.value = true;
    try {
        // We actually just pre-fill the form, the backend handles creating/linking based on the data
        // For existing patient logic, we rely on duplicate checks or just fill data as "new" but linked by MR Number?
        // Wait, if we submit this, registration.post creates new patient if no ID.
        // We don't have ID yet.
        // Ideally we import first to get ID. Or just fill form and let backend create.
        // But backend doesn't know about External Link unless we store it.
        // Wait, import.post stores it.
        
        // Let's call import endpoint first to get/create local patient
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
        
        // After import, search specifically for this MR to get the ID
        const searchRes = await $fetch<any>(`/api/external/patients/search?q=${encodeURIComponent(reg.MedicalNo)}`);
        const local = searchRes.localPatients.find((p: any) => p.mrNumber === reg.MedicalNo);
        
        if (local) {
            useLocalPatient(local);
        } else {
            // Fallback if search fails (shouldn't happen)
            fieldsFromHospital(reg);
        }
        
    } catch (e) {
        console.error('Import failed', e);
        // Fallback to just filling form
        fieldsFromHospital(reg);
    } finally {
        loading.value = false;
    }
}

function fieldsFromHospital(reg: any) {
    form.value.fullName = reg.PatientName;
    form.value.mrNumber = reg.MedicalNo;
    form.value.phone = reg.NoTelp || '';
    form.value.currentAddress = reg.PatientAddress || '';
    searched.value = false;
    lookupQuery.value = '';
    showLookupModal.value = false;
}

function handleMrNumberInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '').substring(0, 8); // Remove non-digits and limit to 8
  
  // Format as 00-00-00-01
  if (value.length > 6) {
    value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 6)}-${value.slice(6)}`;
  } else if (value.length > 4) {
    value = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
  } else if (value.length > 2) {
    value = `${value.slice(0, 2)}-${value.slice(2)}`;
  }
  
  form.value.mrNumber = value;
  // Force update input value if it didn't change (e.g. invalid char typed)
  if (input.value !== value) {
    input.value = value;
  }
}

const form = ref({
  patientId: '', // Added for linking
  fullName: '',
  mrNumber: '',
  phone: '',
  nationality: '',
  age: null as number | null,
  ageUnit: 'years' as 'years' | 'months' | 'days',
  sex: '' as 'male' | 'female' | '',
  currentAddress: '',
  admissionDate: dayjs().format('YYYY-MM-DD'),
  ward: '',
});

async function handleSubmit() {
  if (!form.value.fullName) {
    alert('Full name is required');
    return;
  }
  
  loading.value = true;
  try {
    // Structure payload for /api/registrations
    const payload = {
      patientId: form.value.patientId || undefined, // Send if existing
      patient: {
        fullName: form.value.fullName,
        mrNumber: form.value.mrNumber || undefined,
        phone: form.value.phone || undefined,
        age: form.value.age || undefined,
        ageUnit: form.value.ageUnit,
        nationality: form.value.nationality || undefined,
        sex: form.value.sex || undefined,
        currentAddress: form.value.currentAddress || undefined,
      },
      admissionDate: form.value.admissionDate,
      ward: form.value.ward || undefined,
    };

    const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/registrations', {
      method: 'POST',
      body: payload,
    });
    
    // Redirect to the new registration page (Medical Resume)
    navigateTo(`/registrations/${response.data.id}`);
  } catch (e: any) {
    alert(e.message || 'Failed to register patient');
  } finally {
    loading.value = false;
  }
}
</script>
