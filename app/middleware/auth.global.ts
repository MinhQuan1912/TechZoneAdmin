import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const publicRoutes = ["/login"];
  if (publicRoutes.includes(to.path)) return;
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
  if (!authStore.isAdmin) {
    authStore.logout();
    return navigateTo("/login");
  }
});
