<script setup lang="ts">
import { PlusIcon, QrCodeIcon, Loader2Icon } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// TODO: Replace with real data fetching
// const { data: products, pending } = await useFetch('/api/products')
const pending = ref(false);
const products = ref([]);
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="text-lg font-semibold md:text-2xl">Your Products</h1>
    <NuxtLink to="/dashboard/products/new">
      <UiButton>
        <PlusIcon class="mr-2 h-4 w-4" />
        Add Product
      </UiButton>
    </NuxtLink>
  </div>

  <div v-if="pending" class="flex flex-col items-center justify-center py-12">
    <Loader2Icon class="h-8 w-8 animate-spin text-primary" />
  </div>

  <div
    v-else-if="products && products.length > 0"
    class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
  >
    <!-- Product cards will go here -->
    <UiCard v-for="product in products" :key="product.id">
      <UiCardHeader
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <UiCardTitle class="text-sm font-medium">
          {{ product.name }}
        </UiCardTitle>
        <QrCodeIcon class="h-4 w-4 text-muted-foreground" />
      </UiCardHeader>
      <UiCardContent>
        <div class="text-2xl font-bold">{{ product.status }}</div>
        <p class="text-xs text-muted-foreground">
          Created {{ new Date(product.createdAt).toLocaleDateString() }}
        </p>
      </UiCardContent>
    </UiCard>
  </div>

  <div
    v-else
    class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50"
  >
    <div
      class="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
    >
      <QrCodeIcon class="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 class="mt-4 text-lg font-semibold">No products yet</h3>
    <p class="mb-4 text-sm text-muted-foreground">
      Create your first QR code to start protecting your items.
    </p>
    <NuxtLink to="/dashboard/products/new">
      <UiButton>
        <PlusIcon class="mr-2 h-4 w-4" />
        Add Product
      </UiButton>
    </NuxtLink>
  </div>
</template>
