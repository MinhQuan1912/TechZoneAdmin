<template>
   <div class="w-full max-w-md">
      <UCard class="shadow-xl">
         <template #header>
            <div class="flex items-center justify-center flex-col text-center py-4">
               <img src="/images/logo.png" class="h-20 w-20 object-contain"/>
               <h1 class="text-2xl font-bold text-gray-900">TechZone Admin</h1>
            </div>
         </template>

         <form class="space-y-4" @submit.prevent="handleLogin">
            <UFormField label="Email" required>
               <UInput v-model="form.email" type="email" placeholder="admin@gmail.com" icon="i-heroicons-envelope"
                  class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Mật khẩu" required>
               <UInput v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••"
                  icon="i-heroicons-lock-closed" class="w-full" :disabled="loading">
                  <template #trailing>
                     <span class="cursor-pointer" @click="showPass = !showPass">
                        <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                     </span>
                  </template>
               </UInput>
            </UFormField>

            <UAlert v-if="error" color="error" variant="soft" icon="i-heroicons-exclamation-circle"
               :description="error" />

            <UButton  type="submit" color="primary" class="w-full text-center! block mx-auto" :loading="loading" size="lg">
               Đăng nhập
            </UButton>
         </form>
      </UCard>
   </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
   layout: 'auth',
   middleware: 'guest'
})

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)

async function handleLogin() {
   if (!form.email || !form.password) {
      error.value = 'Vui lòng nhập đầy đủ thông tin'
      return
   }
   error.value = ''
   loading.value = true
   try {
      await authStore.login(form.email, form.password)
      toast.add({ title: 'Đăng nhập thành công', color: 'success' })
      await navigateTo('/')
   } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Đăng nhập thất bại'
   } finally {
      loading.value = false
   }
}
</script>