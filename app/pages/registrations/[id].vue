<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
      <div>
        <div class="text-sm breadcrumbs">
          <ul>
            <li><NuxtLink to="/patients">Patients</NuxtLink></li>
            <li v-if="registration?.patient"><NuxtLink :to="`/patients/${registration.patientId}`">{{ registration.patient.fullName }}</NuxtLink></li>
            <li>{{ registration?.registrationNumber || 'Loading...' }}</li>
          </ul>
        </div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">{{ registration?.patient?.fullName }}</h1>
          <span class="badge badge-primary">{{ registration?.registrationNumber }}</span>
          <span v-if="registration?.ward" class="badge badge-outline">{{ registration.ward }}</span>
        </div>
        <p class="text-base-content/60" v-if="registration?.patient">
          MR: {{ registration.patient.mrNumber || 'N/A' }} | Age: {{ registration.patient.age }} {{ registration.patient.ageUnit }}
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" @click="handleSaveAll" :disabled="saving">
          <Save class="w-5 h-5" />
          {{ saving ? 'Saving...' : 'Save All' }}
        </button>
        <button class="btn btn-outline" @click="printRecord">
          <Printer class="w-5 h-5" />
          Print
        </button>
      </div>
    </div>

    <!-- Print Header -->
    <div class="hidden print:block mb-8">
      <h1 class="text-3xl font-bold text-center mb-2">Medical Resume</h1>
      <div class="text-center opacity-75 mb-6">RIPAC Hospital Information System</div>
      <div class="grid grid-cols-2 gap-4 border p-4 rounded-lg" v-if="registration?.patient">
        <div>
          <p><span class="font-bold">Name:</span> {{ registration.patient.fullName }}</p>
          <p><span class="font-bold">MR Number:</span> {{ registration.patient.mrNumber }}</p>
        </div>
        <div>
          <p><span class="font-bold">Registration:</span> {{ registration.registrationNumber }}</p>
          <p><span class="font-bold">Date:</span> {{ formatDate(registration.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Stepper Navigation -->
      <div class="card bg-base-100 shadow lg:w-56 shrink-0 print:hidden">
        <div class="card-body p-4">
          <ul class="steps steps-vertical">
            <li v-for="(step, index) in steps" :key="step.key"
                class="step cursor-pointer"
                :class="{ 'step-primary': currentStep >= index }"
                @click="currentStep = index">
              {{ step.label }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Form Content -->
      <div class="card bg-base-100 shadow flex-1">
        <div class="card-body">
          <!-- Loading State -->
          <div v-if="!registration" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <template v-else>
            <!-- Step 0: Registration Info -->
            <!-- Step 0: Registration Info -->
            <div v-show="currentStep === 0" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Registration Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Registration No.</span></label>
                  <input v-model="registration.registrationNumber" type="text" class="input input-bordered" disabled />
                </div>
                 <div class="form-control">
                  <label class="label"><span class="label-text">Ward</span></label>
                  <input v-model="registration.ward" type="text" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Admission Date</span></label>
                  <input v-model="registration.admissionDate" type="date" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Discharge Date</span></label>
                  <input v-model="registration.dischargeDate" type="date" class="input input-bordered" />
                </div>
              </div>
              
              <div class="divider">Patient Information</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                 <div class="form-control">
                  <label class="label"><span class="label-text">Full Name</span></label>
                  <input :value="registration.patient.fullName" type="text" class="input input-bordered" disabled />
                </div>
                 <div class="form-control">
                  <label class="label"><span class="label-text">MR Number</span></label>
                  <input :value="registration.patient.mrNumber" type="text" class="input input-bordered" disabled />
                </div>
              </div>
            </div>

            <!-- Step 1: Medical History -->
            <!-- Step 1: Medical History -->
            <div v-show="currentStep === 1" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Medical History</h3>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Present Complaint</span></label>
                  <textarea spellcheck="true" v-model="medicalHistory.presentComplaint" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Past Medical History</span></label>
                  <textarea spellcheck="true" v-model="medicalHistory.pastMedicalHistory" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Allergic History</span></label>
                  <textarea spellcheck="true" v-model="medicalHistory.allergicHistory" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Current Medication</span></label>
                  <textarea spellcheck="true" v-model="medicalHistory.currentMedication" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
              </div>
            </div>

            <!-- Step 2: Vital Signs -->
            <!-- Step 2: Vital Signs -->
            <div v-show="currentStep === 2" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Vital Signs</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Pulse Rate (/min)</span></label>
                  <input v-model.number="vitalSigns.pulseRate" type="number" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Blood Pressure (mmHg)</span></label>
                  <input v-model="vitalSigns.bloodPressure" type="text" class="input input-bordered" placeholder="120/80" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Respiratory Rate (/min)</span></label>
                  <input v-model.number="vitalSigns.respiratoryRate" type="number" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Temperature (°C)</span></label>
                  <input v-model.number="vitalSigns.temperature" type="number" step="0.1" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">SpO2 (%)</span></label>
                  <input v-model.number="vitalSigns.spo2" type="number" class="input input-bordered" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">GCS (3-15)</span></label>
                  <input v-model.number="vitalSigns.gcs" type="number" min="3" max="15" class="input input-bordered" />
                </div>
              </div>
            </div>

            <!-- Step 3: Examination -->
            <!-- Step 3: Examination -->
            <div v-show="currentStep === 3" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Examination & Diagnosis</h3>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Physical Examination</span></label>
                  <textarea spellcheck="true" v-model="examination.physicalExamination" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Other Examinations</span></label>
                  <textarea spellcheck="true" v-model="examination.otherExamination" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Diagnosis</span></label>
                  <textarea spellcheck="true" v-model="examination.diagnosis" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Treatment</span></label>
                  <textarea spellcheck="true" v-model="examination.treatment" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
              </div>
            </div>

            <!-- Step 4: Recommendation -->
            <!-- Step 4: Recommendation -->
            <div v-show="currentStep === 4" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Doctor's Recommendation</h3>
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text w-48">Request Repatriation?</span>
                    <input v-model="recommendation.requestRepatriation" type="checkbox" class="toggle toggle-primary" />
                  </label>
                </div>
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text w-48">Requires Evacuation?</span>
                    <input v-model="recommendation.requiresEvacuation" type="checkbox" class="toggle toggle-warning" />
                  </label>
                </div>
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text w-48">Can be Transported?</span>
                    <input v-model="recommendation.canBeTransported" type="checkbox" class="toggle toggle-success" />
                  </label>
                </div>
                 <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text w-48">Fit to Fly?</span>
                    <input v-model="recommendation.fitToFly" type="checkbox" class="toggle toggle-success" />
                  </label>
                </div>
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text w-48">Needs Wheelchair?</span>
                    <input v-model="recommendation.needsWheelchair" type="checkbox" class="toggle toggle-info" />
                  </label>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">Notes</span></label>
                  <textarea spellcheck="true" v-model="recommendation.notes" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
              </div>
            </div>

            <!-- Step 5: Treating Doctor -->
            <!-- Step 5: Treating Doctor -->
            <div v-show="currentStep === 5" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Treating Doctors</h3>
              <div class="space-y-4">
                <div v-for="(_, index) in treatingDoctors" :key="index" class="form-control">
                  <label class="label"><span class="label-text">Doctor {{ index + 1 }}</span></label>
                  <select v-model="treatingDoctors[index]" class="select select-bordered">
                    <option :value="null">Select doctor</option>
                    <option v-for="doc in doctorOptions" :key="doc.value" :value="doc.value">
                      {{ doc.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 6: Comments -->
            <!-- Step 6: Comments -->
            <div v-show="currentStep === 6" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Comments</h3>
              <div class="form-control mb-4">
                <textarea v-model="newComment" spellcheck="true" class="textarea textarea-bordered" rows="3" placeholder="Add a comment..."></textarea>
                <button class="btn btn-primary mt-2 w-fit" @click="addComment" :disabled="!newComment.trim()">Add Comment</button>
              </div>
               <div class="divider"></div>
              <div v-if="comments.length" class="space-y-4">
                <div v-for="comment in comments" :key="comment.id" class="bg-base-200 p-4 rounded-lg">
                  <p class="text-sm text-base-content/60 mb-1">{{ formatDate(comment.createdAt) }}</p>
                  <p>{{ comment.commentText }}</p>
                </div>
              </div>
              <div v-else class="text-center py-8 text-base-content/60">
                No comments yet
              </div>
            </div>
          </template>

          <!-- Navigation -->
          <div class="divider print:hidden"></div>
          <div class="flex justify-between print:hidden">
            <button class="btn btn-ghost" :disabled="currentStep === 0" @click="currentStep--">
              Previous
            </button>
            <button v-if="currentStep < steps.length - 1" class="btn btn-primary" @click="currentStep++">
              Next
            </button>
            <button v-else class="btn btn-success" @click="handleSaveAll" :disabled="saving">
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Save, Printer } from 'lucide-vue-next';
import dayjs from 'dayjs';

const route = useRoute();
const registrationId = route.params.id as string;

const registration = ref<any>(null);
const currentStep = ref(0);
const saving = ref(false);

useKeyboardShortcuts([
  { key: 's', ctrl: true, handler: () => handleSaveAll(), description: 'Save all data' },
]);

const steps = [
  { key: 'info', label: 'Info & Admission' },
  { key: 'history', label: 'Medical History' },
  { key: 'vitals', label: 'Vital Signs' },
  { key: 'examination', label: 'Examination' },
  { key: 'recommendation', label: 'Recommendation' },
  { key: 'doctors', label: 'Treating Doctor' },
  { key: 'comments', label: 'Comments' },
];

const medicalHistory = ref({
  presentComplaint: '',
  pastMedicalHistory: '',
  allergicHistory: '',
  currentMedication: '',
});

const vitalSigns = ref({
  pulseRate: null as number | null,
  bloodPressure: '',
  respiratoryRate: null as number | null,
  temperature: null as number | null,
  spo2: null as number | null,
  gcs: null as number | null,
});

const examination = ref({
  physicalExamination: '',
  otherExamination: '',
  diagnosis: '',
  treatment: '',
});

const recommendation = ref({
  requestRepatriation: false,
  requiresEvacuation: false,
  canBeTransported: true,
  fitToFly: true,
  needsWheelchair: false,
  notes: '',
});

const treatingDoctors = ref<(string | null)[]>([null, null, null, null]);
const doctorOptions = ref<{ label: string; value: string }[]>([]);
const comments = ref<any[]>([]);
const newComment = ref('');

function formatDate(date: string) {
  return dayjs(date).format('DD MMM YYYY HH:mm');
}

async function fetchRegistration() {
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}`);
    registration.value = response.data;
  } catch (e) {
    alert('Failed to load registration');
    navigateTo('/patients');
  }
}

async function fetchMedicalHistory() {
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}/history`);
    if (response.data) medicalHistory.value = { ...medicalHistory.value, ...response.data };
  } catch (e) {}
}

async function fetchVitalSigns() {
  try {
    const response = await $fetch<{ data: any[] }>(`/api/registrations/${registrationId}/vitals`);
    if (response.data?.[0]) {
      const latest = response.data[0];
      vitalSigns.value = { ...vitalSigns.value, ...latest };
    }
  } catch (e) {}
}

async function fetchExamination() {
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}/examinations`);
    if (response.data) examination.value = { ...examination.value, ...response.data };
  } catch (e) {}
}

async function fetchRecommendation() {
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}/recommendations`);
    if (response.data) recommendation.value = { ...recommendation.value, ...response.data };
  } catch (e) {}
}

async function fetchTreatingDoctors() {
  try {
    const response = await $fetch<{ data: any[] }>(`/api/registrations/${registrationId}/treating-doctors`);
    if (response.data) {
      const ids = [null, null, null, null];
      response.data.forEach((d: any) => {
        if (d.doctorSequence >= 1 && d.doctorSequence <= 4) ids[d.doctorSequence - 1] = d.doctorId;
      });
      treatingDoctors.value = ids as any;
    }
  } catch (e) {}
}

async function fetchComments() {
  try {
    const response = await $fetch<{ data: any[] }>(`/api/registrations/${registrationId}/comments`);
    comments.value = response.data || [];
  } catch (e) {}
}

async function fetchDoctors() {
  try {
    const response = await $fetch<{ data: any[] }>('/api/doctors');
    doctorOptions.value = response.data.map((d: any) => ({ label: d.fullName, value: d.id }));
  } catch (e) {}
}

async function handleSaveAll() {
  saving.value = true;
  try {
    await Promise.all([
      $fetch(`/api/registrations/${registrationId}`, { method: 'PUT', body: { ward: registration.value.ward, admissionDate: registration.value.admissionDate, dischargeDate: registration.value.dischargeDate } }),
      $fetch(`/api/registrations/${registrationId}/history`, { method: 'POST', body: medicalHistory.value }),
      $fetch(`/api/registrations/${registrationId}/vitals`, { method: 'POST', body: vitalSigns.value }),
      $fetch(`/api/registrations/${registrationId}/examinations`, { method: 'POST', body: examination.value }),
      $fetch(`/api/registrations/${registrationId}/recommendations`, { method: 'POST', body: recommendation.value }),
      $fetch(`/api/registrations/${registrationId}/treating-doctors`, { method: 'POST', body: { doctors: treatingDoctors.value.map((id, index) => ({ doctorId: id, sequence: index + 1 })) } }),
    ]);
    alert('All data saved successfully!'); 
  } catch (e) {
    console.error(e);
    alert('Failed to save some data');
  } finally {
    saving.value = false;
  }
}

async function addComment() {
  if (!newComment.value.trim()) return;
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}/comments`, {
      method: 'POST',
      body: { commentText: newComment.value },
    });
    comments.value.unshift(response.data);
    newComment.value = '';
  } catch (e) {
    alert('Failed to add comment');
  }
}

onMounted(async () => {
  await fetchRegistration();
  await fetchDoctors();
  await Promise.all([
    fetchMedicalHistory(),
    fetchVitalSigns(),
    fetchExamination(),
    fetchRecommendation(),
    fetchTreatingDoctors(),
    fetchComments(),
  ]);
});

function printRecord() {
  window.print();
}
</script>
