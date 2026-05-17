<template>
  <aside class="max-h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="h-16 flex justify-center items-center px-6 border-b border-gray-200">
      <span class="text-xl font-bold text-primary-600 ">Admin</span>
    </div>
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="sidebar-link"
        :class="{ active: isActive(item.to) }"
      >
        <UIcon
          :name="item.icon"
          class="w-5 h-5"
        />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
          <UIcon
            name="i-heroicons-user"
            class="text-primary-600"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.user?.name }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ authStore.user?.email }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'i-heroicons-home' },
  { to: '/products', label: 'Quản lý sản phẩm', icon: 'i-heroicons-cube' },
  { to: '/categories', label: 'Quản lý danh mục', icon: 'i-heroicons-tag' },
  { to: '/orders', label: 'Quản lý đơn hàng', icon: 'i-heroicons-shopping-cart' },
  { to: '/users', label: 'Quản lý người dùng', icon: 'i-heroicons-users' },
  { to: '/coupons', label: 'Quản lý mã giảm giá', icon: 'i-heroicons-ticket' },
  { to: '/reviews', label: 'Quản lý đánh giá', icon: 'i-heroicons-star' },
  { to: '/banners', label: 'Quản lý banner', icon: 'i-heroicons-photo' },
  { to: '/chat', label: 'Chat với người dùng', icon: 'i-heroicons-chat-bubble-left-right' }
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>
