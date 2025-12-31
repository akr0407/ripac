<template>
  <dialog class="modal" :class="{ 'modal-open': modelValue }">
    <div class="modal-box p-0 max-w-2xl bg-base-100 overflow-hidden">
      <!-- Search Input -->
      <div class="border-b border-base-300 p-4 flex items-center gap-2">
        <Search class="w-5 h-5 opacity-50" />
        <input 
          ref="searchInput"
          v-model="query" 
          type="text" 
          class="input input-ghost w-full focus:outline-none" 
          placeholder="Search patients by name or MR number..."
          @input="handleSearch"
          @keydown.down.prevent="navigate(1)"
          @keydown.up.prevent="navigate(-1)"
          @keydown.enter="select"
          @keydown.esc="$emit('update:modelValue', false)"
        />
        <span class="kbd kbd-sm">ESC</span>
      </div>

      <!-- Results -->
      <div class="max-h-96 overflow-y-auto p-2" v-if="results.length > 0">
        <div class="menu w-full bg-base-100 rounded-box gap-1">
          <button 
            v-for="(item, index) in results" 
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors text-left"
            :class="{ 'bg-base-200': selectedIndex === index }"
            @click="navigateToPatient(item.id)"
            @mouseenter="selectedIndex = index"
          >
            <div class="avatar placeholder">
              <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
                <span>{{ item.fullName.charAt(0) }}</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="font-bold">{{ item.fullName }}</div>
              <div class="text-xs opacity-50 flex gap-2">
                <span>{{ item.mrNumber || 'No MR' }}</span>
                <span>•</span>
                <span>{{ item.sex }}</span>
                <span>•</span>
                <span>{{ item.age }} {{ item.ageUnit }}</span>
              </div>
            </div>
            <div class="badge badge-sm badge-ghost">Patient</div>
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div class="p-8 text-center opacity-50" v-else-if="query">
        No results found for "{{ query }}"
      </div>
      
      <!-- Initial State -->
      <div class="p-4 text-xs opacity-50" v-else>
        Type to search...
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('update:modelValue', false)">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const query = ref('');
const results = ref<any[]>([]);
const selectedIndex = ref(0);
const searchInput = ref<HTMLInputElement | null>(null);

// Focus input when opened
watch(() => props.modelValue, (val) => {
  if (val) {
    nextTick(() => {
      searchInput.value?.focus();
      query.value = '';
      results.value = [];
    });
  }
});

const handleSearch = useDebounceFn(async () => {
  if (!query.value || query.value.length < 2) {
    results.value = [];
    return;
  }
  
  try {
    const { data } = await $fetch<{ data: any[] }>('/api/patients', {
      query: { search: query.value }
    });
    // Filter client side as API currently returns all
    results.value = data.filter(p => 
      p.fullName.toLowerCase().includes(query.value.toLowerCase()) || 
      (p.mrNumber && p.mrNumber.includes(query.value))
    ).slice(0, 5);
    selectedIndex.value = 0;
  } catch (e) {
    console.error(e);
  }
}, 300);

function navigate(direction: number) {
  const newIndex = selectedIndex.value + direction;
  if (newIndex >= 0 && newIndex < results.value.length) {
    selectedIndex.value = newIndex;
  }
}

function select() {
  if (results.value[selectedIndex.value]) {
    navigateToPatient(results.value[selectedIndex.value].id);
  }
}

function navigateToPatient(id: string) {
  emit('update:modelValue', false);
  navigateTo(`/patients/${id}`);
}
</script>
