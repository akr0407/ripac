<template>
    <Teleport to="body">
        <dialog class="modal" :class="{ 'modal-open': state.isOpen }">
            <div class="modal-box">
                <h3 class="font-bold text-lg flex items-center gap-2">
                    <TriangleAlert v-if="state.options.type === 'danger'" class="w-6 h-6 text-error" />
                    <TriangleAlert v-else-if="state.options.type === 'warning'" class="w-6 h-6 text-warning" />
                    <Info v-else class="w-6 h-6 text-info" />
                    {{ state.options.title || 'Confirm' }}
                </h3>
                <p class="py-4">{{ state.options.message }}</p>
                <div class="modal-action">
                    <button class="btn" @click="handleCancel">
                        {{ state.options.cancelText || 'Cancel' }}
                    </button>
                    <button 
                        class="btn"
                        :class="{
                            'btn-error': state.options.type === 'danger',
                            'btn-warning': state.options.type === 'warning',
                            'btn-primary': !state.options.type || state.options.type === 'info'
                        }"
                        @click="handleConfirm"
                    >
                        {{ state.options.confirmText || 'Confirm' }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop bg-base-300/50 backdrop-blur-sm">
                <button @click="handleCancel">close</button>
            </form>
        </dialog>
    </Teleport>
</template>

<script setup lang="ts">
import { TriangleAlert, Info } from 'lucide-vue-next';

const { state, handleConfirm, handleCancel } = useConfirm();
</script>
