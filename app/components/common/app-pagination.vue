<template>
  <div
    v-if="totalPages > 1"
    class="flex items-center justify-between mt-4"
  >
    <p class="text-sm text-gray-500">
      Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, total) }}
      / {{ total }} kết quả
    </p>
    <UPagination
      v-model:page="currentPage"
      :total="total"
      :items-per-page="itemsPerPage"
      @update:page="$emit('change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number
  totalPages: number
  itemsPerPage: number
}>()

defineEmits<{ change: [page: number] }>()

const currentPage = defineModel<number>('page', { default: 1 })
</script>
