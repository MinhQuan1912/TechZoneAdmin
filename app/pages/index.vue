<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2">
      <USelect
        v-model="selectedMonth"
        :items="monthOptions"
        value-key="value"
        label-key="label"
        class="w-36"
        @update:model-value="onFilterChange"
      />
      <USelect
        v-model="selectedYear"
        :items="yearOptions"
        value-key="value"
        label-key="label"
        class="w-28"
        @update:model-value="onFilterChange"
      />
    </div>
    <div
      v-if="dashStore.loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <UCard
        v-for="i in 4"
        :key="i"
        class="animate-pulse"
      >
        <div class="h-16 bg-gray-100 rounded" />
      </UCard>
    </div>
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <CommonAppStatsCard
        icon="i-heroicons-currency-dollar"
        label="Doanh thu"
        :value="formatCurrency(dashStore.revenue?.totalRevenue || 0)"
        bg-color="bg-green-50"
        icon-color="text-green-600"
      />
      <CommonAppStatsCard
        icon="i-heroicons-shopping-cart"
        label="Tổng đơn hàng"
        :value="dashStore.revenue?.orderCount || 0"
        :sub="`Đã giao: ${dashStore.revenue?.deliveredOrders || 0}`"
        bg-color="bg-blue-50"
        icon-color="text-blue-600"
      />
      <CommonAppStatsCard
        icon="i-heroicons-users"
        label="Người dùng"
        :value="dashStore.revenue?.totalUsers || 0"
        :sub="`Mới trong kỳ: ${dashStore.revenue?.newUsers || 0}`"
        bg-color="bg-purple-50"
        icon-color="text-purple-600"
      />
      <CommonAppStatsCard
        icon="i-heroicons-cube"
        label="Sản phẩm"
        :value="dashStore.stats?.totalProducts || 0"
        sub="Đang hiển thị"
        bg-color="bg-orange-50"
        icon-color="text-orange-600"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <h3 class="font-semibold text-gray-900">
            Doanh thu {{ selectedMonth === 0 ? `năm ${selectedYear}` : `tháng ${selectedMonth}/${selectedYear}` }}
          </h3>
        </template>
        <div
          v-if="dashStore.loading"
          class="h-64 bg-gray-50 rounded-lg animate-pulse"
        />
        <div
          v-else-if="chartData.length === 0"
          class="h-64 flex flex-col items-center justify-center gap-2 text-gray-400"
        >
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-10 h-10 text-gray-200"
          />
          <span class="text-sm">Không có dữ liệu trong kỳ này</span>
        </div>
        <div v-else>
          <div
            class="relative flex gap-3"
            style="height: 220px;"
          >
            <div
              class="flex flex-col justify-between items-end shrink-0 pb-6"
              style="width: 72px;"
            >
              <span
                v-for="i in 5"
                :key="i"
                class="text-xs text-gray-400 leading-none"
              >
                {{ formatYAxis(maxRevenue * (1 - (i - 1) / 4)) }}
              </span>
            </div>
            <div class="flex-1 relative pb-6">
              <div class="absolute inset-0 pb-6 flex flex-col justify-between pointer-events-none">
                <div
                  v-for="i in 5"
                  :key="i"
                  class="w-full border-t"
                  :class="i === 1 ? 'border-gray-200' : 'border-dashed border-gray-100'"
                />
              </div>
              <div class="absolute inset-0 pb-6 flex items-end gap-px">
                <div
                  v-for="(item, idx) in chartData"
                  :key="idx"
                  class="flex-1 group relative flex items-end"
                  style="height: 100%;"
                >
                  <div
                    class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                           bg-gray-800 text-white text-xs px-2 py-1 rounded-md
                           whitespace-nowrap opacity-0 group-hover:opacity-100
                           pointer-events-none transition-opacity"
                  >
                    <p class="font-medium">
                      {{ formatChartLabel(item.date) }}
                    </p>
                    <p class="text-primary-300">
                      {{ formatCurrency(Number(item.revenue)) }}
                    </p>
                  </div>
                  <div
                    class="w-full rounded-t-sm transition-all duration-200 bg-primary-300 hover:bg-primary-500 cursor-pointer"
                    :style="{ height: barHeightPx(item.revenue) + 'px' }"
                  />
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0 flex">
                <div
                  v-for="(item, idx) in chartData"
                  :key="idx"
                  class="flex-1 flex justify-center"
                >
                  <span
                    v-if="shouldShowLabel(idx)"
                    class="text-xs text-gray-400 leading-none"
                  >
                    {{ formatChartLabel(item.date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-gray-900">
            Top bán chạy
          </h3>
        </template>
        <div class="space-y-3">
          <div
            v-for="(p, idx) in dashStore.revenue?.topProducts || []"
            :key="p.id"
            class="flex items-center gap-3"
          >
            <span
              class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0"
            >
              {{ idx + 1 }}
            </span>
            <img
              v-if="p.images?.[0]?.url"
              :src="p.images[0].url"
              class="w-8 h-8 rounded object-cover shrink-0"
              :alt="p.name"
            >
            <div
              v-else
              class="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0"
            >
              <UIcon
                name="i-heroicons-photo"
                class="text-gray-400 w-4 h-4"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ p.name }}
              </p>
              <p class="text-xs text-gray-500">
                Đã bán: <span class="font-semibold text-primary-600">{{
                  p.totalSold
                }}</span>
              </p>
            </div>
          </div>
          <div
            v-if="!dashStore.revenue?.topProducts?.length"
            class="text-sm text-gray-400 text-center py-6"
          >
            Không có dữ liệu trong kỳ này
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">
            Đơn đã giao gần đây
          </h3>
          <UButton
            to="/orders"
            color="neutral"
            variant="ghost"
            size="sm"
            trailing-icon="i-heroicons-arrow-right"
          >
            Xem tất cả
          </UButton>
        </div>
      </template>
      <UTable
        :data="recentDeliveredOrders"
        :columns="orderColumns"
      >
        <template #code-cell="{ row }">
          <span class="font-mono text-xs text-gray-600">{{ row.original.code }}</span>
        </template>
        <template #user-cell="{ row }">
          <div>
            <p class="text-sm font-medium">
              {{ row.original.user?.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ row.original.user?.email }}
            </p>
          </div>
        </template>
        <template #finalAmount-cell="{ row }">
          <span class="font-semibold text-green-600">{{ formatCurrency(row.original.finalAmount) }}</span>
        </template>
        <template #createdAt-cell="{ row }">
          <span class="text-xs text-gray-500">{{ formatDate(row.original.createdAt) }}</span>
        </template>
        <template #empty>
          <div class="text-center py-6 text-gray-400 text-sm">
            Chưa có đơn đã giao
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '~/stores/dashboard'

const dashStore = useDashboardStore()

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(0)

const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  label: `Năm ${currentYear - i}`,
  value: currentYear - i
}))

const monthOptions = [
  { label: 'Cả năm', value: 0 },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1
  }))
]

async function onFilterChange() {
  await dashStore.fetchRevenue(
    selectedYear.value,
    selectedMonth.value || undefined
  )
}

const chartData = computed(() => dashStore.revenue?.chartData || [])

const maxRevenue = computed(() => {
  const vals = chartData.value.map(d => Number(d.revenue))
  return vals.length ? Math.max(...vals) : 1
})

const CHART_MAX_PX = 160

function barHeightPx(revenue: string | number): number {
  return Math.max((Number(revenue) / maxRevenue.value) * CHART_MAX_PX, 2)
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'T'
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(0) + 'M'
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K'
  return value.toFixed(0)
}

function formatChartLabel(date: string): string {
  if (date.length === 7) {
    const m = parseInt(date.split('-')[1])
    return `Th${m}`
  }
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function shouldShowLabel(idx: number): boolean {
  const len = chartData.value.length
  if (len <= 12) return true
  if (len <= 15) return idx % 2 === 0
  return idx % 5 === 0
}
const recentDeliveredOrders = computed(() =>
  (dashStore.stats?.recentOrders || [])
    .filter(o => o.status === 'DELIVERED')
    .slice(0, 10)
)

const orderColumns = [
  { accessorKey: 'code', header: 'Mã đơn' },
  { id: 'user', header: 'Khách hàng' },
  { accessorKey: 'finalAmount', header: 'Tổng tiền' },
  { accessorKey: 'createdAt', header: 'Ngày đặt' }
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN')
}

onMounted(async () => {
  await Promise.all([
    dashStore.fetchDashboard(),
    dashStore.fetchRevenue(selectedYear.value)
  ])
})
</script>
