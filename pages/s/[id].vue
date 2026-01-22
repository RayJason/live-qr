<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { toast } from 'vue-sonner'
import { AlertTriangle, MapPin, CheckCircle, ShieldCheck, Phone, Mail } from 'lucide-vue-next'

definePageMeta({
  auth: false
})

const route = useRoute()
const productId = route.params.id as string

const { data: product, pending, error } = await useFetch(`/api/s/${productId}`)

useSeoMeta({
  title: () => product.value?.name ? (product.value?.status === 'LOST' ? `LOST ITEM: ${product.value.name}` : `Safe Item - ${product.value.name}`) : 'Anti-Lost Item',
  description: () => product.value?.status === 'LOST' 
    ? `HELP! This item is LOST. Please help return it to the owner. ${product.value?.lostMessage || ''}`
    : `This item is protected by Anti-Lost. If found, please scan to contact owner.`,
  ogTitle: () => product.value?.name ? (product.value?.status === 'LOST' ? `LOST ITEM: ${product.value.name}` : `Safe Item - ${product.value.name}`) : 'Anti-Lost Item',
  ogDescription: () => product.value?.status === 'LOST' 
    ? `HELP! This item is LOST. Please help return it to the owner. ${product.value?.lostMessage || ''}`
    : `This item is protected by Anti-Lost. If found, please scan to contact owner.`,
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})

const showReportForm = ref(false)
const isSubmitting = ref(false)
const reportSuccess = ref(false)

const formSchema = toTypedSchema(z.object({
  finderContact: z.string().min(1, 'Please provide a way to contact you (Phone/Email)'),
  message: z.string().optional()
}))

const form = useForm({
  validationSchema: formSchema,
})

const isLost = computed(() => product.value?.status === 'LOST')

const onSubmit = form.handleSubmit(async (values) => {
    isSubmitting.value = true
    try {
        await $fetch('/api/report', {
            method: 'POST',
            body: {
                productId,
                ...values
            }
        })
        reportSuccess.value = true
        toast.success('Thank you! Report sent to the owner.')
    } catch (e) {
        toast.error('Failed to send report. Please try again.')
    } finally {
        isSubmitting.value = false
    }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
    <div v-if="pending" class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    
    <div v-else-if="error" class="max-w-md w-full text-center">
        <div class="bg-destructive/10 text-destructive p-4 rounded-lg">
            <AlertTriangle class="h-10 w-10 mx-auto mb-2" />
            <h3 class="font-bold text-lg">Product not found</h3>
             <p>This QR code seems invalid or the item was removed.</p>
        </div>
    </div>
    
    <div v-else class="max-w-md w-full space-y-6">
        <!-- LOST Mode Header -->
        <div v-if="isLost" class="bg-red-600 text-white p-6 rounded-xl shadow-lg text-center animate-pulse">
            <AlertTriangle class="h-12 w-12 mx-auto mb-2" />
            <h1 class="text-3xl font-black tracking-widest uppercase">Lost Item</h1>
            <p class="mt-2 text-red-100 font-medium">Please help return this item!</p>
        </div>
        
        <!-- SAFE Mode Header -->
        <div v-else class="text-center pb-4">
            <div class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-full inline-block mb-4">
                <ShieldCheck class="h-12 w-12" />
            </div>
            <h1 class="text-2xl font-bold">This item is protected</h1>
            <p class="text-muted-foreground mt-1">Managed by Anti-Lost QR</p>
        </div>

        <Card class="border-t-4" :class="isLost ? 'border-t-destructive shadow-2xl' : 'border-t-green-500'">
            <CardHeader class="text-center" v-if="product">
                <CardTitle class="text-xl">{{ product.name }}</CardTitle>
                <CardDescription v-if="product.description">
                    {{ product.description }}
                </CardDescription>
                
                <div v-if="isLost && product" class="mt-4 p-4 bg-muted rounded-lg text-left">
                     <p v-if="product.lostMessage" class="font-medium text-lg text-foreground mb-4 italic">
                        "{{ product.lostMessage }}"
                     </p>
                     
                     <div v-if="product.contactInfo" class="space-y-3">
                        <div class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Contact Owner</div>
                        
                        <!-- Check if it's a phone number -->
                        <a 
                            v-if="product.contactInfo.match(/^[\d\s\-+()]+$/)"
                            :href="`tel:${product.contactInfo.replace(/\s/g, '')}`"
                            class="flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Phone class="h-5 w-5" />
                            <span class="text-lg font-bold">{{ product.contactInfo }}</span>
                        </a>
                        
                        <!-- Check if it's an email -->
                        <a 
                            v-else-if="product.contactInfo.includes('@')"
                            :href="`mailto:${product.contactInfo}`"
                            class="flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Mail class="h-5 w-5" />
                            <span class="text-lg font-bold">{{ product.contactInfo }}</span>
                        </a>
                        
                        <!-- Other contact info -->
                        <div v-else class="text-xl font-bold text-primary">
                            {{ product.contactInfo }}
                        </div>
                     </div>
                </div>
            </CardHeader>
            
            <CardContent v-if="product">
                <div v-if="!showReportForm && !reportSuccess">
                    <Button 
                        size="lg" 
                        class="w-full font-bold text-lg h-12" 
                        :variant="isLost ? 'default' : 'secondary'"
                        @click="showReportForm = true"
                    >
                        <MapPin class="mr-2 h-5 w-5" />
                        I Found This Item
                    </Button>
                </div>

                <!-- Report Form -->
                <div v-if="showReportForm && !reportSuccess" class="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                     <h3 class="font-semibold text-center border-b pb-2 mb-4">Send a Message to Owner</h3>
                     
                     <form @submit="onSubmit" class="space-y-4">
                        <FormField v-slot="{ componentField }" name="finderContact">
                            <FormItem>
                                <FormLabel>Your Contact Info</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mobile number or Email" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        
                        <FormField v-slot="{ componentField }" name="message">
                            <FormItem>
                                <FormLabel>Message (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="I left it at the front desk..." v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <div class="flex gap-2 pt-2">
                             <Button type="button" variant="outline" class="flex-1" @click="showReportForm = false">
                                Cancel
                             </Button>
                             <Button type="submit" class="flex-1" :disabled="isSubmitting">
                                {{ isSubmitting ? 'Sending...' : 'Send Report' }}
                             </Button>
                        </div>
                     </form>
                </div>
                
                <!-- Success Message -->
                <div v-if="reportSuccess" class="text-center py-6 animate-in zoom-in">
                    <div class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-full inline-block mb-3">
                        <CheckCircle class="h-8 w-8" />
                    </div>
                    <h3 class="text-xl font-bold">Report Sent!</h3>
                    <p class="text-muted-foreground mt-2">
                        The owner has been notified. Thank you for your help!
                    </p>
                </div>
            </CardContent>
             <CardFooter class="justify-center text-xs text-muted-foreground border-t bg-slate-50 dark:bg-slate-900/50 rounded-b-xl py-4">
                Powered by Anti-Lost QR
            </CardFooter>
        </Card>
    </div>
  </div>
</template>
