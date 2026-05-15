<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        class="hover:cursor-pointer"
        @click="openCreate"
      >
        Thêm danh mục
      </UButton>
    </div>

    <UCard>
      <UTable
        :data="store.items"
        :columns="columns"
        :loading="store.loading"
      >
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0"
            >
              <img
                v-if="row.original.imageUrl"
                :src="row.original.imageUrl"
                class="w-full h-full object-cover"
                :alt="row.original.name"
              >
              <UIcon
                v-else
                name="i-heroicons-photo"
                class="text-gray-300 w-5 h-5"
              />
            </div>
            <div>
              <p class="font-medium">
                {{ row.original.name }}
              </p>
              <p class="text-xs text-gray-400">
                {{ row.original.slug }}
              </p>
            </div>
          </div>
        </template>
        <template #products-cell="{ row }">
          <UBadge
            :color="(row.original._count?.products || 0) > 0 ? 'primary' : 'neutral'"
            variant="soft"
          >
            {{ row.original._count?.products || 0 }} sản phẩm
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              icon="i-heroicons-pencil"
              @click="openEdit(row.original)"
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
          <div class="text-center py-8 text-gray-400">
            Chưa có danh mục nào
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="formOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              {{ editingCategory ? 'Sửa danh mục' : 'Thêm danh mục' }}
            </h3>
          </template>

          <div class="space-y-4">
            <UFormField label="Tên danh mục *">
              <UInput
                v-model="formName"
                placeholder="Điện thoại, Laptop..."
                class="w-full"
              />
            </UFormField>

            <UFormField label="Ảnh danh mục">
              <div
                v-if="imagePreview || (editingCategory?.imageUrl && !removeExistingImage)"
                class="relative w-full h-36 rounded-xl overflow-hidden mb-2 border border-gray-200 bg-gray-50"
              >
                <img
                  :src="imagePreview || editingCategory?.imageUrl || ''"
                  class="w-full h-full object-cover"
                >
                <UButton
                  size="xs"
                  color="error"
                  variant="solid"
                  icon="i-heroicons-x-mark"
                  class="absolute top-2 right-2"
                  @click="clearImage"
                />
              </div>

              <div
                v-else
                class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                @click="fileInput?.click()"
              >
                <UIcon
                  name="i-heroicons-cloud-arrow-up"
                  class="w-8 h-8 text-gray-300 mx-auto mb-2"
                />
                <p class="text-sm text-gray-400">
                  Click để chọn ảnh
                </p>
                <p class="text-xs text-gray-300 mt-1">
                  PNG, JPG tối đa 5MB
                </p>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              >
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                @click="formOpen = false"
              >
                Hủy
              </UButton>
              <UButton
                color="primary"
                :loading="saving"
                @click="handleSave"
              >
                {{ editingCategory ? 'Lưu' : 'Tạo' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <UModal v-model:open="deleteOpen">
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
              <h3 class="font-semibold">
                Xóa danh mục
              </h3>
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-gray-700">
              Bạn muốn xóa danh mục <strong>"{{ deletingCategory?.name }}"</strong>?
            </p>

            <UAlert
              v-if="(deletingCategory?._count?.products || 0) > 0"
              color="warning"
              variant="soft"
              icon="i-heroicons-information-circle"
              :title="`Danh mục có ${deletingCategory?._count?.products} sản phẩm`"
              description="Chọn cách xử lý sản phẩm trước khi xóa danh mục."
            />

            <div
              v-if="(deletingCategory?._count?.products || 0) > 0"
              class="space-y-2"
            >
              <label
                class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="moveProducts ? 'border-primary-500 bg-primary-50' : ''"
                @click="moveProducts = true"
              >
                <input
                  type="radio"
                  :checked="moveProducts"
                  class="mt-0.5"
                  readonly
                >
                <div>
                  <p class="text-sm font-medium">Chuyển sản phẩm sang "Chưa phân loại"</p>
                  <p class="text-xs text-gray-500">Sản phẩm được giữ lại, chỉ đổi danh mục</p>
                </div>
              </label>
              <label
                class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="!moveProducts ? 'border-red-500 bg-red-50' : ''"
                @click="moveProducts = false"
              >
                <input
                  type="radio"
                  :checked="!moveProducts"
                  class="mt-0.5"
                  readonly
                >
                <div>
                  <p class="text-sm font-medium text-red-600">Hủy xóa</p>
                  <p class="text-xs text-gray-500">Xóa sản phẩm trước, rồi xóa danh mục sau</p>
                </div>
              </label>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                @click="deleteOpen = false"
              >
                Hủy
              </UButton>
              <UButton
                v-if="(deletingCategory?._count?.products || 0) === 0 || moveProducts"
                color="error"
                :loading="deleting"
                @click="doDelete"
              >
                {{ (deletingCategory?._count?.products || 0) > 0 ? 'Chuyển và xóa' : 'Xóa' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useCategoryStore } from '~/stores/categories'
import type { Category } from '~/types'

const store = useCategoryStore()
const toast = useToast()

const formOpen = ref(false)
const deleteOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)
const formName = ref('')
const saving = ref(false)
const deleting = ref(false)
const moveProducts = ref(true)

const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const removeExistingImage = ref(false)
const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'name', header: 'Tên danh mục' },
  { id: 'actions', header: '' }
]

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  removeExistingImage.value = false
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = null
  removeExistingImage.value = true
  if (fileInput.value) fileInput.value.value = ''
}

function openCreate() {
  editingCategory.value = null
  formName.value = ''
  imageFile.value = null
  imagePreview.value = null
  removeExistingImage.value = false
  formOpen.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  formName.value = category.name
  imageFile.value = null
  imagePreview.value = null
  removeExistingImage.value = false
  formOpen.value = true
}

function openDelete(category: Category) {
  deletingCategory.value = category
  moveProducts.value = true
  deleteOpen.value = true
}

async function handleSave() {
  if (!formName.value.trim()) {
    toast.add({ title: 'Lỗi', description: 'Nhập tên danh mục', color: 'error' })
    return
  }
  saving.value = true
  try {
    if (editingCategory.value) {
      if (removeExistingImage.value && !imageFile.value) {
        await store.removeImage(editingCategory.value.id)
      }
      await store.update(editingCategory.value.id, formName.value, imageFile.value || undefined)
    } else {
      await store.create(formName.value, imageFile.value || undefined)
    }
    formOpen.value = false
    await store.fetchAll()
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!deletingCategory.value) return
  const hasProducts = (deletingCategory.value._count?.products || 0) > 0
  if (hasProducts && !moveProducts.value) {
    deleteOpen.value = false
    return
  }
  deleting.value = true
  try {
    await store.remove(deletingCategory.value.id, hasProducts && moveProducts.value)
    deleteOpen.value = false
    await store.fetchAll()
  } catch (error: any) {
    toast.add({ title: 'Không thể xóa', description: error?.data?.message || 'Lỗi xóa danh mục', color: 'error' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => store.fetchAll())
</script>
