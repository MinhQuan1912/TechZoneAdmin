import { defineStore } from 'pinia'
import type { Order, OrderStatus } from '~/types'

const ALL_STATUSES = '__all__'

export const useOrderStore = defineStore('orders', () => {
  const { api } = useApi()
  const toast = useToast()

  const items = ref<Order[]>([])
  const current = ref<Order | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const totalPages = ref(0)
  const statusFilter = ref(ALL_STATUSES)

  async function fetchAll() {
    loading.value = true
    try {
      const query: Record<string, any> = {
        page: page.value,
        limit: limit.value
      }
      if (statusFilter.value !== ALL_STATUSES) query.status = statusFilter.value
      const res = await api<any>('/orders/admin/all', { query })
      items.value = res.orders
      total.value = res.total
      totalPages.value = res.totalPages
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    loading.value = true
    try {
      current.value = await api<Order>(`/orders/${id}`)
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: OrderStatus) {
    const res = await api<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status }
    })
    const idx = items.value.findIndex(o => o.id === id)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...res }
    if (current.value?.id === id) current.value = { ...current.value, ...res }
    toast.add({
      title: 'Cập nhật thành công',
      description: `Trạng thái: ${status}`,
      color: 'success'
    })
    return res
  }

  function changePage(p: number) {
    page.value = p
    fetchAll()
  }

  return {
    items,
    current,
    loading,
    total,
    page,
    limit,
    totalPages,
    statusFilter,
    fetchAll,
    fetchOne,
    updateStatus,
    changePage
  }
})
