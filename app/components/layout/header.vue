<template>
   <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 class="text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
      <div class="flex items-center gap-3">
         <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-right-on-rectangle" :loading="loggingOut"
            @click="handleLogout">
            Đăng xuất
         </UButton>
      </div>
   </header>
</template>

<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()
const loggingOut = ref(false)

const titleMap: Record<string, string> = {
   '/': 'Dashboard',
   '/products': 'Quản lý sản phẩm',
   '/categories': 'Quản lý danh mục',
   '/orders': 'Quản lý đơn hàng',
   '/users': 'Quản lý người dùng',
   '/coupons': 'Mã giảm giá',
   '/reviews': 'Quản lý đánh giá',
   '/banners': 'Quản lý Banner',
   '/chat': 'Hỗ trợ khách hàng',
}

const pageTitle = computed(() => {
   const matched = Object.keys(titleMap)
      .filter(key => route.path === key || (key !== '/' && route.path.startsWith(key)))
      .sort((a, b) => b.length - a.length)[0]
   return matched ? titleMap[matched] : 'Admin Panel'
})

async function handleLogout() {
   loggingOut.value = true
   try {
      await authStore.logout()
      toast.add({ title: 'Đã đăng xuất', color: 'info' })
      await navigateTo('/login')
   } finally {
      loggingOut.value = false
   }
}
</script>