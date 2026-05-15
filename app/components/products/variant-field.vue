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
               <UInput v-model="(variant.originalPrice) as any" type="number"  :min="0" />
            </UFormField>
            <UFormField label="Giá bán (đ) *">
               <UInput v-model="(variant.salePrice) as any" type="number"  :min="0" />
            </UFormField>
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

function add() {
   variants.value.push({
      color: '', storage: '', ram: '', cpu: '', version: '',
      originalPrice: '', salePrice: '', stock: '',
   })
}

function remove(index: number) {
   variants.value.splice(index, 1)
}
</script>