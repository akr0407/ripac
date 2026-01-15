<template>
    <Teleport to="body">
        <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            <TransitionGroup name="toast-fade">
                <div 
                    v-for="toast in toasts" 
                    :key="toast.id" 
                    class="alert shadow-lg min-w-[300px] max-w-[400px]"
                    :class="{
                        'alert-success': toast.type === 'success',
                        'alert-error': toast.type === 'error',
                        'alert-warning': toast.type === 'warning',
                        'alert-info': toast.type === 'info',
                    }"
                >
                    <component :is="getIcon(toast.type)" class="w-6 h-6 stroke-current shrink-0" />
                    <div>
                        <h3 class="font-bold capitalize">{{ toast.type }}</h3>
                        <div class="text-xs">{{ toast.message }}</div>
                    </div>
                    <button class="btn btn-ghost btn-xs btn-circle" @click="remove(toast.id)">
                        <X class="w-4 h-4" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-vue-next';

const { toasts, remove } = useToast();

const getIcon = (type: string) => {
    switch (type) {
        case 'success': return CircleCheck;
        case 'error': return CircleX;
        case 'warning': return TriangleAlert;
        default: return Info;
    }
};
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
