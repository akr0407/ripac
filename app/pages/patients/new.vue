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
              <input v-model="form.mrNumber" type="text" class="input input-bordered" placeholder="Auto-generated if empty" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Phone</span></label>
              <input v-model="form.phone" type="text" class="input input-bordered" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Nationality</span></label>
              <select v-model="form.nationality" class="select select-bordered">
                <option value="" disabled>Select Nationality</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="Philippines">Philippines</option>
                <option value="Thailand">Thailand</option>
                <option value="Vietnam">Vietnam</option>
                <option value="China">China</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="Australia">Australia</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Other">Other</option>
              </select>
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
import { Save } from 'lucide-vue-next';
import dayjs from 'dayjs';

const loading = ref(false);

const form = ref({
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
