import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useAdminChat = () => {
  const { api } = useApi()

  const rooms = ref<any[]>([])
  const activeRoom = ref<any | null>(null)
  const messages = ref<any[]>([])
  const isTyping = ref(false)
  const isConnected = ref(false)
  const loadingRooms = ref(false)
  const loadingMessages = ref(false)

  async function fetchRooms() {
    loadingRooms.value = true
    try {
      rooms.value = await api('/chat/rooms')
    } finally {
      loadingRooms.value = false
    }
  }

  async function connect() {
    if (!import.meta.client) return
    if (socket?.connected) return
    const authStore = useAuthStore()

    try {
      await authStore.doRefresh();
    } catch {
      await authStore.logout();
      await navigateTo("/login");
      return;
    }
    
    socket = io(
      `${useRuntimeConfig().public.apiBase.replace("/api", "")}/chat`,
      {
        withCredentials: true,
        transports: ["websocket"],
        auth: { type: "admin" },
      },
    );

    socket.on('connect', () => {
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      isConnected.value = false
    })

    socket.on('room_messages', (msgs: any[]) => {
      messages.value = msgs
      loadingMessages.value = false
    })

    socket.on('new_message', (msg: any) => {
      if (activeRoom.value && msg.roomId === activeRoom.value.id) {
        messages.value.push(msg)
      }
    })

    socket.on('room_updated', (data: any) => {
      const idx = rooms.value.findIndex(r => r.id === data.roomId)
      if (idx !== -1) {
        rooms.value[idx] = {
          ...rooms.value[idx],
          messages: [data.lastMessage],
          updatedAt: new Date().toISOString(),
          _count: {
            messages:
              activeRoom.value?.id === data.roomId
                ? 0
                : (rooms.value[idx]._count?.messages || 0) + 1
          }
        }
        rooms.value.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      } else {
        fetchRooms()
      }
    })

    socket.on('user_typing', (data: any) => {
      if (data.role === 'USER') isTyping.value = data.isTyping
    })
  }

  async function openRoom(room: any) {
    activeRoom.value = room
    messages.value = []
    loadingMessages.value = true

    if (room._count?.messages > 0) {
      room._count.messages = 0
    }

    if (!socket?.connected) {
      try {
        messages.value = await api(`/chat/rooms/${room.id}/messages`)
      } finally {
        loadingMessages.value = false
      }
      return
    }

    socket.emit('admin_join_room', { roomId: room.id })
  }
  setTimeout(() => {
    if (loadingMessages.value) loadingMessages.value = false
  }, 5000)
  function sendMessage(content: string) {
    if (!socket?.connected || !content.trim() || !activeRoom.value) return
    socket.emit('send_message', { content, roomId: activeRoom.value.id })
  }

  let typingTimer: ReturnType<typeof setTimeout>
  function emitTyping() {
    if (!activeRoom.value) return
    socket?.emit('typing', { roomId: activeRoom.value.id, isTyping: true })
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      socket?.emit('typing', { roomId: activeRoom.value.id, isTyping: false })
    }, 1500)
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
    isConnected.value = false
  }

  return {
    rooms,
    activeRoom,
    messages,
    isTyping,
    isConnected,
    loadingRooms,
    loadingMessages,
    fetchRooms,
    connect,
    openRoom,
    sendMessage,
    emitTyping,
    disconnect
  }
}
