<template>
   <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
         <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-left" to="/orders" />
         <h1 class="page-title">Chi tiết đơn hàng</h1>
      </div>

      <div v-if="store.loading" class="text-center py-20">
         <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>

      <template v-else-if="store.current">
         <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard class="md:col-span-2">
               <template #header>
                  <div class="flex items-center justify-between">
                     <h3 class="font-semibold">{{ store.current.code }}</h3>
                     <UBadge :color="(statusColors[store.current.status] as any)" variant="soft">
                        {{ statusLabels[store.current.status] }}
                     </UBadge>
                  </div>
               </template>
               <div class="space-y-3 text-sm">
                  <div class="grid grid-cols-2 gap-3">
                     <div>
                        <p class="text-gray-500">Ngày đặt</p>
                        <p class="font-medium">{{ formatDate(store.current.createdAt) }}</p>
                     </div>
                     <div>
                        <p class="text-gray-500">Thanh toán</p>
                        <UBadge :color="store.current.isPaid ? 'success' : 'warning'" variant="soft">
                           {{ store.current.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                        </UBadge>
                     </div>
                  </div>
                  <USeparator />
                  <div>
                     <p class="text-gray-500 mb-1">Người nhận</p>
                     <p class="font-medium">{{ store.current.recipientName }}</p>
                     <p class="text-gray-600">{{ store.current.recipientPhone }}</p>
                     <p class="text-gray-600">{{ store.current.recipientAddress }}</p>
                  </div>
                  <div v-if="store.current.note">
                     <p class="text-gray-500 mb-1">Ghi chú</p>
                     <p class="text-gray-600 italic">{{ store.current.note }}</p>
                  </div>
               </div>
            </UCard>

            <div class="space-y-4">
               <UCard>
                  <template #header>
                     <h3 class="font-semibold">Tóm tắt</h3>
                  </template>
                  <div class="space-y-2 text-sm">
                     <div class="flex justify-between">
                        <span class="text-gray-500">Tạm tính</span>
                        <span>{{ formatCurrency(store.current.totalAmount) }}</span>
                     </div>
                     <div v-if="store.current.discountAmount > 0" class="flex justify-between text-red-500">
                        <span class="flex items-center gap-1.5">
                           Giảm giá
                           <span v-if="store.current.coupon"
                              class="font-mono text-xs bg-red-50 border border-red-200 text-red-500 px-1.5 py-0.5 rounded">
                              {{ store.current.coupon.code }}
                           </span>
                        </span>
                        <span>-{{ formatCurrency(store.current.discountAmount) }}</span>
                     </div>
                     <div class="flex justify-between">
                        <span class="text-gray-500">Phí vận chuyển</span>
                        <span class="text-green-600 font-medium">Miễn phí</span>
                     </div>
                     <USeparator />
                     <div class="flex justify-between font-semibold text-base">
                        <span>Tổng cộng</span>
                        <span class="text-green-600">{{ formatCurrency(store.current.finalAmount) }}</span>
                     </div>
                  </div>
               </UCard>

               <UCard v-if="!['DELIVERED', 'CANCELLED'].includes(store.current.status)">
                  <template #header>
                     <h3 class="font-semibold">Cập nhật trạng thái</h3>
                  </template>
                  <div class="space-y-3">
                     <USelect v-model="newStatus" :items="availableStatuses" class="w-full" />
                     <UButton color="primary" class="w-full" :loading="updating" :disabled="!newStatus"
                        @click="doUpdateStatus">
                        Cập nhật
                     </UButton>
                  </div>
               </UCard>
            </div>
         </div>

         <UCard>
            <template #header>
               <h3 class="font-semibold">Sản phẩm đã đặt</h3>
            </template>
            <div class="divide-y divide-gray-100">
               <div v-for="item in store.current.items" :key="item.id"
                  class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 first:pt-0 last:pb-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                     <img
                        v-if="item.variant?.imageUrl || item.product?.images?.[0]?.url"
                        :src="item.variant?.imageUrl || item.product?.images?.[0]?.url"
                        :alt="item.product?.name"
                        class="w-full h-full object-cover"
                     />
                     <UIcon v-else name="i-heroicons-photo" class="w-5 h-5 text-gray-300" />
                  </div>
                  <div class="flex-1 min-w-0">
                     <p class="font-medium text-sm truncate">{{ item.product?.name }}</p>
                     <p class="text-xs text-gray-500">
                        {{ [item.variant?.color, item.variant?.storage, item.variant?.ram].filter(Boolean).join(' / ') }}
                     </p>
                  </div>
                  <div class="text-right shrink-0">
                     <p class="text-sm font-medium">{{ formatCurrency(item.price) }}</p>
                     <p class="text-xs text-gray-500">x{{ item.quantity }}</p>
                  </div>
                  <div class="text-right shrink-0 min-w-20">
                     <p class="font-semibold text-green-600">{{ formatCurrency(item.price * item.quantity) }}</p>
                  </div>
               </div>
            </div>
         </UCard>
      </template>
   </div>
</template>

<script setup lang="ts">
import { useFormat } from '~/composables/useFormat'
import { useOrderStore } from '~/stores/orders'
import type { OrderStatus } from '~/types'

const route = useRoute()
const store = useOrderStore()
const { formatCurrency, formatDate } = useFormat()

const orderId = Number(route.params.id)
const updating = ref(false)
const newStatus = ref('')

const statusColors: Record<OrderStatus, string> = {
   PENDING: 'warning', CONFIRMED: 'info',
   SHIPPING: 'primary', DELIVERED: 'success', CANCELLED: 'error',
}
const statusLabels: Record<OrderStatus, string> = {
   PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
   SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy',
}

const nextSteps: Record<string, string[]> = {
   PENDING: ['CONFIRMED', 'CANCELLED'],
   CONFIRMED: ['SHIPPING', 'CANCELLED'],
   SHIPPING: ['DELIVERED'],
}

const availableStatuses = computed(() => {
   const current = store.current?.status || ''
   return (nextSteps[current] || []).map(s => ({
      label: statusLabels[s as OrderStatus],
      value: s,
   }))
})

async function doUpdateStatus() {
   if (!newStatus.value) return
   updating.value = true
   try {
      await store.updateStatus(orderId, newStatus.value as OrderStatus)
      newStatus.value = ''
   } finally {
      updating.value = false
   }
}

onMounted(() => store.fetchOne(orderId))
</script>