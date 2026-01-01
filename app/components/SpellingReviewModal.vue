<template>
  <dialog :id="modalId" class="modal">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Review Spelling</h3>
      
      <div v-if="segments.length" class="space-y-6">
        <!-- Preview Area -->
        <div class="p-4 bg-base-200 rounded-lg font-mono text-sm leading-relaxed whitespace-pre-wrap">
          <template v-for="(segment, index) in localSegments" :key="index">
            <span 
              v-if="!segment.isTypo" 
              class="opacity-70">{{ segment.text }}</span>
            <span 
              v-else 
              class="bg-red-100 text-red-800 px-1 rounded cursor-pointer border-b-2 border-red-400 font-bold"
              :class="{ 'bg-yellow-200 border-yellow-500': activeTypoIndex === index, 'bg-green-100 text-green-800 border-green-400': segment.replacement }"
              @click="activeTypoIndex = index"
            >
              {{ segment.replacement || segment.text }}
            </span>
          </template>
        </div>

        <!-- Correction Interaction -->
        <div v-if="activeTypoIndex !== -1" class="card bg-base-100 border shadow-sm">
            <div class="card-body p-4">
                <h4 class="font-bold text-sm text-base-content/70">
                    Fixing: <span class="text-red-600 line-through">{{ localSegments[activeTypoIndex].text }}</span>
                </h4>
                <div class="flex flex-wrap gap-2 mt-2">
                    <!-- Suggestions -->
                    <button 
                        v-for="sugg in localSegments[activeTypoIndex].suggestions" 
                        :key="sugg"
                        class="btn btn-sm"
                        :class="localSegments[activeTypoIndex].replacement === sugg ? 'btn-primary' : 'btn-outline'"
                        @click="setReplacement(activeTypoIndex, sugg)"
                    >
                        {{ sugg }}
                    </button>
                    <!-- Ignore -->
                    <button 
                        class="btn btn-sm btn-ghost"
                        :class="{ 'bg-base-300': !localSegments[activeTypoIndex].replacement }"
                        @click="setReplacement(activeTypoIndex, undefined)"
                    >
                        Ignore (Keep Original)
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="alert alert-info text-sm">
            <Info class="w-4 h-4" />
            Click on a highlighted word above to choose a correction.
        </div>
      </div>

      <div class="modal-action">
        <form method="dialog">
            <button class="btn btn-ghost mr-2">Cancel</button>
            <button class="btn btn-primary" @click="onSave">Apply Changes</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
        <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Info } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: boolean; // Controls visibility indirectly via external open call usually, but we use daisyui ID
  segments: { text: string, isTypo: boolean, suggestions?: string[] }[];
}>();

const emit = defineEmits(['save', 'close']);

const modalId = 'spelling_review_modal';
const localSegments = ref<any[]>([]);
const activeTypoIndex = ref(-1);

watch(() => props.segments, (newSegments) => {
    // Deep copy to local state to track replacements
    localSegments.value = newSegments.map(s => ({ ...s, replacement: undefined }));
    // Auto-select first typo
    activeTypoIndex.value = localSegments.value.findIndex(s => s.isTypo);
}, { immediate: true });

function setReplacement(index: number, value: string | undefined) {
    localSegments.value[index].replacement = value;
    // Auto-advance to next typo that hasn't been handled (?) - purely optional, let's keep it manual for control
}

function onSave() {
    const finalString = localSegments.value.map(s => s.replacement || s.text).join('');
    emit('save', finalString);
}

function show() {
    (document.getElementById(modalId) as any)?.showModal();
}

defineExpose({ show });
</script>
