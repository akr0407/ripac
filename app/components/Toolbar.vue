<template>
  <div class="flex items-center gap-1 flex-wrap">
    <button
      v-if="showSave"
      class="btn btn-primary btn-sm"
      :disabled="saving"
      @click="$emit('save')"
      title="Save (Ctrl+S)"
    >
      <Save class="w-4 h-4" />
      <span class="hidden sm:inline">Save</span>
    </button>
    
    <button
      v-if="showNew"
      class="btn btn-success btn-sm"
      @click="$emit('new')"
      title="New (Alt+N)"
    >
      <Plus class="w-4 h-4" />
      <span class="hidden sm:inline">New</span>
    </button>
    
    <button
      v-if="showEdit"
      class="btn btn-info btn-sm"
      @click="$emit('edit')"
      title="Edit"
    >
      <Pencil class="w-4 h-4" />
      <span class="hidden sm:inline">Edit</span>
    </button>
    
    <button
      v-if="showDelete"
      class="btn btn-error btn-sm"
      @click="$emit('delete')"
      title="Delete"
    >
      <Trash2 class="w-4 h-4" />
      <span class="hidden sm:inline">Delete</span>
    </button>
    
    <button
      v-if="showPrint"
      class="btn btn-outline btn-sm"
      @click="$emit('print')"
      title="Print"
    >
      <Printer class="w-4 h-4" />
      <span class="hidden sm:inline">Print</span>
    </button>
    
    <button
      v-if="showSearch"
      class="btn btn-ghost btn-sm"
      @click="$emit('search')"
      title="Search (Ctrl+K)"
    >
      <Search class="w-4 h-4" />
    </button>
    
    <button
      v-if="showClose"
      class="btn btn-ghost btn-sm"
      @click="$emit('close')"
      title="Close (Escape)"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Save, Plus, Pencil, Trash2, Printer, Search, X } from 'lucide-vue-next';

interface Props {
  showSave?: boolean;
  showNew?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showPrint?: boolean;
  showSearch?: boolean;
  showClose?: boolean;
  saving?: boolean;
}

withDefaults(defineProps<Props>(), {
  showSave: true,
  showNew: false,
  showEdit: false,
  showDelete: false,
  showPrint: false,
  showSearch: false,
  showClose: false,
  saving: false,
});

defineEmits<{
  save: [];
  new: [];
  edit: [];
  delete: [];
  print: [];
  search: [];
  close: [];
}>();
</script>
