<template>
   <div class="space-y-4">
      <UCard>
         <div class="flex gap-3 flex-wrap">
            <USelect
               v-model="store.statusFilter"
               :items="statusOptions"
               placeholder="Tất cả trạng thái"
               class="w-48"
               @update:model-value="doFilter"
            />
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
                  {{ row.original.isPaid ? 'Đã TT' : 'Chưa TT' }}
               </UBadge>
            </template>
            <template #createdAt-cell="{ row }">
               <span class="text-xs text-gray-500">{{ formatDate(row.original.createdAt) }}</span>
            </template>
            <template #actions-cell="{ row }">
               <div class="flex gap-2">
                  <UButton
                     size="xs"
                     color="neutral"
                     variant="outline"
                     icon="i-heroicons-eye"
                     :to="`/orders/${row.original.id}`"
                  />
                  <USelect
                     v-if="row.original.status !== 'DELIVERED' && row.original.status !== 'CANCELLED'"
                     :model-value="row.original.status"
                     :items="nextStatusOptions(row.original.status)"
                     size="xs"
                     class="w-36"
                     @update:model-value="(val: string) => updateStatus(row.original.id, val)"
                  />
               </div>
            </template>
            <template #empty>
               <div class="text-center py-8 text-gray-400">Không có đơn hàng</div>
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
   </div>
</template>

<script setup lang="ts">
import { useOrderStore } from '~/stores/orders'
import type { OrderStatus } from '~/types'


const ALL_STATUSES = '__all__'
const store = useOrderStore()

const statusColors: Record<OrderStatus, string> = {
   PENDING: 'warning',
   CONFIRMED: 'info',
   SHIPPING: 'primary',
   DELIVERED: 'success',
   CANCELLED: 'error'
}

const statusLabels: Record<OrderStatus, string> = {
   PENDING: 'Chờ XN',
   CONFIRMED: 'Đã XN',
   SHIPPING: 'Đang giao',
   DELIVERED: 'Đã giao',
   CANCELLED: 'Đã hủy'
}

const statusOptions = [
   { label: 'Tất cả', value: ALL_STATUSES },
   { label: 'Chờ xác nhận', value: 'PENDING' },
   { label: 'Đã xác nhận', value: 'CONFIRMED' },
   { label: 'Đang giao', value: 'SHIPPING' },
   { label: 'Đã giao', value: 'DELIVERED' },
   { label: 'Đã hủy', value: 'CANCELLED' }
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
   store.page = 1
   store.fetchAll()
}

async function updateStatus(id: number, status: string) {
   await store.updateStatus(id, status as OrderStatus)
}

onMounted(() => store.fetchAll())
</script>
