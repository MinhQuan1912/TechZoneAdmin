import { defineStore } from 'pinia'
import type { Product, PaginatedResponse } from '~/types'

export const useProductStore = defineStore('products', () => {
  const { api, upload, uploadPatch } = useApi()

  const items = ref<Product[]>([])
  const current = ref<Product | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(12)
  const totalPages = ref(0)

  const filter = ref({
    search: '',
    categoryId: '',
    brand: '',
    isActive: '',
    sortBy: ''
  })

  async function fetchAll() {
    loading.value = true
    try {
      const query: Record<string, any> = {
        page: page.value,
        limit: limit.value
      }
      if (filter.value.search) query.search = filter.value.search
      if (filter.value.categoryId) query.categoryId = filter.value.categoryId
      if (filter.value.brand) query.brand = filter.value.brand
      if (filter.value.isActive !== '') query.isActive = filter.value.isActive
      if (filter.value.sortBy) query.sortBy = filter.value.sortBy

      const res = await api<any>('/products', { query })
      items.value = res.products
      total.value = res.total
      totalPages.value = res.totalPages
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    loading.value = true
    try {
      current.value = await api<Product>(`/products/${id}`)
    } finally {
      loading.value = false
    }
  }

  async function create(formData: FormData) {
    return await upload<Product>('/products', formData)
  }

  async function update(id: number, formData: FormData) {
    return await uploadPatch<Product>(`/products/${id}`, formData)
  }

  async function remove(id: number) {
    return await api(`/products/${id}`, { method: 'DELETE' })
  }

  async function setMainImage(productId: number, imageId: number) {
    const res = await api<any>(`/products/${productId}/images/${imageId}/main`, {
      method: 'PATCH'
    })
    if (current.value?.id === productId) {
      current.value.images = current.value.images.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
    }
    return res
  }

  async function setVariantImage(variantId: number, file: File) {
    const formData = new FormData()
    formData.append('image', file)
    const res = await upload<any>(
      `/products/variants/${variantId}/image`,
      formData
    )
    if (current.value) {
      current.value.variants = current.value.variants.map(v =>
        v.id === variantId
          ? { ...v, imageUrl: res.imageUrl, imagePublicId: res.imagePublicId }
          : v
      )
    }
    return res
  }

  async function removeVariantImage(variantId: number) {
    const res = await api(`/products/variants/${variantId}/image`, {
      method: 'DELETE'
    })
    if (current.value) {
      current.value.variants = current.value.variants.map(v =>
        v.id === variantId ? { ...v, imageUrl: null, imagePublicId: null } : v
      )
    }
    return res
  }

  async function addVariant(productId: number, data: any) {
    return await api(`/products/${productId}/variants`, {
      method: 'POST',
      body: data
    })
  }

  async function updateVariant(variantId: number, data: any) {
    return await api(`/products/variants/${variantId}`, {
      method: 'PATCH',
      body: data
    })
  }

  async function deleteVariant(variantId: number) {
    return await api(`/products/variants/${variantId}`, { method: 'DELETE' })
  }

  function changePage(p: number) {
    page.value = p
    fetchAll()
  }

  function resetFilter() {
    filter.value = {
      search: '',
      categoryId: '',
      brand: '',
      isActive: '',
      sortBy: ''
    }
    page.value = 1
    fetchAll()
  }

  return {
    items,
    current,
    loading,
    total,
    page,
    limit,
    totalPages,
    filter,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    addVariant,
    updateVariant,
    deleteVariant,
    changePage,
    resetFilter,
    setMainImage,
    setVariantImage,
    removeVariantImage
  }
})
