import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const user = useCookie<any | null>('admin_user', {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    default: () => null
  })
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(emailOrUsername: string, password: string) {
    const res = await $fetch<any>('/auth/login', {
      baseURL,
      method: 'POST',
      body: { emailOrUsername, password },
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    if (res.data.user.role !== 'ADMIN') throw new Error('Không có quyền admin')
    user.value = res.data.user
    return res.data
  }

  async function doRefresh() {
    await $fetch<any>('/auth/refresh', {
      baseURL,
      method: 'POST',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
  }

  async function logout() {
    await $fetch<any>('/auth/logout', {
      baseURL,
      method: 'POST',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    })
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    doRefresh,
    logout
  }
})
