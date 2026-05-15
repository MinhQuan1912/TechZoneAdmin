<template>
   <div class="space-y-4">
      <div class="flex items-center justify-between">
         <UButton icon="i-heroicons-plus" color="primary" class="hover:cursor-pointer" @click="openCreate">Thêm mã</UButton>
      </div>

      <UCard>
         <UTable :data="store.items" :columns="columns" :loading="store.loading">
            <template #code-cell="{ row }">
               <code class="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{{ row.original.code }}</code>
            </template>
            <template #discount-cell="{ row }">
               <span class="font-medium text-green-600">
                  {{ row.original.discountType === 'percent'
                     ? `${row.original.discountValue}%`
                     : formatCurrency(row.original.discountValue) }}
               </span>
               <p v-if="row.original.maxDiscount && row.original.discountType === 'percent'" class="text-xs text-gray-400">
                  tối đa {{ formatCurrency(row.original.maxDiscount) }}
               </p>
            </template>
            <template #minOrder-cell="{ row }">
               <span class="text-sm">{{ formatCurrency(row.original.minOrderAmount) }}</span>
            </template>
            <template #period-cell="{ row }">
               <div class="text-xs">
                  <p>{{ formatDate(row.original.startDate) }}</p>
                  <p class="text-gray-400">→ {{ formatDate(row.original.endDate) }}</p>
               </div>
            </template>
            <template #isActive-cell="{ row }">
               <UBadge :color="row.original.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ row.original.isActive ? 'Hoạt động' : 'Tắt' }}
               </UBadge>
            </template>
            <template #actions-cell="{ row }">
               <div class="flex gap-2">
                  <UButton size="xs" color="neutral" variant="outline" icon="i-heroicons-pencil" @click="openEdit(row.original)" />
                  <UButton size="xs" color="error" variant="outline" icon="i-heroicons-trash" @click="openDelete(row.original)" />
               </div>
            </template>
            <template #empty>
               <div class="text-center py-8 text-gray-400">Chưa có mã giảm giá</div>
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

      <UModal v-model:open="formOpen">
         <template #content>
            <UCard>
               <template #header>
                  <h3 class="font-semibold">{{ editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá' }}</h3>
               </template>
               <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                     <UFormField label="Mã giảm giá *">
                        <UInput v-model="form.code" placeholder="SUMMER20" class="w-full uppercase" />
                     </UFormField>
                     <UFormField label="Loại giảm *">
                        <USelect v-model="form.discountType" :items="typeOptions" class="w-full" />
                     </UFormField>
                     <UFormField label="Giá trị giảm *">
                        <UInput
                           v-model="form.discountValue"
                           type="number"
                           :placeholder="form.discountType === 'percent' ? '20 (%)' : '100000 (đ)'"
                           class="w-full"
                        />
                     </UFormField>
                     <UFormField v-if="form.discountType === 'percent'" label="Giảm tối đa (đ)">
                        <UInput v-model="form.maxDiscount" type="number" placeholder="500000" class="w-full" />
                     </UFormField>
                     <UFormField label="Đơn tối thiểu (đ)">
                        <UInput v-model="form.minOrderAmount" type="number" placeholder="500000" class="w-full" />
                     </UFormField>
                     <UFormField label="Ngày bắt đầu *">
                        <UInput v-model="form.startDate" type="datetime-local" class="w-full" />
                     </UFormField>
                     <UFormField label="Ngày kết thúc *">
                        <UInput v-model="form.endDate" type="datetime-local" class="w-full" />
                     </UFormField>
                     <UFormField label="Mô tả" class="col-span-2">
                        <UInput v-model="form.description" placeholder="Mô tả mã giảm giá" class="w-full" />
                     </UFormField>
                  </div>
                  <UFormField label="Trạng thái">
                     <div class="flex items-center gap-3">
                        <USwitch v-model="form.isActive" />
                        <span class="text-sm">{{ form.isActive ? 'Hoạt động' : 'Tắt' }}</span>
                     </div>
                  </UFormField>
               </div>
               <template #footer>
                  <div class="flex justify-end gap-3">
                     <UButton color="neutral" variant="outline" @click="formOpen = false">Hủy</UButton>
                     <UButton color="primary" :loading="saving" @click="handleSave">
                        {{ editing ? 'Lưu' : 'Tạo' }}
                     </UButton>
                  </div>
               </template>
            </UCard>
         </template>
      </UModal>

      <CommonAppConfirmModal
         v-model:open="deleteOpen"
         title="Xóa mã giảm giá"
         :message="`Xóa mã '${deletingCoupon?.code}'?`"
         :loading="deleting"
         @confirm="doDelete"
      />
   </div>
</template>

<script setup lang="ts">
import { useCouponStore } from '~/stores/coupons'
import type { Coupon } from '~/types'


const store = useCouponStore()
const toast = useToast()

const formOpen = ref(false)
const deleteOpen = ref(false)
const editing = ref<Coupon | null>(null)
const deletingCoupon = ref<Coupon | null>(null)
const saving = ref(false)
const deleting = ref(false)

const typeOptions = [
   { label: 'Phần trăm (%)', value: 'percent' },
   { label: 'Số tiền cố định (đ)', value: 'fixed' }
]

const form = reactive({
   code: '',
   description: '',
   discountType: 'percent',
   discountValue: '',
   maxDiscount: '',
   minOrderAmount: '0',
   startDate: '',
   endDate: '',
   isActive: true
})

const columns = [
   { id: 'code', header: 'Mã' },
   { id: 'discount', header: 'Giảm giá' },
   { id: 'minOrder', header: 'Đơn tối thiểu' },
   { id: 'period', header: 'Thời hạn' },
   { accessorKey: 'isActive', header: 'Trạng thái' },
   { id: 'actions', header: '' }
]

function openCreate() {
   editing.value = null
   Object.assign(form, {
      code: '',
      description: '',
      discountType: 'percent',
      discountValue: '',
      maxDiscount: '',
      minOrderAmount: '0',
      startDate: '',
      endDate: '',
      isActive: true
   })
   formOpen.value = true
}

function openEdit(coupon: Coupon) {
   editing.value = coupon
   Object.assign(form, {
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      minOrderAmount: String(coupon.minOrderAmount),
      startDate: coupon.startDate.slice(0, 16),
      endDate: coupon.endDate.slice(0, 16),
      isActive: coupon.isActive
   })
   formOpen.value = true
}

function openDelete(coupon: Coupon) {
   deletingCoupon.value = coupon
   deleteOpen.value = true
}

async function handleSave() {
   if (!form.code || !form.discountValue || !form.startDate || !form.endDate) {
      toast.add({ title: 'Lỗi', description: 'Điền đầy đủ thông tin bắt buộc', color: 'error' })
      return
   }
   saving.value = true
   try {
      const payload = {
         code: form.code.toUpperCase(),
         description: form.description || undefined,
         discountType: form.discountType,
         discountValue: Number(form.discountValue),
         maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
         minOrderAmount: Number(form.minOrderAmount),
         startDate: new Date(form.startDate).toISOString(),
         endDate: new Date(form.endDate).toISOString(),
         isActive: form.isActive
      }
      if (editing.value) {
         await store.update(editing.value.id, payload)
      } else {
         await store.create(payload)
      }
      formOpen.value = false
      await store.fetchAll()
   } finally {
      saving.value = false
   }
}

async function doDelete() {
   if (!deletingCoupon.value) return
   deleting.value = true
   try {
      await store.remove(deletingCoupon.value.id)
      deleteOpen.value = false
   } finally {
      deleting.value = false
   }
}

onMounted(() => store.fetchAll())
</script>
