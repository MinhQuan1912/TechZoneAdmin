<template>
  <div class="space-y-4">
    <div v-for="(variant, index) in variants" :key="index" class="border border-gray-200 rounded-lg p-4 relative">
      <div class="flex justify-between items-center mb-3">
        <span class="font-medium text-sm text-gray-700">Biến thể #{{ index + 1 }}</span>
        <UButton v-if="variants.length > 1" color="error" variant="ghost" size="xs" icon="i-heroicons-trash"
          @click="remove(index)" />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <UFormField label="Màu sắc">
          <UInput v-model="variant.color" placeholder="Đen, Trắng..." />
        </UFormField>
        <UFormField label="Dung lượng">
          <UInput v-model="variant.storage" placeholder="128GB, 256GB..." />
        </UFormField>
        <UFormField label="RAM">
          <UInput v-model="variant.ram" placeholder="8GB, 16GB..." />
        </UFormField>
        <UFormField label="CPU">
          <UInput v-model="variant.cpu" placeholder="M3, Snapdragon..." />
        </UFormField>
        <UFormField label="Phiên bản">
          <UInput v-model="variant.version" />
        </UFormField>
        <UFormField label="Tồn kho *">
          <UInput v-model="(variant.stock) as any" type="number" :min="0" />
        </UFormField>
        <UFormField label="Giá gốc (đ) *">
          <UInput v-model="(variant.originalPrice) as any" type="number" :min="0" />
        </UFormField>
        <UFormField label="Giá bán (đ) *">
          <UInput v-model="(variant.salePrice) as any" type="number" :min="0" />
        </UFormField>
      </div>
      <div class="mt-3 pt-3 border-t border-gray-100">
        <p class="text-sm font-medium text-gray-700 mb-2">
          Ảnh màu
          <span class="text-xs text-gray-400 ml-1">(tuỳ chọn)</span>
        </p>
        <div class="flex items-center gap-4">
          <div v-if="variant.previewImageUrl"
            class="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-primary-200">
            <img :src="variant.previewImageUrl" class="w-full h-full object-cover" />
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <UButton size="xs" color="error" variant="solid" icon="i-heroicons-trash" @click="removeImage(index)">Xóa
              </UButton>
            </div>
          </div>
          <div v-else
            class="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            @click="fileInputs[index]?.click()">
            <UIcon name="i-heroicons-camera" class="w-6 h-6 text-gray-300 mb-1" />
            <span class="text-xs text-gray-400">Chọn ảnh</span>
          </div>
          <p class="text-xs text-gray-400">
            {{ variant.previewImageUrl ? 'Ảnh sẽ upload khi lưu sản phẩm' : 'Ảnh đại diện cho màu này' }}
          </p>
        </div>
        <input :ref="el => { if (el) fileInputs[index] = el as HTMLInputElement }" type="file" accept="image/*"
          class="hidden" @change="e => onFileChange(e, index)" />
      </div>
    </div>

    <UButton color="neutral" variant="outline" icon="i-heroicons-plus" class="w-full" @click="add">
      Thêm biến thể
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { VariantForm } from '~/types'
const variants = defineModel<VariantForm[]>({ required: true })
const fileInputs = ref<Record<number, HTMLInputElement>>({})

function add() {
  variants.value.push({
    color: '', storage: '', ram: '', cpu: '', version: '',
    originalPrice: '', salePrice: '', stock: '',
    imageFile: null,
    previewImageUrl: undefined,
  })
}

function remove(index: number) {
  if (variants.value[index].previewImageUrl) {
    URL.revokeObjectURL(variants.value[index].previewImageUrl!)
  }
  variants.value.splice(index, 1)
}

function onFileChange(e: Event, index: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (variants.value[index].previewImageUrl) {
    URL.revokeObjectURL(variants.value[index].previewImageUrl!)
  }
  variants.value[index].imageFile = file
  variants.value[index].previewImageUrl = URL.createObjectURL(file)
}

function removeImage(index: number) {
  if (variants.value[index].previewImageUrl) {
    URL.revokeObjectURL(variants.value[index].previewImageUrl!)
  }
  variants.value[index].imageFile = null
  variants.value[index].previewImageUrl = undefined
  if (fileInputs.value[index]) fileInputs.value[index].value = ''
}
</script>
