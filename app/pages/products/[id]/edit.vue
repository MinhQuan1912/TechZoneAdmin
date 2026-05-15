<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        to="/products"
      />
      <h1 class="page-title">
        Chỉnh sửa sản phẩm
      </h1>
    </div>

    <div
      v-if="productStore.loading"
      class="space-y-4"
    >
      <UCard
        v-for="i in 3"
        :key="i"
        class="animate-pulse"
      >
        <div class="h-32 bg-gray-100 rounded" />
      </UCard>
    </div>

    <form
      v-else-if="productStore.current"
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            Thông tin cơ bản
          </h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField
            label="Tên sản phẩm *"
            class="md:col-span-2"
          >
            <UInput
              v-model="form.name"
              class="w-full"
              required
            />
          </UFormField>
          <UFormField label="Nhãn hàng *">
            <UInput
              v-model="form.brand"
              class="w-full"
              required
            />
          </UFormField>
          <UFormField label="Danh mục *">
            <USelect
              v-model="form.categoryId"
              :items="categoryOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Mô tả"
            class="md:col-span-2"
          >
            <UTextarea
              v-model="form.description"
              :rows="4"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Trạng thái">
            <div class="flex items-center gap-3">
              <USwitch v-model="form.isActive" />
              <span class="text-sm">{{ form.isActive ? 'Hiển thị' : 'Ẩn' }}</span>
            </div>
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold">
              Ảnh chung sản phẩm
            </h3>
          </div>
        </template>

        <div
          v-if="existingImages.length > 0"
          class="mb-4"
        >
          <p class="text-xs font-medium text-gray-600 mb-2">
            Ảnh hiện tại:
          </p>
          <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
            <div
              v-for="img in existingImages"
              :key="img.id"
              class="relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all"
              :class="[
                img.isMain ? 'border-primary-500' : 'border-transparent hover:border-gray-300',
                toDeleteImageIds.includes(img.id) ? 'opacity-40 scale-90' : ''
              ]"
              @click="!toDeleteImageIds.includes(img.id) && handleSetMainImage(img.id)"
            >
              <img
                :src="img.url"
                class="w-full h-20 object-cover"
              >

              <div
                v-if="img.isMain && !toDeleteImageIds.includes(img.id)"
                class="absolute top-1 left-1"
              >
                <UBadge
                  color="primary"
                  size="xs"
                >
                  Chính
                </UBadge>
              </div>

              <div
                v-if="toDeleteImageIds.includes(img.id)"
                class="absolute inset-0 flex items-center justify-center bg-red-500/20"
              >
                <span class="text-xs font-bold text-red-600 bg-white/90 px-2 py-0.5 rounded">Xóa</span>
              </div>

              <button
                type="button"
                class="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                :class="toDeleteImageIds.includes(img.id) ? 'bg-gray-500' : 'bg-red-500'"
                @click.stop="toggleDeleteImage(img.id)"
              >
                {{ toDeleteImageIds.includes(img.id) ? '↩' : '×' }}
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2">
            Click ảnh để đặt làm ảnh chính - Click × để đánh dấu xóa — Click ↩ để khôi phục
          </p>
        </div>

        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
          @click="newImageFileInput?.click()"
          @dragover.prevent
          @drop.prevent="e => addNewImages(Array.from(e.dataTransfer?.files || []))"
        >
          <UIcon
            name="i-heroicons-plus"
            class="w-6 h-6 text-gray-300 mx-auto mb-1"
          />
          <p class="text-sm text-gray-500">
            Thêm ảnh mới
          </p>
        </div>
        <input
          ref="newImageFileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onNewImageChange"
        >

        <div
          v-if="newImagePreviews.length > 0"
          class="mt-3"
        >
          <p class="text-xs text-gray-500 mb-2">
            Ảnh mới - click để chọn ảnh chính (trong batch upload này)
          </p>
          <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
            <div
              v-for="(img, idx) in newImagePreviews"
              :key="idx"
              class="relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all"
              :class="newMainIndex === idx ? 'border-primary-500' : 'border-transparent hover:border-gray-300'"
              @click="newMainIndex = idx"
            >
              <img
                :src="img"
                class="w-full h-20 object-cover"
              >
              <div
                v-if="newMainIndex === idx"
                class="absolute top-1 left-1"
              >
                <UBadge
                  color="primary"
                  size="xs"
                >
                  Chính
                </UBadge>
              </div>
              <button
                type="button"
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                @click.stop="removeNewImage(idx)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">
                Biến thể
              </h3>
            </div>
            <UBadge
              color="neutral"
              variant="soft"
            >
              {{ productStore.current.variants.length }} biến thể
            </UBadge>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="variant in productStore.current.variants"
            :key="variant.id"
            class="border border-gray-200 rounded-xl overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
              @click="toggleExpand(variant.id)"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="expanded.includes(variant.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="w-4 h-4 text-gray-400"
                />
                <div class="flex flex-wrap gap-1.5">
                  <UBadge
                    v-if="variant.color"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  >
                    🎨 {{ variant.color }}
                  </UBadge>
                  <UBadge
                    v-if="variant.storage"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  >
                    💾 {{ variant.storage }}
                  </UBadge>
                  <UBadge
                    v-if="variant.ram"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  >
                    🧠 {{ variant.ram }}
                  </UBadge>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <img
                  v-if="variant.imageUrl"
                  :src="variant.imageUrl"
                  class="w-8 h-8 rounded-lg object-cover border border-primary-200"
                  :title="`Ảnh màu ${variant.color}`"
                >
                <div
                  v-else-if="variant.color"
                  class="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  title="Chưa có ảnh màu"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="w-4 h-4 text-gray-300"
                  />
                </div>
                <span class="text-sm text-green-600 font-medium">
                  {{ formatCurrency(variant.salePrice) }}
                </span>
                <span class="text-xs text-gray-400">Kho: {{ variant.stock }}</span>
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  @click.stop="openDeleteVariant(variant.id)"
                />
              </div>
            </div>

            <div
              v-if="expanded.includes(variant.id)"
              class="px-4 py-4 space-y-4"
            >
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <UFormField label="Màu sắc">
                  <UInput
                    v-model="variantForms[variant.id].color"
                    placeholder="Đen Titan"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Dung lượng">
                  <UInput
                    v-model="variantForms[variant.id].storage"
                    placeholder="256GB"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="RAM">
                  <UInput
                    v-model="variantForms[variant.id].ram"
                    placeholder="8GB"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="CPU">
                  <UInput
                    v-model="variantForms[variant.id].cpu"
                    placeholder="M3"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Tồn kho *">
                  <UInput
                    v-model="variantForms[variant.id].stock"
                    type="number"
                    :min="0"
                    class="w-full"
                    :class="Number(variantForms[variant.id].stock) === 0 ? 'ring-2 ring-red-400' : ''"
                  />
                </UFormField>
                <UFormField label="Giá gốc (đ) *">
                  <UInput
                    v-model="variantForms[variant.id].originalPrice"
                    type="number"
                    :min="0"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Giá bán (đ) *">
                  <div>
                    <UInput
                      v-model="variantForms[variant.id].salePrice"
                      type="number"
                      :min="0"
                      class="w-full"
                    />
                    <p
                      v-if="getDiscount(variant.id) > 0"
                      class="text-xs text-green-600 mt-1"
                    >
                      Giảm {{ getDiscount(variant.id) }}%
                    </p>
                  </div>
                </UFormField>
              </div>

              <div class="border-t border-gray-100 pt-4">
                <p class="text-sm font-medium text-gray-700 mb-3">
                  Ảnh cho màu
                  <span class="text-primary-600">{{ variant.color || 'này' }}</span>
                  <span class="text-xs text-gray-400 ml-2">(chỉ 1 ảnh)</span>
                </p>

                <div class="flex items-start gap-4">
                  <div class="shrink-0">
                    <div
                      v-if="variant.imageUrl"
                      class="relative group w-28 h-28 rounded-xl overflow-hidden border-2 border-primary-200"
                    >
                      <img
                        :src="variant.imageUrl"
                        class="w-full h-full object-cover"
                      >
                      <div
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity"
                      >
                        <UButton
                          size="xs"
                          variant="solid"
                          icon="i-heroicons-arrow-path"
                          @click="triggerVariantImageInput(variant.id)"
                        >
                          Đổi ảnh
                        </UButton>
                        <UButton
                          size="xs"
                          color="error"
                          variant="solid"
                          icon="i-heroicons-trash"
                          :loading="removingVariantImageId === variant.id"
                          @click="handleRemoveVariantImage(variant.id)"
                        >
                          Xóa
                        </UButton>
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                      @click="triggerVariantImageInput(variant.id)"
                    >
                      <UIcon
                        name="i-heroicons-plus"
                        class="w-6 h-6 text-gray-300 mb-1"
                      />
                      <span class="text-xs text-gray-400 text-center px-2">Upload ảnh màu</span>
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 space-y-1">
                    <p
                      v-if="variant.imageUrl"
                      class="text-green-600"
                    >
                      Đã có ảnh màu
                    </p>
                    <p
                      v-else
                      class="text-orange-500"
                    >
                      Chưa có ảnh
                    </p>
                  </div>
                </div>
                <input
                  :ref="el => { if (el) variantImageInputs[variant.id] = el as HTMLInputElement }"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="e => handleVariantImageChange(e, variant.id)"
                >
              </div>
              <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <UButton
                  size="sm"
                  color="primary"
                  :loading="savingVariantId === variant.id"
                  icon="i-heroicons-check"
                  @click="saveVariant(variant.id)"
                >
                  Lưu biến thể
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">
              Thêm biến thể mới
            </h4>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              :icon="showNewVariants ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              @click="showNewVariants = !showNewVariants"
            />
          </div>
          <ProductsVariantField
            v-if="showNewVariants"
            v-model="newVariants"
          />
        </div>
      </UCard>

      <div class="flex justify-end gap-3 pb-6">
        <UButton
          to="/products"
          color="neutral"
          variant="outline"
        >
          Hủy
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          icon="i-heroicons-check"
        >
          Lưu thông tin sản phẩm
        </UButton>
      </div>
    </form>

    <CommonAppConfirmModal
      v-model:open="variantDeleteOpen"
      title="Xóa biến thể"
      message="Xóa biến thể này? Ảnh màu cũng sẽ bị xóa."
      :loading="variantDeleting"
      @confirm="doDeleteVariant"
    />
  </div>
</template>

<script setup lang="ts">
import type { VariantForm, ProductVariant } from '~/types'

const route = useRoute()
const productId = Number(route.params.id)
const productStore = useProductStore()
const catStore = useCategoryStore()
const toast = useToast()

const newImageFileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const toDeleteImageIds = ref<number[]>([])
const newImageFiles = ref<File[]>([])
const newImagePreviews = ref<string[]>([])
const newMainIndex = ref(0)

const expanded = ref<number[]>([])
const variantForms = ref<Record<number, any>>({})
const quickStock = ref<Record<number, string>>({})
const savingVariantId = ref<number | null>(null)
const variantDeleteOpen = ref(false)
const selectedVariantId = ref<number | null>(null)
const variantDeleting = ref(false)
const showNewVariants = ref(false)
const newVariants = ref<VariantForm[]>([])

const variantImageInputs = ref<Record<number, HTMLInputElement>>({})
const removingVariantImageId = ref<number | null>(null)

const form = reactive({
  name: '', description: '', brand: '', categoryId: '', isActive: true
})

const existingImages = computed(() => productStore.current?.images || [])
const categoryOptions = computed(() =>
  catStore.items.map(c => ({ label: c.name, value: String(c.id) }))
)

function initVariantForms(variants: ProductVariant[]) {
  variants.forEach((v) => {
    variantForms.value[v.id] = {
      color: v.color || '',
      storage: v.storage || '',
      ram: v.ram || '',
      cpu: v.cpu || '',
      version: v.version || '',
      stock: String(v.stock),
      originalPrice: String(v.originalPrice),
      salePrice: String(v.salePrice)
    }
    quickStock.value[v.id] = ''
  })
}

function toggleExpand(id: number) {
  const idx = expanded.value.indexOf(id)
  if (idx === -1) expanded.value.push(id)
  else expanded.value.splice(idx, 1)
}

function getDiscount(variantId: number) {
  const f = variantForms.value[variantId]
  if (!f) return 0
  const orig = Number(f.originalPrice)
  const sale = Number(f.salePrice)
  if (!orig || orig <= sale) return 0
  return Math.round(((orig - sale) / orig) * 100)
}

async function handleSetMainImage(imageId: number) {
  try {
    await productStore.setMainImage(productId, imageId)
    toast.add({ title: 'Đã đặt làm ảnh chính', color: 'success' })
  } catch {
    toast.add({ title: 'Lỗi đổi ảnh chính', color: 'error' })
  }
}

function toggleDeleteImage(id: number) {
  const idx = toDeleteImageIds.value.indexOf(id)
  if (idx === -1) toDeleteImageIds.value.push(id)
  else toDeleteImageIds.value.splice(idx, 1)
}

function onNewImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  addNewImages(Array.from(files))
}

function addNewImages(files: File[]) {
  files.forEach((f) => {
    newImageFiles.value.push(f)
    newImagePreviews.value.push(URL.createObjectURL(f))
  })
}

function removeNewImage(idx: number) {
  URL.revokeObjectURL(newImagePreviews.value[idx])
  newImagePreviews.value.splice(idx, 1)
  newImageFiles.value.splice(idx, 1)
}

function triggerVariantImageInput(variantId: number) {
  variantImageInputs.value[variantId]?.click()
}

async function handleVariantImageChange(e: Event, variantId: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  savingVariantId.value = variantId
  try {
    await productStore.setVariantImage(variantId, file)
    toast.add({
      title: 'Đã cập nhật ảnh màu',
      color: 'success'
    })
  } catch {
    toast.add({ title: 'Upload ảnh thất bại', color: 'error' })
  } finally {
    savingVariantId.value = null
    if (variantImageInputs.value[variantId]) {
      variantImageInputs.value[variantId].value = ''
    }
  }
}

async function handleRemoveVariantImage(variantId: number) {
  removingVariantImageId.value = variantId
  try {
    await productStore.removeVariantImage(variantId)
    toast.add({ title: 'Đã xóa ảnh màu', color: 'info' })
  } finally {
    removingVariantImageId.value = null
  }
}

async function saveVariant(variantId: number) {
  const f = variantForms.value[variantId]
  if (!f.stock || !f.originalPrice || !f.salePrice) {
    return toast.add({ title: 'Điền đủ stock và giá', color: 'error' })
  }
  if (Number(f.salePrice) > Number(f.originalPrice)) {
    return toast.add({ title: 'Giá bán không được cao hơn giá gốc', color: 'error' })
  }
  savingVariantId.value = variantId
  try {
    await productStore.updateVariant(variantId, {
      color: f.color || undefined,
      storage: f.storage || undefined,
      ram: f.ram || undefined,
      cpu: f.cpu || undefined,
      version: f.version || undefined,
      stock: Number(f.stock),
      originalPrice: Number(f.originalPrice),
      salePrice: Number(f.salePrice)
    })
    toast.add({ title: 'Đã lưu biến thể', color: 'success' })
    await productStore.fetchOne(productId)
    initVariantForms(productStore.current!.variants)
  } finally {
    savingVariantId.value = null
  }
}

function openDeleteVariant(id: number) {
  selectedVariantId.value = id
  variantDeleteOpen.value = true
}

async function doDeleteVariant() {
  if (!selectedVariantId.value) return
  variantDeleting.value = true
  try {
    await productStore.deleteVariant(selectedVariantId.value)
    expanded.value = expanded.value.filter(id => id !== selectedVariantId.value)
    variantDeleteOpen.value = false
    await productStore.fetchOne(productId)
    initVariantForms(productStore.current!.variants)
    toast.add({ title: 'Đã xóa biến thể', color: 'success' })
  } finally {
    variantDeleting.value = false
  }
}

async function handleSubmit() {
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('brand', form.brand)
    formData.append('categoryId', form.categoryId)
    formData.append('isActive', String(form.isActive))

    if (toDeleteImageIds.value.length > 0) {
      formData.append('deleteImageIds', JSON.stringify(toDeleteImageIds.value))
    }
    if (newImageFiles.value.length > 0) {
      formData.append('mainImageIndex', String(newMainIndex.value))
      newImageFiles.value.forEach(f => formData.append('images', f))
    }

    await productStore.update(productId, formData)
    for (const v of newVariants.value) {
      if (v.originalPrice && v.salePrice) {
        await productStore.addVariant(productId, {
          color: v.color || undefined,
          storage: v.storage || undefined,
          ram: v.ram || undefined,
          cpu: v.cpu || undefined,
          version: v.version || undefined,
          originalPrice: Number(v.originalPrice),
          salePrice: Number(v.salePrice),
          stock: Number(v.stock)
        })
      }
    }

    toast.add({ title: 'Đã cập nhật sản phẩm', color: 'success' })
    await navigateTo('/products')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await catStore.fetchAll()
  await productStore.fetchOne(productId)
  if (productStore.current) {
    const p = productStore.current
    form.name = p.name
    form.description = p.description || ''
    form.brand = p.brand
    form.categoryId = String(p.categoryId)
    form.isActive = p.isActive
    initVariantForms(p.variants)
  }
})

onUnmounted(() => {
  newImagePreviews.value.forEach(url => URL.revokeObjectURL(url))
})
</script>
