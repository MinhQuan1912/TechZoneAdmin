import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('users', () => {
  const { api } = useApi()
  const toast = useToast()

  const items = ref<User[]>([])
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(20)
  const totalPages = ref(0)
  const search = ref('')

  async function fetchAll() {
    loading.value = true
    try {
      const query: Record<string, any> = {
        page: page.value,
        limit: limit.value
      }
      if (search.value) query.search = search.value
      const res = await api<any>('/admin/users', { query })
      items.value = res.users
      total.value = res.total
      totalPages.value = res.totalPages
    } finally {
      loading.value = false
    }
  }

  async function toggleBlock(id: number) {
    const res = await api<any>(`/admin/users/${id}/block`, { method: 'PATCH' })
    const idx = items.value.findIndex(u => u.id === id)
    const user = items.value[idx]
    if (user) {
      user.isBlocked = res.isBlocked

      toast.add({
        title: res.isBlocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
        color: res.isBlocked ? 'warning' : 'success'
      })
    }
    return res
  }

  async function getWishlist(userId: number) {
    return await api<any[]>(`/wishlist/admin/user/${userId}`)
  }

  function changePage(p: number) {
    page.value = p
    fetchAll()
  }

  return {
    items,
    loading,
    total,
    page,
    limit,
    totalPages,
    search,
    fetchAll,
    toggleBlock,
    getWishlist,
    changePage
  }
})
