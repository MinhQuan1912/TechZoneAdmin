<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex gap-3">
        <UInput v-model="store.search" placeholder="Tìm theo tên, email..." icon="i-heroicons-magnifying-glass"
          class="flex-1" @keyup.enter="doSearch" />
        <UButton color="primary" icon="i-heroicons-magnifying-glass" @click="doSearch">
          Tìm
        </UButton>
        <UButton color="neutral" variant="outline" @click="store.search = ''; store.fetchAll()">
          Reset
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable :data="store.items" :columns="columns" :loading="store.loading">
        <template #name-cell="{ row }">
          <div>
            <p class="font-medium text-sm">
              {{ row.original.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ row.original.email }}
            </p>
          </div>
        </template>
        <template #isBlocked-cell="{ row }">
          <UBadge :color="row.original.isBlocked ? 'error' : 'success'" variant="soft">
            {{ row.original.isBlocked ? 'Đã khóa' : 'Hoạt động' }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton size="xs" :color="row.original.isBlocked ? 'success' : 'warning'" variant="outline"
              :icon="row.original.isBlocked ? 'i-heroicons-lock-open' : 'i-heroicons-lock-closed'"
              :loading="blockingId === row.original.id" @click="openBlockConfirm(row.original)">
              {{ row.original.isBlocked ? 'Mở khóa' : 'Khóa' }}
            </UButton>
            <UButton size="xs" color="neutral" variant="outline" icon="i-heroicons-heart"
              @click="viewWishlist(row.original)">
              Xem danh sách yêu thích
            </UButton>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-8 text-gray-400">
            Không có người dùng
          </div>
        </template>
      </UTable>

      <CommonAppPagination v-model:page="store.page" :total="store.total" :total-pages="store.totalPages"
        :items-per-page="store.limit" @change="store.changePage" />
    </UCard>

    <UModal v-model:open="wishlistOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold">
                  Wishlist của {{ selectedUser?.name }}
                </h3>
                <p v-if="wishlistItems.length > 0" class="text-xs text-gray-500 mt-0.5">
                  {{ wishlistItems.length }} sản phẩm yêu thích
                </p>
              </div>
              <UBadge v-if="wishlistItems.length > 0" color="primary" variant="soft">
                {{ wishlistItems.length }}
              </UBadge>
            </div>
          </template>

          <div v-if="wishlistLoading" class="text-center py-8">
            <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>

          <div v-else-if="wishlistItems.length === 0" class="text-center py-8 text-gray-400">
            <UIcon name="i-heroicons-heart" class="w-10 h-10 mx-auto mb-2" />
            <p class="text-sm">
              Wishlist trống
            </p>
          </div>

          <div v-else class="space-y-2 max-h-[480px] overflow-y-auto -mx-1 px-1">
            <div v-for="item in wishlistItems" :key="item.id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
              <div class="shrink-0">
                <img v-if="item.product?.images?.[0]?.url" :src="item.product.images[0].url"
                  class="w-14 h-14 rounded-lg object-cover" :alt="item.product?.name">
                <div v-else class="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="text-gray-400 w-6 h-6" />
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ item.product?.name }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ item.product?.brand }} · {{ item.product?.category?.name }}
                </p>

                <div class="flex flex-col gap-1 mt-1">
                  <div v-for="variant in item.product?.variants?.slice(0, 2)" :key="variant.id"
                    class="text-xs text-gray-400">
                    {{ [variant.color, variant.storage, variant.ram].filter(Boolean).join('/') }}
                  </div>
                  <div v-if="(item.product?.variants?.length || 0) > 2" class="text-xs text-gray-400">
                    +{{ item.product.variants.length - 2 }} phiên bản
                  </div>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-sm font-bold text-primary-600">
                  {{ formatCurrency(minPrice(item.product?.variants)) }}
                </p>

                <p v-if="maxPrice(item.product?.variants) !== minPrice(item.product?.variants)"
                  class="text-xs text-gray-400 mt-0.5">
                  ~ {{ formatCurrency(maxPrice(item.product?.variants)) }}
                </p>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex items-center justify-end">
              <UButton color="neutral" @click="wishlistOpen = false">
                Đóng
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
    <UModal v-model:open="confirmOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-lock-closed" class="text-orange-500 w-5 h-5" />
              <h3 class="font-semibold">Khóa tài khoản</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Bạn sắp khóa tài khoản của
              <strong>{{ pendingUser?.name }}</strong>
              ({{ pendingUser?.email }}).
              <br />Một email thông báo sẽ được gửi đến người dùng.
            </p>

            <UFormField label="Lý do khóa">
              <UTextarea v-model="blockReason" placeholder="Ví dụ: Vi phạm điều khoản sử dụng..." :rows="3"
                class="w-full" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="confirmOpen = false">
                Hủy
              </UButton>
              <UButton color="warning" icon="i-heroicons-lock-closed" :loading="blockingId === pendingUser?.id"
                @click="doToggleBlock(pendingUser!, blockReason || undefined)">
                Xác nhận khóa
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/users'
import type { User } from '~/types'

const store = useUserStore()

const blockingId = ref<number | null>(null)
const wishlistOpen = ref(false)
const selectedUser = ref<User | null>(null)
const wishlistItems = ref<any[]>([])
const wishlistLoading = ref(false)
const confirmOpen = ref(false)
const pendingUser = ref<User | null>(null)
const blockReason = ref('')

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { id: 'name', header: 'Người dùng' },
  { accessorKey: 'phone', header: 'SĐT' },
  { accessorKey: 'address', header: 'Địa chỉ' },
  { accessorKey: 'isBlocked', header: 'Trạng thái' },
  { id: 'actions', header: '' }
]

function doSearch() {
  store.page = 1
  store.fetchAll()
}

async function doToggleBlock(user: User, reason?: string) {
  blockingId.value = user.id
  confirmOpen.value = false
  try {
    await store.toggleBlock(user.id, reason)
  } finally {
    blockingId.value = null
    pendingUser.value = null
  }
}
function openBlockConfirm(user: User) {
  if (user.isBlocked) {
    doToggleBlock(user, undefined)
    return
  }
  pendingUser.value = user
  blockReason.value = ''
  confirmOpen.value = true
}
async function viewWishlist(user: User) {
  selectedUser.value = user
  wishlistOpen.value = true
  wishlistLoading.value = true
  try {
    wishlistItems.value = await store.getWishlist(user.id)
  } finally {
    wishlistLoading.value = false
  }
}

function minPrice(variants: any[]): number {
  if (!variants?.length) return 0
  return Math.min(...variants.map(v => v.salePrice))
}

function maxPrice(variants: any[]): number {
  if (!variants?.length) return 0
  return Math.max(...variants.map(v => v.salePrice))
}

onMounted(() => store.fetchAll())
</script>
