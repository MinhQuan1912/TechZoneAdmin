<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-left" to="/products" />
      <h1 class="page-title">
        Thêm sản phẩm mới
      </h1>
    </div>
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            Thông tin cơ bản
          </h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Tên sản phẩm *" class="md:col-span-2">
            <UInput v-model="form.name" placeholder="iPhone 15 Pro Max" class="w-full" required />
          </UFormField>
          <UFormField label="Nhãn hàng *">
            <UInput v-model="form.brand" placeholder="Apple, Samsung..." class="w-full" required />
          </UFormField>
          <UFormField label="Danh mục *">
            <USelect v-model="form.categoryId" :items="categoryOptions" placeholder="Chọn danh mục" class="w-full" />
          </UFormField>
          <UFormField label="Mô tả" class="md:col-span-2">
            <UTextarea v-model="form.description" :rows="4" class="w-full" />
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
              Ảnh sản phẩm
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Ảnh hiển thị khi chưa chọn màu. Click vào ảnh để đặt làm ảnh chính.
            </p>
          </div>
        </template>
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
          @click="productFileInput?.click()" @dragover.prevent @drop.prevent="onProductImageDrop">
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm text-gray-500">
            Kéo thả hoặc <span class="text-primary-600 font-medium">chọn ảnh</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">
            PNG, JPG, WEBP tối đa 5MB - Có thể chọn nhiều ảnh
          </p>
        </div>
        <input ref="productFileInput" type="file" accept="image/*" multiple class="hidden"
          @change="onProductImageChange">
        <div v-if="productImagePreviews.length > 0" class="mt-4">
          <p class="text-xs text-gray-500 mb-2">
            Click vào ảnh để đặt làm <span class="text-primary-600 font-medium">ảnh chính</span>
            (viền xanh = ảnh chính)
          </p>
          <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
            <div v-for="(img, idx) in productImagePreviews" :key="idx"
              class="relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all"
              :class="mainImageIndex === idx ? 'border-primary-500 scale-95' : 'border-transparent hover:border-gray-300'"
              @click="mainImageIndex = idx">
              <img :src="img" class="w-full h-20 object-cover">
              <div v-if="mainImageIndex === idx" class="absolute top-1 left-1">
                <UBadge color="primary" size="xs">
                  Chính
                </UBadge>
              </div>
              <button type="button"
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="removeProductImage(idx)">
                ×
              </button>
            </div>
          </div>
        </div>
      </UCard>
      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold">
              Biến thể sản phẩm *
            </h3>
          </div>
        </template>
        <ProductsVariantField v-model="form.variants" />
      </UCard>
      <div class="flex justify-end gap-3">
        <UButton to="/products" color="neutral" variant="outline">
          Hủy
        </UButton>
        <UButton type="submit" color="primary" :loading="loading" icon="i-heroicons-check">
          Tạo sản phẩm
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { VariantForm } from '~/types'

const catStore = useCategoryStore()
const productStore = useProductStore()
const toast = useToast()

const productFileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const mainImageIndex = ref(0)

const form = reactive({
  name: '',
  description: '',
  brand: '',
  categoryId: '',
  isActive: true,
  variants: [
    { color: '', storage: '', ram: '', cpu: '', version: '', originalPrice: '', salePrice: '', stock: '' }
  ] as VariantForm[]
})

const productImageFiles = ref<File[]>([])
const productImagePreviews = ref<string[]>([])

const categoryOptions = computed(() =>
  catStore.items.map(c => ({ label: c.name, value: String(c.id) }))
)

function onProductImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  addProductImages(Array.from(files))
}

function onProductImageDrop(e: DragEvent) {
  addProductImages(Array.from(e.dataTransfer?.files || []))
}

function addProductImages(files: File[]) {
  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: `${file.name} vượt quá 5MB`, color: 'error' })
      return
    }
    productImageFiles.value.push(file)
    productImagePreviews.value.push(URL.createObjectURL(file))
  })
}

function removeProductImage(idx: number) {
  URL.revokeObjectURL(productImagePreviews.value[idx])
  productImagePreviews.value.splice(idx, 1)
  productImageFiles.value.splice(idx, 1)
  if (mainImageIndex.value >= productImagePreviews.value.length) {
    mainImageIndex.value = Math.max(0, productImagePreviews.value.length - 1)
  }
}

async function handleSubmit() {
  if (!form.name.trim()) return toast.add({ title: 'Nhập tên sản phẩm', color: 'error' })
  if (!form.brand.trim()) return toast.add({ title: 'Nhập nhãn hàng', color: 'error' })
  if (!form.categoryId) return toast.add({ title: 'Chọn danh mục', color: 'error' })
  if (!form.variants.length) return toast.add({ title: 'Cần ít nhất 1 biến thể', color: 'error' })

  for (const [i, v] of form.variants.entries()) {
    if (!v.originalPrice || !v.salePrice || v.stock === '') {
      return toast.add({ title: `Biến thể #${i + 1}: điền đủ giá và tồn kho`, color: 'error' })
    }
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('brand', form.brand)
    formData.append('categoryId', form.categoryId)
    formData.append('isActive', String(form.isActive))
    formData.append('mainImageIndex', String(mainImageIndex.value))
    formData.append('variants', JSON.stringify(
      form.variants.map(v => ({
        color: v.color || undefined,
        storage: v.storage || undefined,
        ram: v.ram || undefined,
        cpu: v.cpu || undefined,
        version: v.version || undefined,
        originalPrice: Number(v.originalPrice),
        salePrice: Number(v.salePrice),
        stock: Number(v.stock)
      }))
    ))

    productImageFiles.value.forEach(f => formData.append('images', f))

    const product = await productStore.create(formData)
    toast.add({ title: 'Đã tạo sản phẩm!', description: 'Bạn có thể upload ảnh màu trong trang chỉnh sửa', color: 'success' })
    await navigateTo(`/products/${(product as any).id}/edit`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (catStore.items.length === 0) catStore.fetchAll()
})

onUnmounted(() => {
  productImagePreviews.value.forEach(url => URL.revokeObjectURL(url))
})
</script>
