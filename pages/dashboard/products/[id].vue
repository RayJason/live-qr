<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { toast } from 'vue-sonner'
import { Loader2, ArrowLeft, Printer, Trash2 } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

definePageMeta({
  middleware: 'sidebase-auth'
})

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string

const { data: product, pending, refresh, error } = await useFetch(`/api/products/${productId}`)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  contactInfo: z.string().optional(),
  lostMessage: z.string().optional(),
  feishuWebhookUrl: z.string().optional().describe('URL to receive notifications in Feishu'),
  status: z.boolean().default(false).describe('True if Lost')
}))

const form = useForm({
  validationSchema: formSchema,
})

// Populate form when data loads
watchEffect(() => {
    if (product.value) {
        form.setValues({
            name: product.value.name,
            description: product.value.description || '',
            contactInfo: product.value.contactInfo || '',
            lostMessage: product.value.lostMessage || '',
            feishuWebhookUrl: product.value.feishuWebhookUrl || '',
            status: product.value.status === 'LOST'
        })
    }
})

const isLost = computed(() => form.values.status)

const onSubmit = form.handleSubmit(async (values) => {
    try {
        const payload = {
            ...values,
            status: values.status ? 'LOST' : 'NORMAL'
        }
        
        await $fetch(`/api/products/${productId}`, {
            method: 'PUT',
            body: payload
        })
        
        toast.success('Product updated successfully')
        refresh()
    } catch (e) {
        toast.error('Failed to update product')
    }
})

const deleteProduct = async () => {
    try {
        await $fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        })
        toast.success('Product deleted')
        router.push('/dashboard')
    } catch (e) {
        toast.error('Failed to delete product')
    }
}

const printQr = () => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (printWindow) {
        const canvas = document.querySelector('canvas')
        const imgUrl = canvas?.toDataURL()
        printWindow.document.write(`<img src="${imgUrl}" style="width: 100%; max-width: 400px;" />`)
        printWindow.document.write('<script>window.print();window.close();<\/script>')
        printWindow.document.close()
    }
}

// Public URL
const publicUrl = computed(() => {
    if (import.meta.client) {
        return `${window.location.origin}/s/${productId}`
    }
    return ''
})
</script>

<template>
  <div class="container py-10 max-w-4xl">
    <div class="mb-6">
        <Button variant="ghost" class="pl-0" @click="router.back()">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
    </div>
    
    <div v-if="pending" class="flex justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
    
    <div v-else-if="error">
        <div class="text-destructive">Error loading product: {{ error.message }}</div>
    </div>
    
    <div v-else class="grid gap-6 md:grid-cols-2">
        <!-- Settings Column -->
        <div class="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Product Settings</CardTitle>
                    <CardDescription>Update details and privacy settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form @submit="onSubmit" class="space-y-4">
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="description">
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        
                        <div class="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 space-y-4">
                            <div class="flex items-center justify-between">
                                <FormLabel class="text-base">Lost Mode</FormLabel>
                                <FormField v-slot="{ value, handleChange }" name="status">
                                    <Switch :checked="value" @update:checked="handleChange" />
                                </FormField>
                            </div>
                            <p class="text-sm text-muted-foreground">
                                When enabled, scanning the QR code will show your contact info and alert that the item is lost.
                            </p>
                            
                            <template v-if="isLost">
                                <FormField v-slot="{ componentField }" name="lostMessage">
                                    <FormItem>
                                        <FormLabel>Lost Message</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Please return to..." v-bind="componentField" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </FormField>
                                <FormField v-slot="{ componentField }" name="contactInfo">
                                    <FormItem>
                                        <FormLabel>Emergency Contact</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phone or Email" v-bind="componentField" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </FormField>
                            </template>
                        </div>
                        
                        <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
                            <FormItem>
                                <FormLabel>Feishu Webhook URL (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://open.feishu.cn/..." v-bind="componentField" />
                                </FormControl>
                                <FormDescription>
                                    Receive notifications in Lark/Feishu when someone scans or reports this item.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <div class="flex justify-end pt-4">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <Card class="border-destructive">
                <CardHeader>
                    <CardTitle class="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                     <p class="text-sm text-muted-foreground mb-4">
                        Deleting this product will permanently remove it and disable the QR code.
                     </p>
                     <AlertDialog>
                        <AlertDialogTrigger as-child>
                             <Button variant="destructive">
                                <Trash2 class="mr-2 h-4 w-4" />
                                Delete Product
                             </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction @click="deleteProduct" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                </CardContent>
            </Card>
        </div>
        
        <!-- QR & Reports Column -->
        <div class="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>QR Code</CardTitle>
                    <CardDescription>Print this and attach it to your item.</CardDescription>
                </CardHeader>
                <CardContent class="flex flex-col items-center">
                    <div class="bg-white p-4 rounded-lg border shadow-sm">
                        <QrcodeVue :value="publicUrl" :size="200" level="H" />
                    </div>
                    <div class="mt-4 text-center">
                        <p class="text-sm font-medium">{{ product.name }}</p>
                        <p class="text-xs text-muted-foreground mt-1">{{ publicUrl }}</p>
                    </div>
                </CardContent>
                <CardFooter class="justify-center">
                    <Button variant="outline" @click="printQr">
                        <Printer class="mr-2 h-4 w-4" />
                        Print QR
                    </Button>
                </CardFooter>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div v-if="product.reports && product.reports.length > 0" class="space-y-4">
                         <div v-for="report in product.reports" :key="report.id" class="border-b pb-4 last:border-0">
                             <div class="flex justify-between">
                                 <span class="font-medium text-sm">{{ report.finderContact || 'Anonymous' }}</span>
                                 <span class="text-xs text-muted-foreground">{{ new Date(report.createdAt).toLocaleDateString() }}</span>
                             </div>
                             <p class="text-sm mt-1 text-muted-foreground">{{ report.message }}</p>
                         </div>
                    </div>
                    <div v-else class="text-sm text-muted-foreground text-center py-4">
                        No reports yet.
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  </div>
</template>
