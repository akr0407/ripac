<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold">Doctors</h1>
        <p class="text-base-content/60">Manage hospital doctors</p>
      </div>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search doctors..."
          class="input input-bordered w-64"
        />
        <button class="btn btn-primary" @click="openModal()">
          <Plus class="w-5 h-5" />
          Add Doctor
        </button>
      </div>
    </div>

    <!-- Doctors Table -->
    <div class="card bg-base-100 shadow">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Nick Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doctor in filteredDoctors" :key="doctor.id" class="hover">
                <td class="font-mono">{{ doctor.doctorId }}</td>
                <td>{{ doctor.fullName }}</td>
                <td>{{ doctor.nickName || '-' }}</td>
                <td>{{ doctor.phone1 || '-' }}</td>
                <td>
                  <span :class="doctor.isActive ? 'badge badge-success' : 'badge badge-error'">
                    {{ doctor.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="flex gap-1">
                  <button class="btn btn-ghost btn-xs" @click="openModal(doctor)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" @click="handleDelete(doctor)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredDoctors.length === 0">
                <td colspan="6" class="text-center py-8 text-base-content/60">
                  {{ loading ? 'Loading...' : 'No doctors found' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <dialog ref="modalRef" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ editingDoctor ? 'Edit Doctor' : 'Add New Doctor' }}</h3>
        <form @submit.prevent="handleSubmit" class="py-4 space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text">Doctor ID *</span></label>
            <input v-model="form.doctorId" type="text" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Full Name *</span></label>
            <input v-model="form.fullName" type="text" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Nick Name</span></label>
            <input v-model="form.nickName" type="text" class="input input-bordered" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text">Phone 1</span></label>
              <input v-model="form.phone1" type="text" class="input input-bordered" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text">Phone 2</span></label>
              <input v-model="form.phone2" type="text" class="input input-bordered" />
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Address</span></label>
            <textarea v-model="form.address" class="textarea textarea-bordered" rows="2"></textarea>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-2">
              <input v-model="form.isActive" type="checkbox" class="toggle toggle-primary" />
              <span class="label-text">Active</span>
            </label>
          </div>
          <div class="modal-action">
            <button type="button" class="btn" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingDoctor ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const { doctors, loading, fetchDoctors, createDoctor, updateDoctor, deleteDoctor } = useDoctor();

const searchQuery = ref('');
const modalRef = ref<HTMLDialogElement | null>(null);
const editingDoctor = ref<any>(null);
const saving = ref(false);

const form = ref({
  doctorId: '',
  fullName: '',
  nickName: '',
  phone1: '',
  phone2: '',
  address: '',
  isActive: true,
});

const filteredDoctors = computed(() => {
  if (!searchQuery.value) return doctors.value;
  const query = searchQuery.value.toLowerCase();
  return doctors.value.filter(
    (d) =>
      d.fullName.toLowerCase().includes(query) ||
      d.doctorId.toLowerCase().includes(query) ||
      d.nickName?.toLowerCase().includes(query)
  );
});

function openModal(doctor?: any) {
  if (doctor) {
    editingDoctor.value = doctor;
    form.value = {
      doctorId: doctor.doctorId,
      fullName: doctor.fullName,
      nickName: doctor.nickName || '',
      phone1: doctor.phone1 || '',
      phone2: doctor.phone2 || '',
      address: doctor.address || '',
      isActive: doctor.isActive,
    };
  } else {
    editingDoctor.value = null;
    form.value = {
      doctorId: '',
      fullName: '',
      nickName: '',
      phone1: '',
      phone2: '',
      address: '',
      isActive: true,
    };
  }
  modalRef.value?.showModal();
}

function closeModal() {
  modalRef.value?.close();
}

async function handleSubmit() {
  saving.value = true;
  try {
    if (editingDoctor.value) {
      await updateDoctor(editingDoctor.value.id, form.value);
    } else {
      await createDoctor(form.value);
    }
    closeModal();
  } catch (e: any) {
    alert(e.message || 'Operation failed');
  } finally {
    saving.value = false;
  }
}

async function handleDelete(doctor: any) {
  if (confirm(`Delete ${doctor.fullName}?`)) {
    try {
      await deleteDoctor(doctor.id);
    } catch (e: any) {
      alert(e.message || 'Failed to delete');
    }
  }
}

onMounted(() => {
  fetchDoctors();
});
</script>
