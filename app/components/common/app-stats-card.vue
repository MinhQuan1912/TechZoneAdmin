<template>
  <UCard>
    <div class="flex items-center gap-4">
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="bgColor"
      >
        <UIcon
          :name="icon"
          class="w-6 h-6"
          :class="iconColor"
        />
      </div>
      <div class="flex-1">
        <p class="text-sm text-gray-500">
          {{ label }}
        </p>
        <p class="text-2xl font-bold text-gray-900">
          {{ value }}
        </p>
        <p
          v-if="sub"
          class="text-xs text-gray-400 mt-0.5"
        >
          {{ sub }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string | number
  sub?: string
  bgColor?: string
  iconColor?: string
}>()
</script>
