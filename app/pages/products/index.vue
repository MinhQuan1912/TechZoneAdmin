<template>
   <div class="space-y-4">
      <div class="flex items-center justify-between">
         <UButton to="/products/create" icon="i-heroicons-plus" class="hover:cursor-pointer" color="primary">
            Thêm sản phẩm
         </UButton>
      </div>

      <UCard>
         <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <UInput
               v-model="store.filter.search"
               placeholder="Tìm kiếm sản phẩm..."
               icon="i-heroicons-magnifying-glass"
               @keyup.enter="doSearch"
            />
            <USelect v-model="store.filter.categoryId" :items="categoryOptions" placeholder="Tất cả danh mục" />
            <USelect v-model="store.filter.isActive" :items="statusOptions" placeholder="Tất cả trạng thái" />
            <div class="flex gap-2">
               <UButton color="primary" class="flex-1" icon="i-heroicons-funnel" @click="doSearch">
                  Lọc
               </UButton>
               <UButton color="neutral" variant="outline" @click="store.resetFilter">
                  Reset
               </UButton>
            </div>
         </div>
      </UCard>

      <UCard>
         <UTable :data="store.items" :columns="columns" :loading="store.loading">
            <template #image-cell="{ row }">
               <img
                  v-if="row.original.images?.[0]?.url"
                  :src="row.original.images[0].url"
                  class="w-12 h-12 rounded-lg object-cover"
                  :alt="row.original.name"
               />
               <div v-else class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="text-gray-400 w-5 h-5" />
               </div>
            </template>
            <template #name-cell="{ row }">
               <div>
                  <p class="font-medium text-gray-900">{{ row.original.name }}</p>
                  <p class="text-xs text-gray-500">{{ row.original.brand }}</p>
               </div>
            </template>
            <template #category-cell="{ row }">
               <UBadge color="neutral" variant="soft">{{ row.original.category?.name }}</UBadge>
            </template>
            <template #price-cell="{ row }">
               <div class="text-sm">
                  <p class="font-medium text-green-600">
                     {{ formatCurrency(row.original.minSalePrice || 0) }}
                  </p>
                  <p v-if="row.original.minSalePrice !== row.original.maxSalePrice" class="text-xs text-gray-400">
                     ~ {{ formatCurrency(row.original.maxSalePrice || 0) }}
                  </p>
               </div>
            </template>
            <template #stock-cell="{ row }">
               <span class="text-sm">
                  {{ row.original.variants?.reduce((sum: number, variant: any) => sum + variant.stock, 0) || 0 }}
               </span>
            </template>
            <template #isActive-cell="{ row }">
               <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ row.original.isActive ? 'Hiển thị' : 'Ẩn' }}
               </UBadge>
            </template>
            <template #actions-cell="{ row }">
               <div class="flex gap-2">
                  <UButton
                     size="xs"
                     color="neutral"
                     variant="outline"
                     icon="i-heroicons-pencil"
                     :to="`/products/${row.original.id}/edit`"
                  />
                  <UButton
                     size="xs"
                     color="error"
                     variant="outline"
                     icon="i-heroicons-trash"
                     @click="openDelete(row.original)"
                  />
               </div>
            </template>
            <template #empty>
               <div class="text-center py-12 text-gray-400">
                  <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto mb-3" />
                  <p>Không có sản phẩm nào</p>
               </div>
            </template>
         </UTable>

         <CommonAppPagination
            v-model:page="store.page"
            :total="store.total"
            :total-pages="store.totalPages"
            :items-per-page="store.limit"
            @change="store.changePage"
         />
      </UCard>

      <CommonAppConfirmModal
         v-model:open="deleteOpen"
         title="Xóa sản phẩm"
         :message="`Xác nhận xóa sản phẩm '${selectedProduct?.name}'?`"
         :loading="deleting"
         @confirm="doDelete"
      />
   </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '~/stores/categories'
import { useProductStore } from '~/stores/products'
import type { Product } from '~/types'

const ALL_FILTERS = '__all__'
const store = useProductStore()
const catStore = useCategoryStore()
const toast = useToast()

const deleteOpen = ref(false)
const selectedProduct = ref<Product | null>(null)
const deleting = ref(false)

const columns = [
   { id: 'image', header: 'Ảnh' },
   { id: 'name', header: 'Tên sản phẩm' },
   { id: 'category', header: 'Danh mục' },
   { id: 'price', header: 'Giá bán' },
   { id: 'stock', header: 'Tồn kho' },
   { accessorKey: 'isActive', header: 'Trạng thái' },
   { id: 'actions', header: '' }
]

const statusOptions = [
   { label: 'Tất cả', value: ALL_FILTERS },
   { label: 'Đang hiển thị', value: 'true' },
   { label: 'Đã ẩn', value: 'false' }
]

const categoryOptions = computed(() => [
   { label: 'Tất cả danh mục', value: ALL_FILTERS },
   ...catStore.items.map(category => ({ label: category.name, value: String(category.id) }))
])

function doSearch() {
   store.page = 1
   store.fetchAll()
}

function openDelete(product: Product) {
   selectedProduct.value = product
   deleteOpen.value = true
}

async function doDelete() {
   if (!selectedProduct.value) return
   deleting.value = true
   try {
      await store.remove(selectedProduct.value.id)
      toast.add({ title: 'Thành công', description: 'Đã xóa sản phẩm', color: 'success' })
      deleteOpen.value = false
      store.fetchAll()
   } finally {
      deleting.value = false
   }
}

onMounted(async () => {
   await catStore.fetchAll()
   await store.fetchAll()
})
</script>
