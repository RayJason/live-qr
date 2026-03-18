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

const { t } = useI18n()
const open = defineModel<boolean>('open', { default: false })
const isLoading = ref(false)
const pending = ref(false)
const profile = ref<{ id: string; name: string; email: string; phone: string | null; image: string | null; feishuWebhookUrl: string | null } | null>(null)

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, t('validation.profileNameRequired')).max(50, t('validation.profileNameMax')),
  phone: z.string().max(20, t('validation.phoneMax')).optional(),
  feishuWebhookUrl: z.string().url(t('validation.invalidUrl')).optional().or(z.literal('')),
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
    toast.error(t('profile.loadError'))
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
            feishuWebhookUrl: profile.value.feishuWebhookUrl || '',
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
        
        toast.success(t('profile.saveSuccess'))
        open.value = false
    } catch (e) {
        toast.error(t('profile.saveError'))
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
          {{ t('header.profileSettings') }}
        </Button>
      </slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('profile.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('profile.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="pending" class="flex justify-center py-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      
      <form v-else @submit="onSubmit" class="space-y-4 py-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>{{ t('profile.nameLabel') }}</FormLabel>
            <FormControl>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input class="pl-10" :placeholder="t('profile.namePlaceholder')" v-bind="componentField" />
              </div>
            </FormControl>
            <FormDescription>
              {{ t('profile.nameDescription') }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem>
            <FormLabel>{{ t('profile.phoneLabel') }}</FormLabel>
            <FormControl>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input class="pl-10" :placeholder="t('profile.phonePlaceholder')" v-bind="componentField" />
              </div>
            </FormControl>
            <FormDescription>
              {{ t('profile.phoneDescription') }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
          <FormItem>
            <FormLabel>{{ t('profile.webhookLabel') }}</FormLabel>
            <FormControl>
              <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center">
                    <!-- Simple icon placeholder or use Link icon -->
                    <span class="text-xs font-bold text-muted-foreground">F</span>
                </div>
                <Input class="pl-10" :placeholder="t('profile.webhookPlaceholder')" v-bind="componentField" />
              </div>
            </FormControl>
            <FormDescription>
              {{ t('profile.webhookDescription') }}
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="p-3 border rounded-lg bg-muted/50">
          <div class="flex items-center gap-3">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <div class="flex-1">
              <div class="text-sm font-medium">{{ t('profile.emailLabel') }}</div>
              <div class="text-sm text-muted-foreground">{{ profile?.email }}</div>
            </div>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">
             {{ t('profile.emailManagedByGoogle') }}
          </p>
        </div>

        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? t('profile.submitting') : t('profile.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
