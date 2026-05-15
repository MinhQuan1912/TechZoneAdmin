<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-red-600 w-5 h-5"
              />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ title }}
              </h3>
            </div>
          </div>
        </template>

        <p class="text-sm text-gray-600">
          {{ message }}
        </p>

        <slot />

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="cancel"
            >
              {{ cancelText }}
            </UButton>
            <UButton
              :color="confirmColor"
              :loading="loading"
              @click="confirm"
            >
              {{ confirmText }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
  loading?: boolean
}>(), {
  title: 'Xác nhận',
  message: 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  confirmColor: 'error',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

function confirm() {
  emit('confirm')
}

function cancel() {
  isOpen.value = false
  emit('cancel')
}
</script>
