import { defineStore } from "pinia";
import type { Category } from "~/types";

export const useCategoryStore = defineStore("categories", () => {
  const { api, upload, uploadPatch } = useApi();
  const toast = useToast();

  const items = ref<Category[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const res = await api<Category[]>("/categories");
      items.value = res;
    } finally {
      loading.value = false;
    }
  }

  async function create(name: string, imageFile?: File) {
    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    const res = await upload<Category>("/categories", formData);
    items.value.unshift(res);
    toast.add({
      title: "Thành công",
      description: "Đã tạo danh mục",
      color: "success",
    });
    return res;
  }

  async function update(id: number, name: string, imageFile?: File) {
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (imageFile) formData.append("image", imageFile);

    const res = await uploadPatch<Category>(`/categories/${id}`, formData);
    const idx = items.value.findIndex((c) => c.id === id);
    if (idx !== -1) items.value[idx] = res;
    toast.add({
      title: "Thành công",
      description: "Đã cập nhật danh mục",
      color: "success",
    });
    return res;
  }

  async function remove(id: number, moveProducts = false) {
    await api(`/categories/${id}`, {
      method: "DELETE",
      query: moveProducts ? { moveProducts: "true" } : {},
    });
    items.value = items.value.filter((c) => c.id !== id);
    toast.add({
      title: "Thành công",
      description: "Đã xóa danh mục",
      color: "success",
    });
  }

  async function removeImage(id: number) {
    await api(`/categories/${id}/image`, { method: "DELETE" });
    const idx = items.value.findIndex((c) => c.id === id);
    if (idx !== -1) {
      items.value[idx] = {
        ...items.value[idx],
        imageUrl: null,
        imagePublicId: null,
      };
    }
  }
  return { items, loading, fetchAll, create, update, remove, removeImage };
});
