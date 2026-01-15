<template>
  <div class="form-control w-full" ref="containerRef">
    <label class="label" v-if="label">
      <span class="label-text">{{ label }}</span>
    </label>
    
    <div class="relative">
      <!-- Main Input (Trigger) -->
      <div class="relative w-full">
         <input 
          type="text" 
          :value="displayValue" 
          class="input input-bordered w-full cursor-pointer" 
          :class="{ 'input-error': error }"
          :placeholder="placeholder || 'Select Doctor...'"
          readonly
          @click="toggleDropdown"
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
           <ChevronDown class="w-4 h-4" />
        </div>
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
                placeholder="Search doctor..."
              />
              <Search class="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>

            <!-- List -->
            <ul class="menu menu-sm bg-base-100 w-full p-0 max-h-60 overflow-y-auto flex-nowrap block">
               <li v-for="opt in filteredOptions" :key="opt.value">
                <a @click="selectOption(opt)" :class="{ 'active': opt.value === modelValue }">
                  {{ opt.label }}
                </a>
              </li>
              
               <li v-if="filteredOptions.length === 0" class="disabled">
                <a>No doctors found</a>
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
import { ref, computed, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { Search, ChevronDown } from 'lucide-vue-next';

interface Option {
    label: string;
    value: string | number | null;
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Object], // Object for null
    default: null,
  },
  options: {
    type: Array as PropType<Option[]>,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
      type: String,
      default: '',
  },
  error: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

const containerRef = ref(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const searchQuery = ref('');

const displayValue = computed(() => {
    if (!props.modelValue) return '';
    const found = props.options.find(o => o.value === props.modelValue);
    return found ? found.label : '';
});

const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;
    const q = searchQuery.value.toLowerCase();
    return props.options.filter(o => o.label.toLowerCase().includes(q));
});

onClickOutside(containerRef, () => {
    isOpen.value = false;
});

function toggleDropdown() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        // Focus search input
        nextTick(() => {
            searchInputRef.value?.focus();
        });
    }
}

function selectOption(opt: Option) {
    emit('update:modelValue', opt.value);
    isOpen.value = false;
    searchQuery.value = '';
}
</script>
