<template>
    <dialog :id="id" class="modal">
      <div class="modal-box w-11/12 max-w-5xl h-[90vh] p-0 overflow-hidden relative bg-slate-100 flex flex-col">
         <div class="flex justify-between items-center p-4 bg-white shadow-sm z-10">
            <h3 class="font-bold text-lg">PDF Preview</h3>
             <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost" @click="$emit('close')">✕</button>
            </form>
        </div>
        <div class="flex-1 w-full h-full relative">
            <iframe v-if="url" :src="url" class="w-full h-full border-0"></iframe>
            <div v-else class="flex justify-center items-center h-full">
                <span class="loading loading-spinner loading-lg"></span>
            </div>
        </div>
      </div>
       <form method="dialog" class="modal-backdrop">
        <button @click="$emit('close')">close</button>
      </form>
    </dialog>
</template>

<script setup lang="ts">
defineProps<{
    id: string;
    url: string | null;
}>();

defineEmits(['close']);
</script>
