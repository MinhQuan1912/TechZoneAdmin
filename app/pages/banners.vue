<template>
   <div class="space-y-4">
      <div class="flex items-center justify-between">
         <UButton icon="i-heroicons-plus" color="primary" @click="openForm">
            Thêm Banner
         </UButton>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
         <UCard v-for="banner in banners" :key="banner.id" class="overflow-hidden">
            <div class="relative">
               <img :src="banner.imageUrl" class="h-40 w-full rounded-lg object-cover" />
               <UBadge :color="banner.isActive ? 'success' : 'neutral'" class="absolute right-2 top-2">
                  {{ banner.isActive ? 'Hiển thị' : 'Ẩn' }}
               </UBadge>
            </div>

            <div class="mt-3">
               <p class="text-sm font-medium">{{ banner.product.name }}</p>
               <p class="text-xs text-gray-500">{{ banner.product.category.name }}</p>
            </div>
            <div class="mt-3 flex gap-2">
               <UButton size="xs" color="neutral" variant="outline" icon="i-heroicons-pencil" @click="openEditForm(banner)" />
               <UButton size="xs" color="error" variant="outline" icon="i-heroicons-trash" @click="deleteBanner(banner.id)" />
            </div>
         </UCard>
      </div>
      <UModal v-model:open="formOpen">
         <template #content>
            <UCard>
               <template #header>
                  <h3 class="font-semibold">{{ editing ? 'Cập nhật Banner' : 'Thêm Banner mới' }}</h3>
               </template>

               <div class="space-y-4">
                  <div ref="searchContainer" class="relative">
                     <UFormField label="Sản phẩm">
                        <div class="relative">
                           <div v-if="!isEditing">
                           <UInput
                              v-model="searchText"
                              placeholder="Nhập tên sản phẩm..."
                              icon="i-heroicons-magnifying-glass"
                              class="w-full"
                              autocomplete="off"
                              @input="onInput"
                              @focus="onFocus"
                              @keydown.down.prevent="moveDown"
                              @keydown.up.prevent="moveUp"
                              @keydown.enter.prevent="selectHighlighted"
                              @keydown.escape="closeDropdown"
                           >
                              <template v-if="selectedProduct" #trailing>
                                 <UButton
                                    color="neutral"
                                    variant="ghost"
                                    icon="i-heroicons-x-mark"
                                    size="xs"
                                    @click="clearSelection"
                                 />
                              </template>
                           </UInput>
                           </div>
                           <Transition
                              enter-active-class="transition duration-150 ease-out"
                              enter-from-class="opacity-0 -translate-y-1"
                              enter-to-class="opacity-100 translate-y-0"
                              leave-active-class="transition duration-100 ease-in"
                              leave-from-class="opacity-100 translate-y-0"
                              leave-to-class="opacity-0 -translate-y-1"
                           >
                              <div
                                 v-if="dropdownOpen && searchText.trim().length >= 1"
                                 class="absolute z-100 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl"
                              >
                                 <div v-if="searching" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
                                    <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                    Đang tìm kiếm...
                                 </div>

                                 <div v-else-if="suggestions.length === 0" class="px-4 py-6 text-center text-sm text-gray-400">
                                    <UIcon name="i-heroicons-magnifying-glass" class="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                    Không tìm thấy sản phẩm nào
                                 </div>

                                 <ul v-else class="max-h-72 overflow-y-auto py-1">
                                    <li
                                       v-for="(product, idx) in suggestions"
                                       :key="product.id"
                                       class="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors"
                                       :class="highlightedIndex === idx ? 'bg-primary-50' : 'hover:bg-gray-50'"
                                       @click="selectProduct(product)"
                                       @mouseenter="highlightedIndex = idx"
                                    >
                                       <img
                                          v-if="product.images?.[0]?.url"
                                          :src="product.images[0].url"
                                          :alt="product.name"
                                          class="h-10 w-10 shrink-0 rounded-lg object-cover"
                                       />
                                       <div
                                          v-else
                                          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100"
                                       >
                                          <UIcon name="i-heroicons-photo" class="h-5 w-5 text-gray-400" />
                                       </div>

                                       <div class="min-w-0 flex-1">
                                          <p class="truncate text-sm font-medium text-gray-900">{{ product.name }}</p>
                                          <div class="mt-0.5 flex items-center gap-2">
                                             <span class="text-xs text-gray-500">{{ product.brand }}</span>
                                             <span class="text-gray-300">·</span>
                                             <span class="text-xs text-gray-500">{{ product.category?.name }}</span>
                                          </div>
                                       </div>
                                    </li>
                                 </ul>
                              </div>
                           </Transition>
                        </div>
                     </UFormField>

                     <div
                        v-if="selectedProduct"
                        class="mt-3 flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 p-3"
                     >
                        <img
                           v-if="selectedProduct.images?.[0]?.url"
                           :src="selectedProduct.images[0].url"
                           :alt="selectedProduct.name"
                           class="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                        <div
                           v-else
                           class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white"
                        >
                           <UIcon name="i-heroicons-photo" class="h-5 w-5 text-gray-400" />
                        </div>
                        <div class="min-w-0 flex-1">
                           <p class="truncate text-sm font-medium text-gray-900">{{ selectedProduct.name }}</p>
                           <p class="text-xs text-gray-500">
                              {{ selectedProduct.brand }} · {{ selectedProduct.category?.name }}
                           </p>
                        </div>
                     </div>
                  </div>

                  <UFormField label="Ảnh banner">
                     <div v-if="!previewUrl"
                        class="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary-400"
                        @click="bannerFileInput?.click()">
                        <UIcon name="i-heroicons-photo" class="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p class="text-sm text-gray-500">Chọn ảnh banner</p>
                     </div>
                     <div v-else class="relative">
                        <img :src="previewUrl" class="h-32 w-full rounded object-cover" />
                        <button
                           class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-white hover:text-red-600"
                           @click="removeImage">
                           <div class="-translate-y-0.5">x</div>
                        </button>
                     </div>
                     <input ref="bannerFileInput" type="file" accept="image/*" class="hidden"
                        @change="onBannerFileChange" />
                  </UFormField>
                  <UFormField label="Trạng thái">
                     <div class="flex items-center gap-3">
                        <USwitch v-model="formData.isActive" />
                        <span class="text-sm">{{ formData.isActive ? 'Hiển thị' : 'Ẩn' }}</span>
                     </div>
                  </UFormField>
               </div>

               <template #footer>
                  <div class="flex justify-end gap-3">
                     <UButton color="neutral" variant="outline" @click="closeForm">Hủy</UButton>
                     <UButton color="primary" :loading="saving" @click="saveBanner">
                        {{ editing ? 'Cập nhật' : 'Tạo banner' }}
                     </UButton>
                  </div>
               </template>
            </UCard>
         </template>
      </UModal>
   </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

type BannerItem = {
   id: number
   imageUrl: string
   isActive: boolean
   productId: number
   product: Product & { slug?: string }
}

const { upload, api } = useApi()
const toast = useToast()

const banners = ref<BannerItem[]>([])
const formOpen = ref(false)
const editing = ref<BannerItem | null>(null)
const saving = ref(false)
const bannerFileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)

const searchText = ref('')
const suggestions = ref<Product[]>([])
const searching = ref(false)
const dropdownOpen = ref(false)
const highlightedIndex = ref(-1)
const selectedProduct = ref<Product | null>(null)
const searchContainer = ref<HTMLElement | null>(null)
const isEditing = computed(() => !!editing.value)
const formData = reactive({
   productId: '',
   isActive: true
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function loadBanners() {
   banners.value = await api<BannerItem[]>('/banners/admin')
}

function resetSearchState() {
   searchText.value = ''
   suggestions.value = []
   dropdownOpen.value = false
   highlightedIndex.value = -1
   selectedProduct.value = null
   formData.productId = ''
}

function openForm() {
   editing.value = null
   Object.assign(formData, { productId: '', isActive: true })
   previewUrl.value = ''
   selectedFile.value = null
   resetSearchState()
   formOpen.value = true
}

function openEditForm(banner: BannerItem) {
   editing.value = banner
   formData.productId = String(banner.productId)
   formData.isActive = banner.isActive
   previewUrl.value = banner.imageUrl
   selectedFile.value = null
   selectedProduct.value = banner.product
   searchText.value = banner.product?.name || ''
   suggestions.value = []
   dropdownOpen.value = false
   highlightedIndex.value = -1
   formOpen.value = true
}

function closeForm() {
   formOpen.value = false
   dropdownOpen.value = false
}

function onBannerFileChange(event: Event) {
   const input = event.target as HTMLInputElement
   const file = input.files?.[0]
   if (!file) return
   selectedFile.value = file
   previewUrl.value = URL.createObjectURL(file)
}

function onInput() {
   if (isEditing.value) return 
   if (selectedProduct.value && searchText.value !== selectedProduct.value.name) {
      selectedProduct.value = null
      formData.productId = ''
   }
   dropdownOpen.value = true
   highlightedIndex.value = -1
   if (debounceTimer) clearTimeout(debounceTimer)
   if (!searchText.value.trim()) {
      suggestions.value = []
      return
   }
   debounceTimer = setTimeout(() => {
      searchProducts()
   }, 300)
}

function onFocus() {
   if (isEditing.value) return
   if (searchText.value.trim().length >= 1) {
      dropdownOpen.value = true
   }
}

async function searchProducts() {
   if (!searchText.value.trim()) return
   searching.value = true
   try {
      const response = await api<any>('/products', {
         query: {
            search: searchText.value,
            limit: 8,
            isActive: undefined
         }
      })
      suggestions.value = response.products || []
   } catch {
      suggestions.value = []
   } finally {
      searching.value = false
   }
}

function moveDown() {
   if (!dropdownOpen.value) return
   highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
}

function moveUp() {
   if (!dropdownOpen.value) return
   highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
}

function selectHighlighted() {
   if (highlightedIndex.value >= 0 && suggestions.value[highlightedIndex.value]) {
      selectProduct(suggestions.value[highlightedIndex.value])
   }
}

function closeDropdown() {
   dropdownOpen.value = false
   highlightedIndex.value = -1
}

function selectProduct(product: Product) {
   selectedProduct.value = product
   formData.productId = String(product.id)
   searchText.value = product.name
   closeDropdown()
}

function clearSelection() {
   selectedProduct.value = null
   formData.productId = ''
   searchText.value = ''
   suggestions.value = []
   closeDropdown()
}

function handleClickOutside(event: MouseEvent) {
   if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
      closeDropdown()
   }
}

async function saveBanner() {
   if (!formData.productId) {
      toast.add({ title: 'Chọn sản phẩm', color: 'error' })
      return
   }

   if (!selectedFile.value && !editing.value) {
      toast.add({ title: 'Chọn ảnh banner', color: 'error' })
      return
   }

   saving.value = true
   try {
      const fd = new FormData()
      fd.append('productId', formData.productId)
      fd.append('isActive', String(formData.isActive))
      if (selectedFile.value) fd.append('image', selectedFile.value)

      await upload('/banners', fd)
      toast.add({ title: 'Đã lưu banner', color: 'success' })
      closeForm()
      await loadBanners()
   } finally {
      saving.value = false
   }
}

async function deleteBanner(id: number) {
   await api(`/banners/${id}`, { method: 'DELETE' })
   await loadBanners()
   toast.add({ title: 'Đã xóa banner', color: 'success' })
}
function removeImage() {
   previewUrl.value = ''
   selectedFile.value = null
}
onMounted(() => {
   loadBanners()
   document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
   document.removeEventListener('mousedown', handleClickOutside)
   if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
