<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex gap-3 flex-wrap items-center">
        <UInput v-model="store.search" placeholder="Tìm theo mã đơn" icon="i-heroicons-magnifying-glass" class="w-64"
          @keyup.enter="doFilter" />

        <USelect v-model="store.statusFilter" :items="statusOptions" placeholder="Tất cả trạng thái" class="w-48"
          @update:model-value="doFilter" />

        <UButton icon="i-heroicons-magnifying-glass" @click="doFilter">
          Tìm
        </UButton>

        <UButton color="neutral" variant="outline" @click="resetFilter">
          Reset
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable :data="store.items" :columns="columns" :loading="store.loading">
        <template #code-cell="{ row }">
          <div class="font-mono text-xs text-primary-600">
            {{ row.original.code }}
          </div>
        </template>
        <template #user-cell="{ row }">
          <div>
            <p class="text-sm font-medium">{{ row.original.user?.name }}</p>
            <p class="text-xs text-gray-500">{{ row.original.user?.email }}</p>
          </div>
        </template>
        <template #finalAmount-cell="{ row }">
          <span class="font-semibold text-green-600">{{ formatCurrency(row.original.finalAmount) }}</span>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="(statusColors[row.original.status] as any)" variant="soft">
            {{ statusLabels[row.original.status] }}
          </UBadge>
        </template>
        <template #isPaid-cell="{ row }">
          <UBadge :color="row.original.isPaid ? 'success' : 'warning'" variant="soft">
            {{ row.original.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán' }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(row.original.createdAt) }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton size="xs" color="neutral" variant="outline" icon="i-heroicons-eye"
              :to="`/orders/${row.original.id}`" />
            <UDropdownMenu v-if="nextStatusOptions(row.original.status).length > 0"
              :items="statusDropdownItems(row.original.id, row.original.status)">
              <UButton size="xs" color="neutral" variant="outline" class="w-36 justify-between"
                trailing-icon="i-heroicons-chevron-down-20-solid">
                {{ statusLabels[row.original.status] }}
              </UButton>
            </UDropdownMenu>
          </div>
        </template>
        <template #empty>
          <div class="text-center py-8 text-gray-400">Không có đơn hàng</div>
        </template>
      </UTable>

      <CommonAppPagination v-model:page="store.page" :total="store.total" :total-pages="store.totalPages"
        :items-per-page="store.limit" @change="store.changePage" />
    </UCard>
  </div>
  <UModal v-model:open="showCancelModal">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">Xác nhận hủy đơn hàng</h3>
        <p class="text-sm text-gray-500">Hành động này sẽ hủy đơn và gửi email thông báo đến khách hàng.</p>
        <UFormField label="Lý do hủy (không bắt buộc)">
          <UTextarea v-model="cancelReason" placeholder="Nhập lý do hủy đơn..." :rows="3" class="w-full" />
        </UFormField>
        <div class="flex gap-3 justify-end">
          <UButton color="neutral" variant="outline" @click="showCancelModal = false">Hủy bỏ</UButton>
          <UButton color="error" :loading="cancelling" @click="confirmCancel">Xác nhận hủy</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import { useOrderStore } from '~/stores/orders'
import type { OrderStatus } from '~/types'

const ALL_STATUSES = '__all__'
const store = useOrderStore()
const { formatCurrency, formatDate } = useFormat()
const showCancelModal = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)
const pendingCancel = ref<{ id: number; status: string } | null>(null)

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'warning', CONFIRMED: 'info',
  SHIPPING: 'primary', DELIVERED: 'success',
  COMPLETED: 'success', CANCELLED: 'error',
}
const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao', DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
}
const statusOptions = [
  { label: 'Tất cả', value: ALL_STATUSES },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đang giao', value: 'SHIPPING' },
  { label: 'Đã giao', value: 'DELIVERED' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
]

function nextStatusOptions(current: OrderStatus) {
  const map: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED']
  }
  const next = map[current] || []
  return next.map(s => ({ label: statusLabels[s as OrderStatus], value: s }))
}
function onSelectStatus(id: number, status: string) {
  if (status === 'CANCELLED') {
    pendingCancel.value = { id, status }
    cancelReason.value = ''
    showCancelModal.value = true
  } else {
    updateStatus(id, status)
  }
}

async function confirmCancel() {
  if (!pendingCancel.value) return
  cancelling.value = true
  try {
    await store.updateStatus(
      pendingCancel.value.id,
      pendingCancel.value.status as OrderStatus,
      cancelReason.value || undefined,
    )
    showCancelModal.value = false
    cancelReason.value = ''
    pendingCancel.value = null
  } finally {
    cancelling.value = false
  }
}

const columns = [
  { id: 'code', header: 'Mã đơn' },
  { id: 'user', header: 'Khách hàng' },
  { accessorKey: 'finalAmount', header: 'Tổng tiền' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'isPaid', header: 'Thanh toán' },
  { accessorKey: 'createdAt', header: 'Ngày đặt' },
  { id: 'actions', header: '' }
]

function doFilter() {
  store.page = 1
  store.fetchAll()
}

function resetFilter() {
  store.statusFilter = ALL_STATUSES
  store.search = ''
  store.page = 1
  store.fetchAll()
}

function statusDropdownItems(id: number, current: OrderStatus) {
  return nextStatusOptions(current).map(item => ({
    label: item.label,
    onSelect: () => onSelectStatus(id, item.value),
  }))
}

async function updateStatus(id: number, status: string) {
  await store.updateStatus(id, status as OrderStatus)
}

onMounted(() => store.fetchAll())
</script>