<template>
   <div class="space-y-4">
      <UCard class="overflow-visible">
         <div class="relative" ref="searchContainer">
            <UFormField label="Tìm sản phẩm để xem đánh giá">
               <div class="relative">
                  <UInput v-model="searchText" placeholder="Nhập tên sản phẩm..." icon="i-heroicons-magnifying-glass"
                     class="w-full" autocomplete="off" @input="onInput" @focus="onFocus">
                     <template v-if="selectedProduct" #trailing>
                        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="xs"
                           @click="clearSelection" />
                     </template>
                  </UInput>

                  <Transition enter-active-class="transition duration-150 ease-out"
                     enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
                     leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 translate-y-0"
                     leave-to-class="opacity-0 -translate-y-1">
                     <div v-if="dropdownOpen && searchText.length >= 1"
                        class="absolute z-100 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl">
                        <div v-if="searching" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
                           <div
                              class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                           Đang tìm kiếm...
                        </div>
                        <div v-else-if="suggestions.length === 0" class="px-4 py-6 flex justify-center items-center gap-2 text-center text-sm text-gray-400">
                           <UIcon name="i-heroicons-magnifying-glass" class="w-8 h-8 text-gray-300" />
                           Không tìm thấy sản phẩm nào
                        </div>
                        <ul v-else class="max-h-72 overflow-y-auto py-1">
                           <li v-for="(product, idx) in suggestions" :key="product.id"
                              class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors" :class="highlightedIndex === idx
                                 ? 'bg-primary-50'
                                 : 'hover:bg-gray-50'" @click="selectProduct(product)" @mouseenter="highlightedIndex = idx">
                              <img v-if="product.images?.[0]?.url" :src="product.images[0].url"
                                 class="w-10 h-10 rounded-lg object-cover shrink-0" :alt="product.name" />
                              <div v-else
                                 class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                 <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-400" />
                              </div>
                              <div class="flex-1 min-w-0">
                                 <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                                 <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-xs text-gray-500">{{ product.brand }}</span>
                                    <span class="text-gray-300">·</span>
                                    <span class="text-xs text-gray-500">{{ product.category?.name }}</span>
                                 </div>
                              </div>
                              <div class="shrink-0 text-right">
                                 <div v-if="product.reviewCount > 0" class="flex items-center gap-1">
                                    <UIcon name="i-heroicons-star-solid" class="w-3.5 h-3.5 text-yellow-400" />
                                    <span class="text-xs font-medium text-gray-700">
                                       {{ product.avgRating?.toFixed(1) }}
                                    </span>
                                    <span class="text-xs text-gray-400">({{ product.reviewCount }})</span>
                                 </div>
                                 <span v-else class="text-xs text-gray-400">Chưa có đánh giá</span>
                              </div>
                           </li>
                        </ul>
                     </div>
                  </Transition>
               </div>
            </UFormField>
            <div v-if="selectedProduct"
               class="mt-3 flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
               <img v-if="selectedProduct.images?.[0]?.url" :src="selectedProduct.images[0].url"
                  class="w-12 h-12 rounded-lg object-cover shrink-0" />
               <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-gray-900 truncate">{{ selectedProduct.name }}</p>
                  <p class="text-xs text-gray-500">{{ selectedProduct.brand }} · {{ selectedProduct.category?.name }}
                  </p>
               </div>
               <UBadge color="primary" variant="soft">
                  {{ store.total }} đánh giá
               </UBadge>
            </div>
         </div>
      </UCard>
      <UCard v-if="selectedProduct">
         <template #header>
            <div class="flex items-center justify-between">
               <h3 class="font-semibold">
                  Đánh giá của
                  <span class="text-primary-600">{{ selectedProduct.name }}</span>
               </h3>
               <UBadge color="neutral" variant="soft">{{ store.total }} đánh giá</UBadge>
            </div>
         </template>
         <div v-if="store.loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse flex gap-3 p-3">
               <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
               <div class="flex-1 space-y-2">
                  <div class="h-3 bg-gray-200 rounded w-1/4" />
                  <div class="h-3 bg-gray-200 rounded w-3/4" />
                  <div class="h-3 bg-gray-200 rounded w-1/2" />
               </div>
            </div>
         </div>
         <div v-else-if="store.items.length === 0" class="text-center py-12 text-gray-400">
            <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p class="font-medium">Chưa có đánh giá nào</p>
            <p class="text-xs mt-1">Chỉ người đã mua và nhận hàng mới có thể đánh giá</p>
         </div>
         <div v-else class="space-y-3">
            <div v-for="review in store.items" :key="review.id"
               class="group border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
               <div class="flex items-start gap-3">
                  <div
                     class="w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-blue-500 flex items-center justify-center shrink-0">
                     <span class="text-white font-semibold text-sm">
                        {{ review.user?.name?.[0]?.toUpperCase() }}
                     </span>
                  </div>
                  <div class="flex-1 min-w-0">
                     <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-medium text-sm text-gray-900">{{ review.user?.name }}</span>
                        <div class="flex">
                           <UIcon v-for="s in 5" :key="s" name="i-heroicons-star-solid" class="w-3.5 h-3.5"
                              :class="s <= review.rating ? 'text-yellow-400' : 'text-gray-200'" />
                        </div>
                        <span class="text-xs text-gray-400">{{ formatDate(review.createdAt) }}</span>
                     </div>
                     <p class="text-sm text-gray-700 mt-1.5 leading-relaxed">{{ review.content }}</p>
                     <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span class="flex items-center gap-1">
                           <UIcon name="i-heroicons-hand-thumb-up" class="w-3.5 h-3.5" />
                           {{ review.likeCount }} thích
                        </span>
                        <span class="flex items-center gap-1">
                           <UIcon name="i-heroicons-hand-thumb-down" class="w-3.5 h-3.5" />
                           {{ review.dislikeCount }} không thích
                        </span>
                     </div>
                  </div>
                  <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash"
                     class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                     @click="openDelete(review.id)" />
               </div>
            </div>
         </div>
         <CommonAppPagination v-if="store.totalPages > 1" v-model:page="store.page" :total="store.total"
            :total-pages="store.totalPages" :items-per-page="store.limit" @change="changePage" />
      </UCard>
      <UCard v-else class="border-dashed">
         <div class="text-center py-12 text-gray-400">
            <UIcon name="i-heroicons-magnifying-glass" class="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p class="font-medium text-gray-500">Tìm và chọn sản phẩm</p>
            <p class="text-sm mt-1">Nhập tên sản phẩm vào ô tìm kiếm bên trên</p>
         </div>
      </UCard>
      <CommonAppConfirmModal v-model:open="deleteOpen" title="Xóa đánh giá"
         message="Xóa đánh giá này? Thao tác không thể hoàn tác." :loading="deleting" @confirm="doDelete" />
   </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'
const store = useReviewStore()
const { api } = useApi()

const searchText = ref('')
const suggestions = ref<Product[]>([])
const searching = ref(false)
const dropdownOpen = ref(false)
const highlightedIndex = ref(-1)
const selectedProduct = ref<Product | null>(null)
const searchContainer = ref<HTMLElement | null>(null)

const deleteOpen = ref(false)
const deletingId = ref<number | null>(null)
const deleting = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
   if (selectedProduct.value && searchText.value !== selectedProduct.value.name) {
      selectedProduct.value = null
      store.items = []
      store.total = 0
   }

   dropdownOpen.value = true
   highlightedIndex.value = -1

   if (debounceTimer) clearTimeout(debounceTimer)

   if (!searchText.value.trim()) {
      suggestions.value = []
      return
   }

   debounceTimer = setTimeout(() => {
      doSearch()
   }, 300)
}

function onFocus() {
   if (searchText.value.length >= 1) {
      dropdownOpen.value = true
   }
}

async function doSearch() {
   if (!searchText.value.trim()) return
   searching.value = true
   try {
      const res = await api<any>('/products', {
         query: {
            search: searchText.value,
            limit: 8,
            isActive: undefined, 
         },
      })
      suggestions.value = res.products || []
   } catch {
      suggestions.value = []
   } finally {
      searching.value = false
   }
}

function closeDropdown() {
   dropdownOpen.value = false
   highlightedIndex.value = -1
}

async function selectProduct(product: Product) {
   selectedProduct.value = product
   searchText.value = product.name
   closeDropdown()
   store.page = 1
   await store.fetchByProduct(product.id)
}

function clearSelection() {
   selectedProduct.value = null
   searchText.value = ''
   suggestions.value = []
   store.items = []
   store.total = 0
   store.totalPages = 0
}



function handleClickOutside(e: MouseEvent) {
   if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
      closeDropdown()
   }
}


async function changePage(p: number) {
   if (!selectedProduct.value) return
   store.page = p
   await store.fetchByProduct(selectedProduct.value.id)
}


function openDelete(id: number) {
   deletingId.value = id
   deleteOpen.value = true
}

async function doDelete() {
   if (!deletingId.value) return
   deleting.value = true
   try {
      await store.remove(deletingId.value)
      deleteOpen.value = false
   } finally {
      deleting.value = false
   }
}


onMounted(() => {
   document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
   document.removeEventListener('mousedown', handleClickOutside)
   if (debounceTimer) clearTimeout(debounceTimer)
})
</script>