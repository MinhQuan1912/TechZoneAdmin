import { defineStore } from "pinia";
import type { Coupon } from "~/types";

export const useCouponStore = defineStore("coupons", () => {
  const { api } = useApi();
  const toast = useToast();

  const items = ref<Coupon[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const totalPages = ref(0);

  async function fetchAll() {
    loading.value = true;
    try {
      const res = await api<any>("/coupons", {
        query: { page: page.value, limit: limit.value },
      });
      items.value = res.coupons;
      total.value = res.total;
      totalPages.value = res.totalPages;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: any) {
    const res = await api<Coupon>("/coupons", { method: "POST", body: data });
    items.value.unshift(res);
    toast.add({
      title: "Thành công",
      description: "Đã tạo mã giảm giá",
      color: "success",
    });
    return res;
  }

  async function update(id: number, data: any) {
    const res = await api<Coupon>(`/coupons/${id}`, {
      method: "PATCH",
      body: data,
    });
    const idx = items.value.findIndex((c) => c.id === id);
    if (idx !== -1) items.value[idx] = res;
    toast.add({
      title: "Thành công",
      description: "Đã cập nhật mã giảm giá",
      color: "success",
    });
    return res;
  }

  async function remove(id: number) {
    await api(`/coupons/${id}`, { method: "DELETE" });
    items.value = items.value.filter((c) => c.id !== id);
    toast.add({
      title: "Thành công",
      description: "Đã xóa mã giảm giá",
      color: "success",
    });
  }

  function changePage(p: number) {
    page.value = p;
    fetchAll();
  }

  return {
    items,
    loading,
    total,
    page,
    limit,
    totalPages,
    fetchAll,
    create,
    update,
    remove,
    changePage,
  };
});
