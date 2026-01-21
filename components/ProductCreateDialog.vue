<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'

const emit = defineEmits(['product-created'])

const isOpen = ref(false)
const isLoading = ref(false)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  contactInfo: z.string().optional().describe('Phone number or email for finder to contact you'),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    isLoading.value = true
    const { data, error } = await useFetch('/api/products', {
      method: 'POST',
      body: values,
    })

    if (error.value) {
      toast.error('Failed to create product')
      return
    }

    toast.success('Product created successfully')
    isOpen.value = false
    emit('product-created', data.value)
    form.resetForm()
  } catch (err) {
    toast.error('An error occurred')
    console.error(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        Create New Product
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Product</DialogTitle>
        <DialogDescription>
          Add a new item you want to protect.
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Snowboard, Camera, Keys..." v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                 <Textarea placeholder="Black Burton snowboard..." v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactInfo">
             <FormItem>
               <FormLabel>Default Contact Info (Optional)</FormLabel>
               <FormControl>
                 <Input type="text" placeholder="+1 555-0199" v-bind="componentField" />
               </FormControl>
               <FormMessage />
             </FormItem>
           </FormField>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Creating...' : 'Create Product' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
