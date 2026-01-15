<template>
  <div class="form-control w-full" ref="containerRef">
    <label class="label" v-if="label">
      <span class="label-text">{{ label }}</span>
    </label>
    
    <div class="relative">
      <!-- Main Input (Trigger) -->
      <div class="flex gap-2">
        <div class="relative w-full">
           <input 
            type="text" 
            :value="displayValue" 
            class="input input-bordered w-full cursor-pointer" 
            :class="{ 'input-error': error }"
            placeholder="Select Nationality..."
            readonly
            @click="toggleDropdown"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <ChevronDown class="w-4 h-4" />
          </div>
        </div>

        <!-- Save to Master Button (Visible if custom value) -->
        <button 
          v-if="isCustomValue && !savedToMaster && modelValue" 
          type="button" 
          class="btn btn-square btn-outline btn-success" 
          title="Save to Master List"
          @click="saveToMaster"
          :disabled="saving"
        >
          <span v-if="saving" class="loading loading-spinner loading-xs"></span>
          <Plus v-else class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Dropdown Card -->
      <div v-show="isOpen" class="absolute top-full left-0 w-full z-50 mt-1">
        <div class="card bg-base-100 shadow-xl border border-base-200">
          <div class="card-body p-2">
            <!-- Search Input -->
            <div class="relative mb-2">
              <input 
                ref="searchInputRef"
                v-model="searchQuery" 
                type="text" 
                class="input input-bordered input-sm w-full pl-8" 
                placeholder="Search..."
              />
              <Search class="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>

            <!-- List -->
            <ul class="menu menu-sm bg-base-100 w-full p-0 max-h-60 overflow-y-auto flex-nowrap block">
               <li v-for="c in filteredCountries" :key="c.id || c.nationality">
                <a @click="selectCountry(c.nationality)" :class="{ 'active': c.nationality === modelValue }">
                  <span class="font-bold">{{ c.name }}</span>
                  <span class="text-xs opacity-70 ml-1" v-if="c.nationality && c.nationality !== c.name">({{ c.nationality }})</span>
                </a>
              </li>
              
              <!-- Empty State / Manual Entry -->
              <li v-if="filteredCountries.length === 0 && searchQuery">
                 <a @click="selectManual(searchQuery)" class="font-bold text-primary flex flex-col items-start">
                   <span>Use "{{ searchQuery }}"</span>
                   <span class="text-xs opacity-70 font-normal">as Country Name & Nationality</span>
                 </a>
              </li>
               <li v-if="filteredCountries.length === 0 && !searchQuery" class="disabled">
                <a>Type to search...</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <span v-if="error" class="text-error text-xs mt-1">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Search, ChevronDown, Plus } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Nationality',
  },
  error: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

const containerRef = ref(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const countries = ref<any[]>([]);
const loading = ref(false);
const isOpen = ref(false);
const searchQuery = ref('');
const saving = ref(false);
const savedToMaster = ref(false);

const isCustomValue = computed(() => {
    if (!props.modelValue) return false;
    return !countries.value.some(c => c.nationality === props.modelValue);
});

// Helper to get display name from nationality value
const displayValue = computed(() => {
    if (!props.modelValue) return '';
    const c = countries.value.find(c => c.nationality === props.modelValue);
    return c ? c.name : props.modelValue;
});

const sortedCountries = computed(() => {
  // Sort by Name
  return [...countries.value].sort((a, b) => a.name.localeCompare(b.name)); 
});

const filteredCountries = computed(() => {
    if (!searchQuery.value) return sortedCountries.value;
    const q = searchQuery.value.toLowerCase();
    return sortedCountries.value.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.nationality.toLowerCase().includes(q)
    );
});

onClickOutside(containerRef, () => {
    isOpen.value = false;
});

function toggleDropdown() {
    if (loading.value) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        // Focus search input
        nextTick(() => {
            searchInputRef.value?.focus();
        });
    }
}

function selectCountry(val: string) {
    emit('update:modelValue', val);
    isOpen.value = false;
    searchQuery.value = '';
    savedToMaster.value = false;
}

function selectManual(val: string) {
    emit('update:modelValue', val);
    isOpen.value = false;
    searchQuery.value = '';
    savedToMaster.value = false;
}

async function saveToMaster() {
  if (!props.modelValue) return;
  saving.value = true;
  try {
    await $fetch('/api/countries', {
      method: 'POST',
      body: {
        nationality: props.modelValue,
        name: props.modelValue, 
      }
    });
    savedToMaster.value = true;
    await fetchCountries();
  } catch (e) {
    console.error(e);
    alert('Failed to save to master list');
  } finally {
    saving.value = false;
  }
}

async function fetchCountries() {
  loading.value = true;
  try {
    const { data } = await $fetch<{ data: any[] }>('/api/countries');
    countries.value = data || [];
  } catch (e) {
    console.error('Failed to fetch countries', e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchCountries();
});
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
