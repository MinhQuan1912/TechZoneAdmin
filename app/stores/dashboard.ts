import { defineStore } from 'pinia'
import type { DashboardStats, RevenueStats } from '~/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const { api } = useApi()

  const stats = ref<DashboardStats | null>(null)
  const revenue = ref<RevenueStats | null>(null)
  const loading = ref(false)

  async function fetchDashboard() {
    loading.value = true
    try {
      stats.value = await api<DashboardStats>('/admin/dashboard')
    } finally {
      loading.value = false
    }
  }

  async function fetchRevenue(year: number, month?: number) {
    loading.value = true
    try {
      const query: Record<string, any> = { year }
      if (month) query.month = month
      revenue.value = await api<RevenueStats>('/admin/stats', { query })
    } finally {
      loading.value = false
    }
  }
  return { stats, revenue, loading, fetchDashboard, fetchRevenue }
})
