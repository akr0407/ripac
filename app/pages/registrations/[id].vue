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

        <button class="btn btn-secondary" @click="handleDownloadPdf(false)" :disabled="isGeneratingPdf">
          <Download class="w-5 h-5" />
          {{ isGeneratingPdf ? 'Generating...' : 'Download PDF' }}
        </button>
        <button class="btn btn-outline" @click="handleDownloadPdf(true)" :disabled="isGeneratingPdf">
          <Eye class="w-5 h-5" />
          Preview PDF
        </button>
      </div>
    </div>



    <!-- Web Layout (Hidden when printing) -->
    <div class="flex flex-col lg:flex-row gap-6 print:hidden">
      <!-- Stepper Navigation -->
      <div class="card bg-base-100 shadow lg:w-56 shrink-0">
        <div class="card-body p-4">
          <ul class="steps steps-vertical">
            <li v-for="(step, index) in steps" :key="step.key"
                class="step cursor-pointer"
                :class="{ 'step-primary': currentStep >= index }"
                @click="goToStep(index)">
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
                  <DoctorSelect 
                    v-model="registration.managerOnDutyId" 
                    :options="doctorOptions" 
                    label="Manager on Duty" 
                    placeholder="Select Manager" 
                  />
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
                  <label class="label">
                    <span class="label-text">Present Complaint</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(medicalHistory, 'presentComplaint')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="medicalHistory.presentComplaint" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Past Medical History</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(medicalHistory, 'pastMedicalHistory')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="medicalHistory.pastMedicalHistory" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Allergic History</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(medicalHistory, 'allergicHistory')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="medicalHistory.allergicHistory" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Current Medication</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(medicalHistory, 'currentMedication')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="medicalHistory.currentMedication" class="textarea textarea-bordered" rows="2"></textarea>
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
                  <label class="label">
                    <span class="label-text">Physical Examination</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(examination, 'physicalExamination')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="examination.physicalExamination" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Other Examinations</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(examination, 'otherExamination')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="examination.otherExamination" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Diagnosis</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(examination, 'diagnosis')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="examination.diagnosis" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Diff. Diagnose</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(examination, 'differentialDiagnosis')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="examination.differentialDiagnosis" class="textarea textarea-bordered" rows="2"></textarea>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Treatment</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(examination, 'treatment')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="examination.treatment" class="textarea textarea-bordered" rows="3"></textarea>
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
                  <div class="flex items-center gap-4">
                     <label class="label cursor-pointer justify-start gap-4 flex-none w-64">
                        <span class="label-text w-48">Can be Transported?</span>
                        <input v-model="recommendation.canBeTransported" type="checkbox" class="toggle toggle-success" />
                      </label>
                      <input 
                        v-if="recommendation.canBeTransported" 
                        v-model="recommendation.canBeTransportedNote" 
                        type="text" 
                        placeholder="Transport details..." 
                        class="input input-bordered input-sm flex-1" 
                      />
                  </div>
                </div>
                 <div class="form-control">
                   <div class="flex items-center gap-4">
                      <label class="label cursor-pointer justify-start gap-4 flex-none w-64">
                        <span class="label-text w-48">Fit to Fly?</span>
                        <input v-model="recommendation.fitToFly" type="checkbox" class="toggle toggle-success" />
                      </label>
                       <input 
                        v-if="recommendation.fitToFly" 
                        v-model="recommendation.fitToFlyNote" 
                        type="text" 
                        placeholder="Fit to fly details..." 
                        class="input input-bordered input-sm flex-1" 
                      />
                   </div>
                </div>
                <div class="form-control">
                   <div class="flex items-center gap-4">
                      <label class="label cursor-pointer justify-start gap-4 flex-none w-64">
                        <span class="label-text w-48">Needs Wheelchair?</span>
                        <input v-model="recommendation.needsWheelchair" type="checkbox" class="toggle toggle-info" />
                      </label>
                      <input 
                        v-if="recommendation.needsWheelchair" 
                        v-model="recommendation.needsWheelchairNote" 
                        type="text" 
                        placeholder="Wheelchair details..." 
                        class="input input-bordered input-sm flex-1" 
                      />
                   </div>
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Notes</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(recommendation, 'notes')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                  <textarea spellcheck="true" autocorrect="on" autocapitalize="sentences" autocomplete="on" v-model="recommendation.notes" class="textarea textarea-bordered" rows="3"></textarea>
                </div>
              </div>
            </div>

            <!-- Step 5: Treating Doctor -->
            <!-- Step 5: Treating Doctor -->
            <div v-show="currentStep === 5" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Treating Doctors</h3>
              <div class="space-y-4">
                <div v-for="(doc, index) in treatingDoctors" :key="index" class="form-control p-4 border rounded-lg bg-base-100">
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                        <DoctorSelect 
                            v-model="treatingDoctors[index].id" 
                            :options="doctorOptions" 
                            :label="`Doctor ${index + 1}`"
                            placeholder="Select doctor"
                        />
                    </div>
                    <!-- Main doctor selector hidden as it is always Doctor 1 -->
                    <!-- <div class="form-control" v-if="treatingDoctors[index].id">
                         <label class="label cursor-pointer flex flex-col items-center gap-2">
                            <span class="label-text text-xs font-bold">Main</span>
                            <input type="radio" name="mainDoctor" class="radio radio-primary" 
                                :checked="treatingDoctors[index].isMain"
                                @change="treatingDoctors.forEach((d, i) => d.isMain = i === index)"
                            />
                        </label>
                    </div> -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 6: Comments -->
            <!-- Step 6: Comments -->
            <div v-show="currentStep === 6" class="print:!block">
              <h3 class="text-lg font-semibold mb-4">Comments</h3>
              <div class="form-control mb-4">
                 <label class="label">
                    <span class="label-text">Add a comment...</span>
                    <button class="btn btn-ghost btn-xs" @click="applyAutoCorrect(newComment, 'text')" :disabled="!isAutoCorrectReady" title="Auto Fix Spelling (English)">
                        <Wand2 class="w-3 h-3" /> Fix
                    </button>
                  </label>
                <textarea v-model="newComment.text" spellcheck="true" class="textarea textarea-bordered" rows="3" placeholder="Type here..."></textarea>
                <button class="btn btn-primary mt-2 w-fit" @click="addComment" :disabled="!newComment.text.trim()">Add Comment</button>
              </div>
               <div class="divider"></div>
              <div v-if="comments.length" class="space-y-4">
                <div v-for="comment in comments" :key="comment.id" class="bg-base-200 p-4 rounded-lg group">
                  <div class="flex justify-between items-start mb-1">
                    <p class="text-sm text-base-content/60">{{ formatDate(comment.createdAt) }}</p>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" v-if="editingCommentId !== comment.id">
                        <button class="btn btn-ghost btn-xs text-primary" @click="startEditComment(comment)" title="Edit">
                            <Pencil class="w-3 h-3" />
                        </button>
                        <button class="btn btn-ghost btn-xs text-error" @click="deleteComment(comment.id)" title="Delete">
                            <Trash2 class="w-3 h-3" />
                        </button>
                    </div>
                  </div>
                  
                  <div v-if="editingCommentId === comment.id">
                     <textarea v-model="editingCommentText" class="textarea textarea-bordered w-full mb-2" rows="2"></textarea>
                     <div class="flex gap-2 justify-end">
                         <button class="btn btn-ghost btn-sm" @click="cancelEditComment">Cancel</button>
                         <button class="btn btn-primary btn-sm" @click="updateComment(comment.id)" :disabled="!editingCommentText.trim()">Save</button>
                     </div>
                  </div>
                  <p v-else>{{ comment.commentText }}</p>
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
            <button class="btn btn-ghost" :disabled="currentStep === 0 || saving" @click="goToPrevStep">
              Previous
            </button>
            <button v-if="currentStep < steps.length - 1" class="btn btn-primary" :disabled="saving" @click="goToNextStep">
              {{ saving ? 'Saving...' : 'Next' }}
            </button>
            <button v-else class="btn btn-success" @click="handleSaveAll" :disabled="saving">
              {{ saving ? 'Saving...' : 'Complete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- PDF Preview Modal -->
    <PdfPreviewDialog 
        id="pdf_preview_modal" 
        :url="pdfPreviewUrl" 
        @close="closePreview" 
    />

    <SpellingReviewModal 
        ref="spellingModal"
        :model-value="true"
        :segments="spellingSegments" 
        @save="handleSpellingSave"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

import { Save, Download, Eye, Wand2, Pencil, Trash2 } from 'lucide-vue-next';
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

const { checkSpelling, isReady: isAutoCorrectReady } = useAutoCorrect();

// Spelling Modal State
const spellingModal = ref();
const spellingSegments = ref<any[]>([]);
const editingTarget = ref<any>(null);
const editingKey = ref<string>('');

function applyAutoCorrect(target: any, key: string) {
    if (!target || !target[key]) return;
    
    editingTarget.value = target;
    editingKey.value = key;

    const { segments, typoCount } = checkSpelling(target[key]);
    
    if (typoCount > 0) {
        spellingSegments.value = segments;
        spellingModal.value?.show();
    } else {
        alert('No spelling errors found.');
    }
}

function handleSpellingSave(correctedText: string) {
    if (editingTarget.value && editingKey.value) {
        editingTarget.value[editingKey.value] = correctedText;
    }
}

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
  differentialDiagnosis: '',
  treatment: '',
});

const recommendation = ref({
  requestRepatriation: false,
  requiresEvacuation: false,
  canBeTransported: true,
  canBeTransportedNote: '',
  fitToFly: true,
  fitToFlyNote: '',
  needsWheelchair: false,
  needsWheelchairNote: '',
  notes: '',
});

const treatingDoctors = ref<{ id: string | undefined; isMain: boolean }[]>([
  { id: undefined, isMain: false },
  { id: undefined, isMain: false },
  { id: undefined, isMain: false },
  { id: undefined, isMain: false }
]);
const doctorOptions = ref<{ label: string; value: string }[]>([]);
const comments = ref<any[]>([]);
const newComment = ref({ text: '' });
const editingCommentId = ref<string | null>(null);
const editingCommentText = ref('');

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
      const docs = [
        { id: undefined, isMain: false },
        { id: undefined, isMain: false },
        { id: undefined, isMain: false },
        { id: undefined, isMain: false }
      ];
      response.data.forEach((d: any) => {
        if (d.doctorSequence >= 1 && d.doctorSequence <= 4) {
          docs[d.doctorSequence - 1] = { id: d.doctorId, isMain: d.isMain || false };
        }
      });
      treatingDoctors.value = docs as any;
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
    console.log('[fetchDoctors] Fetching doctors...');
    const response = await $fetch<{ data: any[] }>('/api/doctors?all=true');
    console.log('[fetchDoctors] Response:', response);
    doctorOptions.value = response.data.map((d: any) => ({ label: d.fullName, value: d.id }));
    console.log('[fetchDoctors] Mapped options:', doctorOptions.value);
  } catch (e) {
    console.error('[fetchDoctors] Error fetching doctors:', e);
  }
}


async function saveCurrentStep() {
  saving.value = true;
  try {
    switch (currentStep.value) {
      case 0: // Info & Admission
        await $fetch(`/api/registrations/${registrationId}`, { 
          method: 'PUT', 
          body: { 
            ward: registration.value.ward, 
            admissionDate: registration.value.admissionDate, 
            dischargeDate: registration.value.dischargeDate,
            managerOnDutyId: registration.value.managerOnDutyId
          } 
        });
        break;
      case 1: // Medical History
        await $fetch(`/api/registrations/${registrationId}/history`, { method: 'POST', body: medicalHistory.value });
        break;
      case 2: // Vital Signs
        await $fetch(`/api/registrations/${registrationId}/vitals`, { method: 'POST', body: vitalSigns.value });
        break;
      case 3: // Examination
        await $fetch(`/api/registrations/${registrationId}/examinations`, { method: 'POST', body: examination.value });
        break;
      case 4: // Recommendation
        await $fetch(`/api/registrations/${registrationId}/recommendations`, { method: 'POST', body: recommendation.value });
        break;
      case 5: // Treating Doctor
        await $fetch(`/api/registrations/${registrationId}/treating-doctors`, { 
          method: 'POST', 
          body: { 
              doctors: treatingDoctors.value.map((d, index) => ({ 
                  doctorId: d.id, 
                  sequence: index + 1,
                  isMain: index === 0
              })) 
          } 
        });
        break;
      // Step 6 (Comments) handled separately via "Add Comment"
    }
  } catch (e) {
    console.error(e);
    alert('Failed to save step data');
    throw e; // Propagate error to stop navigation
  } finally {
    saving.value = false;
  }
}

async function goToNextStep() {
  try {
    await saveCurrentStep();
    currentStep.value++;
  } catch (e) {
    // Error already handled in saveCurrentStep
  }
}

function goToPrevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

async function goToStep(index: number) {
  // If moving forward or staying, save current step first. 
  // If moving backward, generally safe to just move, but user might expect save.
  // The user requirement is "when next per step they save". 
  // For clicking stepper, it acts like a jump. It's safer to save the *current* step before leaving it.
  try {
    if (index !== currentStep.value) {
      await saveCurrentStep();
      currentStep.value = index;
    }
  } catch (e) {
    // Stay on current step if save fails
  }
}

async function handleSaveAll() {
  saving.value = true;
  const toast = useToast();
  try {
    await Promise.all([
      $fetch(`/api/registrations/${registrationId}`, { method: 'PUT', body: { ward: registration.value.ward, admissionDate: registration.value.admissionDate, dischargeDate: registration.value.dischargeDate, managerOnDutyId: registration.value.managerOnDutyId }, silent: true }),
      $fetch(`/api/registrations/${registrationId}/history`, { method: 'POST', body: medicalHistory.value, silent: true }),
      $fetch(`/api/registrations/${registrationId}/vitals`, { method: 'POST', body: vitalSigns.value, silent: true }),
      $fetch(`/api/registrations/${registrationId}/examinations`, { method: 'POST', body: examination.value, silent: true }),
      $fetch(`/api/registrations/${registrationId}/recommendations`, { method: 'POST', body: recommendation.value, silent: true }),
      // Enforce Doctor 1 (index 0) is always Main
      $fetch(`/api/registrations/${registrationId}/treating-doctors`, { method: 'POST', body: { doctors: treatingDoctors.value.map((d, index) => ({ doctorId: d.id, sequence: index + 1, isMain: index === 0 })) }, silent: true }),
    ]);
    
    // Refresh data to get satisfied relationships (like Manager Name) for PDF
    await fetchRegistration();
    
    toast.success('All data saved successfully!'); 
  } catch (e) {
    console.error(e);
    toast.error('Failed to save some data');
  } finally {
    saving.value = false;
  }
}

async function addComment() {
  if (!newComment.value.text.trim()) return;
  try {
    const response = await $fetch<{ data: any }>(`/api/registrations/${registrationId}/comments`, {
      method: 'POST',
      body: { commentText: newComment.value.text },
    });
    comments.value.unshift(response.data);
    newComment.value.text = '';
  } catch (e) {
    alert('Failed to add comment');
  }
}

function startEditComment(comment: any) {
  editingCommentId.value = comment.id;
  editingCommentText.value = comment.commentText;
}

function cancelEditComment() {
  editingCommentId.value = null;
  editingCommentText.value = '';
}

async function updateComment(id: string) {
  if (!editingCommentText.value.trim()) return;
  try {
    await $fetch(`/api/comments/${id}`, {
      method: 'PUT',
      body: { commentText: editingCommentText.value }
    });
    
    // Update local state
    const index = comments.value.findIndex(c => c.id === id);
    if (index !== -1) {
      comments.value[index].commentText = editingCommentText.value;
    }
    cancelEditComment();
  } catch (e) {
    alert('Failed to update comment');
  }
}

async function deleteComment(id: string) {
  if (!confirm('Are you sure you want to delete this comment?')) return;
  try {
    await $fetch(`/api/comments/${id}`, { method: 'DELETE' });
    comments.value = comments.value.filter(c => c.id !== id);
  } catch (e) {
    alert('Failed to delete comment');
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








const { isGeneratingPdf, pdfPreviewUrl, generatePdf, closePreview } = useRegistrationPdf();

async function handleDownloadPdf(preview: boolean) {
    await generatePdf(registrationId, preview);
    if (preview) {
        const modal = document.getElementById('pdf_preview_modal') as HTMLDialogElement;
        if (modal) modal.showModal();
    }
}
</script>
