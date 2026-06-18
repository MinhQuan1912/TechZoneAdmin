// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@pinia/nuxt", "@vueuse/nuxt"],
  devtools: {
    enabled: true,
  },
  app: {
    head: {
      title: "Admin",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: "https://merry-spontaneity-production-667a.up.railway.app/api",
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-01-15",
  typescript: { strict: false },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
