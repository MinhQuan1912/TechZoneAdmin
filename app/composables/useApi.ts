import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string
  const toast = useToast()

  async function api<T = any>(
    url: string,
    options: {
      method?: string
      body?: any
      query?: Record<string, any>
      headers?: Record<string, string>
    } = {}
  ): Promise<T> {
    const doFetch = async (): Promise<T> => {
      const result = await $fetch<{ success: boolean, data: T }>(url, {
        baseURL,
        method: (options.method as any) || 'GET',
        body: options.body,
        params: options.query,
        headers: options.headers || {},
        credentials: 'include'
      })
      return result.data
    }

    try {
      return await doFetch()
    } catch (error: any) {
      if (error?.status === 401) {
        try {
          await authStore.doRefresh()
          return await doFetch()
        } catch {
          authStore.logout()
          await navigateTo('/login')
          throw error
        }
      }
      const msg = Array.isArray(error?.data?.message)
        ? error.data.message.join(', ')
        : error?.data?.message || 'Đã xảy ra lỗi'
      toast.add({ title: 'Lỗi', description: msg, color: 'error' })
      throw error
    }
  }

  async function upload<T = any>(url: string, formData: FormData): Promise<T> {
    try {
      const result = await $fetch<{ success: boolean, data: T }>(url, {
        baseURL,
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      return result.data
    } catch (error: any) {
      const msg = error?.data?.message || 'Upload thất bại'
      toast.add({ title: 'Lỗi upload', description: msg, color: 'error' })
      throw error
    }
  }

  async function uploadPatch<T = any>(url: string, formData: FormData): Promise<T> {
    try {
      const result = await $fetch<{ success: boolean, data: T }>(url, {
        baseURL,
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      })
      return result.data
    } catch (error: any) {
      const msg = error?.data?.message || 'Cập nhật thất bại'
      toast.add({ title: 'Lỗi', description: msg, color: 'error' })
      throw error
    }
  }

  return { api, upload, uploadPatch }
}
