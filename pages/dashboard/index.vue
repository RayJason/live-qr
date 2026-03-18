<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { QrCode as QrIcon, AlertTriangle } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  middleware: 'auth'
})

const { user } = useUserSession()
const { t } = useI18n()

useSeoMeta({
  title: () => t('dashboard.pageTitle'),
})

const { data: products, pending, refresh, error } = useFetch('/api/products')

const handleProductCreated = () => {
  refresh()
}

const statusLabel = (status: string) => {
  return status === 'LOST' ? t('status.lostShort') : t('status.active')
}
</script>

<template>
  <div class="container py-10">
    <div class="flex items-center justify-between space-y-2 mb-8">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">{{ t('dashboard.pageTitle') }}</h2>
        <p v-if="user?.name" class="text-muted-foreground">
          {{ t('dashboard.welcomeBack', { name: user.name }) }}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <ProductCreateDialog @product-created="handleProductCreated" />
      </div>
    </div>

    <div v-if="pending" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i" class="flex flex-col">
        <CardHeader>
          <div class="flex justify-between items-start">
            <Skeleton class="h-6 w-32" />
            <Skeleton class="h-5 w-16" />
          </div>
          <div class="space-y-2 mt-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        </CardHeader>
        <CardContent class="flex-1">
          <div class="space-y-2">
            <div class="flex items-center mt-2">
              <Skeleton class="h-4 w-4 mr-2" />
              <Skeleton class="h-3 w-24" />
            </div>
            <Skeleton class="h-3 w-20 mt-2" />
          </div>
        </CardContent>
        <CardFooter class="flex justify-end border-t pt-4">
          <Skeleton class="h-9 w-20" />
        </CardFooter>
      </Card>
    </div>

    <div v-else-if="error" class="mb-8">
      <Alert variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>{{ t('dashboard.loadingErrorTitle') }}</AlertTitle>
        <AlertDescription>
          {{ t('dashboard.loadingProductsError', { message: error.message }) }}
        </AlertDescription>
      </Alert>
    </div>

    <div v-else-if="products && products.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="product in products" :key="product.id" class="flex flex-col">
        <CardHeader>
          <div class="flex justify-between items-start">
            <CardTitle class="truncate pr-4">{{ product.name }}</CardTitle>
            <Badge :variant="product.status === 'LOST' ? 'destructive' : 'secondary'">
              {{ statusLabel(product.status) }}
            </Badge>
          </div>
          <CardDescription class="line-clamp-2">
            {{ product.description || t('dashboard.noDescription') }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1">
          <div class="text-sm text-muted-foreground">
            <div class="flex items-center mt-2">
              <QrIcon class="mr-2 h-4 w-4" />
              <span class="text-xs truncate">ID: {{ product.id }}</span>
            </div>
            <div v-if="product._count?.reports" class="mt-2 text-xs font-semibold text-orange-500">
              {{ t('dashboard.reportsCount', { count: product._count.reports }) }}
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" as-child>
            <NuxtLink :to="`/dashboard/products/${product.id}`">
              {{ t('dashboard.details') }}
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-else class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>{{ t('dashboard.yourProducts') }}</CardTitle>
          <CardDescription>
            {{ t('dashboard.emptyDescription') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div class="bg-muted p-4 rounded-full mb-4">
              <QrIcon class="h-8 w-8 text-muted-foreground" />
            </div>
            <p class="mb-4">{{ t('dashboard.emptyCta') }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
