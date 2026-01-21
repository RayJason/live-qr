<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Loader2, QrCode as QrIcon, AlertTriangle } from 'lucide-vue-next'

definePageMeta({
  middleware: 'sidebase-auth'
})

const { data: session } = useAuth()
const { data: products, pending, refresh, error } = await useFetch('/api/products')

const handleProductCreated = () => {
    refresh()
}
</script>

<template>
  <div class="container py-10">
    <div class="flex items-center justify-between space-y-2 mb-8">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-muted-foreground">
          Welcome back, {{ session?.user?.name }}
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <ProductCreateDialog @product-created="handleProductCreated" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mb-8">
      <Alert variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load products: {{ error.message }}
        </AlertDescription>
      </Alert>
    </div>

    <!-- Products Grid -->
    <div v-else-if="products && products.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="product in products" :key="product.id" class="flex flex-col">
        <CardHeader>
          <div class="flex justify-between items-start">
            <CardTitle class="truncate pr-4">{{ product.name }}</CardTitle>
            <Badge :variant="product.status === 'LOST' ? 'destructive' : 'secondary'">
              {{ product.status }}
            </Badge>
          </div>
          <CardDescription class="line-clamp-2">
            {{ product.description || 'No description' }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex-1">
           <div class="text-sm text-muted-foreground">
                <div class="flex items-center mt-2">
                    <QrIcon class="mr-2 h-4 w-4" />
                    <span class="text-xs truncate">ID: {{ product.id }}</span>
                </div>
                <div v-if="product._count?.reports" class="mt-2 text-xs font-semibold text-orange-500">
                    {{ product._count.reports }} Report(s)
                </div>
           </div>
        </CardContent>
        <CardFooter class="flex justify-end gap-2 border-t pt-4">
             <Button variant="outline" size="sm" as-child>
                 <NuxtLink :to="`/dashboard/products/${product.id}`">
                    Details
                 </NuxtLink>
             </Button>
        </CardFooter>
      </Card>
    </div>
    
    <!-- Empty State -->
    <div v-else class="mt-8">
       <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
             <CardDescription>
                You haven't created any products yet.
              </CardDescription>
          </CardHeader>
          <CardContent>
             <div class="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div class="bg-muted p-4 rounded-full mb-4">
                    <QrIcon class="h-8 w-8 text-muted-foreground" />
                </div>
                <p class="mb-4">Create your first product to generate a QR code.</p>
             </div>
          </CardContent>
       </Card>
    </div>
  </div>
</template>
