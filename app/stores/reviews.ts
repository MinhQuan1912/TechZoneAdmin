import { defineStore } from 'pinia'
import type { Review } from '~/types'

export const useReviewStore = defineStore('reviews', () => {
  const { api } = useApi()
  const toast = useToast()

  const items = ref<Review[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const totalPages = ref(0)
  const selectedProductId = ref<number | null>(null)

  async function fetchByProduct(productId: number) {
    selectedProductId.value = productId
    loading.value = true
    try {
      const res = await api<any>(`/reviews/product/${productId}`, {
        query: { page: page.value, limit: limit.value }
      })
      items.value = res.reviews
      total.value = res.total
      totalPages.value = res.totalPages
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    await api(`/reviews/${id}/admin`, { method: 'DELETE' })
    items.value = items.value.filter(r => r.id !== id)
    total.value -= 1
    toast.add({
      title: 'Thành công',
      description: 'Đã xóa đánh giá',
      color: 'success'
    })
  }

  return {
    items,
    loading,
    total,
    page,
    limit,
    totalPages,
    selectedProductId,
    fetchByProduct,
    remove
  }
})
