<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { toast } from 'vue-sonner'
import { Loader2, User, Phone, Mail, Settings } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  showTrigger?: boolean
}>(), {
  showTrigger: true
})

const emit = defineEmits<{
  saved: [name: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const pending = ref(false)
const profile = ref<{ id: string; name: string; email: string; phone: string | null; image: string | null } | null>(null)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Please enter your name').max(50),
  phone: z.string().max(20).optional(),
}))

const form = useForm({
  validationSchema: formSchema,
})

// Load profile when dialog opens
const loadProfile = async () => {
  if (pending.value || profile.value) return
  pending.value = true
  try {
    profile.value = await $fetch<typeof profile.value>('/api/profile')
  } catch (e) {
    toast.error('Failed to load profile')
  } finally {
    pending.value = false
  }
}

watch(open, async (isOpen) => {
  if (isOpen) {
    await loadProfile()
  }
})

// Populate form when data loads
watchEffect(() => {
    if (profile.value) {
        form.setValues({
            name: profile.value.name || '',
            phone: profile.value.phone || '',
        })
    }
})

const onSubmit = form.handleSubmit(async (values) => {
    isLoading.value = true
    try {
        const updated = await $fetch<NonNullable<typeof profile.value>>('/api/profile', {
            method: 'PUT',
            body: values
        })
        
        // Update local profile
        profile.value = updated
        
        // Emit event to notify parent to update session
        emit('saved', values.name)
        
        toast.success('Settings saved')
        open.value = false
    } catch (e) {
        toast.error('Failed to save, please try again')
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger v-if="showTrigger" as-child>
      <slot>
        <Button variant="ghost" size="sm">
          <Settings class="mr-2 h-4 w-4" />
          Profile Settings
        </Button>
      </slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogDescription>
          Set your default contact information for lost items.
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="pending" class="flex justify-center py-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      
      <form v-else @submit="onSubmit" class="space-y-4 py-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input class="pl-10" placeholder="Your name" v-bind="componentField" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input class="pl-10" placeholder="Your contact phone" v-bind="componentField" />
              </div>
            </FormControl>
            <FormDescription>
              Default contact for lost items
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="p-3 border rounded-lg bg-muted/50">
          <div class="flex items-center gap-3">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <div>
              <div class="text-sm font-medium">Email</div>
              <div class="text-sm text-muted-foreground">{{ profile?.email }}</div>
            </div>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">
            Email is from your Google account and cannot be changed
          </p>
        </div>

        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
