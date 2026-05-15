<template>
   <div class="flex h-screen overflow-hidden bg-gray-50">
      <CommonAppSidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
         <LayoutHeader />
         <div class="flex-1 overflow-y-auto p-6">
            <slot />
         </div>
      </div>
   </div>
</template>
