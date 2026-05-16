<template>
  <div class="flex h-[calc(100vh-120px)] bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div class="w-72 shrink-0 border-r flex flex-col">
      <div class="px-4 py-3 border-b">
        <h2 class="font-bold text-gray-900">
          Tin nhắn
        </h2>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ chat.rooms.value.length }} cuộc hội thoại
        </p>
      </div>

      <div
        v-if="chat.loadingRooms.value"
        class="flex-1 p-3 space-y-2"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="h-16 animate-pulse bg-gray-100 rounded-xl"
        />
      </div>

      <div
        v-else-if="!chat.rooms.value.length"
        class="flex-1 flex items-center justify-center text-sm text-gray-400"
      >
        Chưa có tin nhắn nào
      </div>

      <div
        v-else
        class="flex-1 overflow-y-auto py-2 min-h-0 "
      >
        <button
          v-for="room in chat.rooms.value"
          :key="room.id"
          class="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          :class="chat.activeRoom.value?.id === room.id ? 'bg-primary-50 border-r-2 border-primary-600' : ''"
          @click="chat.openRoom(room)"
        >
          <div
            class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-primary-700 font-bold uppercase text-sm"
          >
            {{ room.user?.name?.[0] || room.user?.email?.[0] || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ room.user?.name || room.user?.email }}
              </p>
              <span class="text-[10px] text-gray-400 shrink-0 ml-1">
                {{ formatDate(room.updatedAt) }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-0.5">
              <p class="text-xs text-gray-500 truncate">
                {{ room.messages?.[0]?.content || 'Chưa có tin nhắn' }}
              </p>
              <span
                v-if="room._count?.messages > 0"
                class="ml-1 shrink-0 w-5 h-5 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
              >
                {{ room._count.messages > 9 ? '9+' : room._count.messages }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0">
      <div
        v-if="!chat.activeRoom.value"
        class="flex-1 flex flex-col items-center justify-center text-center gap-4 text-gray-400"
      >
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <UIcon
            name="i-heroicons-chat-bubble-left-right"
            class="w-10 h-10 text-gray-300"
          />
        </div>
        <div>
          <p class="font-medium text-gray-600">
            Chọn một cuộc trò chuyện
          </p>
          <p class="text-sm mt-1">
            để bắt đầu trả lời khách hàng
          </p>
        </div>
      </div>

      <template v-else>
        <div class="px-5 py-3 border-b flex items-center gap-3 shrink-0">
          <div
            class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase text-sm"
          >
            {{ chat.activeRoom.value.user?.name?.[0] || '?' }}
          </div>
          <div>
            <p class="font-semibold text-gray-900 text-sm">
              {{ chat.activeRoom.value.user?.name || 'Khách hàng' }}
            </p>
            <p class="text-xs text-gray-500">
              {{ chat.activeRoom.value.user?.email }}
            </p>
          </div>
        </div>

        <div
          ref="messagesEl"
          class="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50"
        >
          <div
            v-if="chat.loadingMessages.value"
            class="space-y-3"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="h-10 animate-pulse bg-white rounded-xl w-2/3"
              :class="i % 2 === 0 ? 'ml-auto' : ''"
            />
          </div>
          <template v-else>
            <div
              v-for="msg in chat.messages.value"
              :key="msg.id"
              class="flex gap-2"
              :class="msg.sender?.role === 'ADMIN' ? 'justify-end' : 'justify-start'"
            >
              <div
                v-if="msg.sender?.role === 'USER'"
                class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 mt-3"
              >
                {{ chat.activeRoom.value?.user?.name?.[0] || 'U' }}
              </div>

              <div
                :class="msg.sender?.role === 'ADMIN' ? 'items-end' : 'items-start'"
                class="flex flex-col max-w-[65%]"
              >
                <div
                  class="px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                  :class="msg.sender?.role === 'ADMIN'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'"
                >
                  {{ msg.content }}
                </div>
                <p class="text-[10px] text-gray-400 mt-1 px-1">
                  {{ formatTime(msg.createdAt) }}
                </p>
              </div>
            </div>

            <div
              v-if="chat.isTyping.value"
              class="flex items-end gap-2"
            >
              <div
                class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0 mt-3"
              >
                {{ chat.activeRoom.value?.user?.name?.[0] || 'U' }}
              </div>
              <div class="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
                <div class="flex gap-1 items-center h-4">
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="px-4 py-3 border-t bg-white shrink-0">
          <div class="flex items-center gap-2">
            <UInput
              v-model="inputText"
              placeholder="Nhập phản hồi..."
              class="flex-1"
              :disabled="!chat.isConnected.value"
              @keydown.enter.prevent="handleSend"
              @input="chat.emitTyping()"
            />
            <UButton
              color="primary"
              :disabled="!inputText.trim() || !chat.isConnected.value"
              icon="i-heroicons-paper-airplane"
              @click="handleSend"
            >
              Gửi
            </UButton>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const chat = useAdminChat()
const inputText = ref('')
const messagesEl = ref<HTMLElement>()

onMounted(async () => {
  chat.connect()
  await chat.fetchRooms()
})

onUnmounted(() => chat.disconnect())

function handleSend() {
  if (!inputText.value.trim()) return
  chat.sendMessage(inputText.value)
  inputText.value = ''
}

function formatTime(d: string) {
  const date = new Date(d)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(d: string) {
  const date = new Date(d)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return formatTime(d)
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

watch(
  () => chat.messages.value.length,
  async () => {
    await nextTick()
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  }
)
</script>
