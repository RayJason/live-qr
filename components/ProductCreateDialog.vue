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
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'
import { qrPresets, productTypeLabels, type ProductTypeKey } from '@/lib/qr-presets'

const emit = defineEmits(['product-created'])
const { t } = useI18n()

const isOpen = ref(false)
const isLoading = ref(false)
const selectedType = ref<ProductTypeKey>('STICKER')

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, t('validation.productNameMin')).max(50, t('validation.productNameMax')),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    feishuWebhookUrl: z.string().optional(),
    type: z.enum(['STICKER', 'KEYCHAIN', 'LUGGAGE_TAG', 'SNOWBOARD_STICKER', 'BOARDING_PASS']).default('STICKER'),
    qrDotsColor: z.string().optional(),
    qrCornerColor: z.string().optional(),
    qrBackgroundColor: z.string().optional(),
    qrLogoUrl: z.string().optional(),
    qrCustomText: z.string().optional(),
  }),
)

const { data: userProfile } = useLazyFetch('/api/profile')

const form = useForm({
  validationSchema: formSchema,
})

watch(isOpen, (open) => {
  if (open && userProfile.value) {
    selectedType.value = 'STICKER'
    form.setValues({
      type: 'STICKER',
      contactEmail: userProfile.value.email || '',
      contactPhone: userProfile.value.phone || '',
      feishuWebhookUrl: userProfile.value.feishuWebhookUrl || '',
      qrDotsColor: qrPresets.STICKER.dotsColor,
      qrCornerColor: qrPresets.STICKER.cornerColor,
      qrBackgroundColor: qrPresets.STICKER.backgroundColor,
      qrLogoUrl: '',
      qrCustomText: '',
    })
  }
})

function selectType(type: ProductTypeKey) {
  selectedType.value = type
  const p = qrPresets[type]
  form.setFieldValue('type', type)
  form.setFieldValue('qrDotsColor', p.dotsColor)
  form.setFieldValue('qrCornerColor', p.cornerColor)
  form.setFieldValue('qrBackgroundColor', p.backgroundColor)
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    isLoading.value = true
    const { data, error } = await useFetch('/api/products', {
      method: 'POST',
      body: values,
    })

    if (error.value) {
      toast.error(t('productDialog.createError'))
      return
    }

    toast.success(t('productDialog.createSuccess'))
    isOpen.value = false
    emit('product-created', data.value)
    form.resetForm()
  } catch (err) {
    toast.error(t('productDialog.unexpectedError'))
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
        {{ t('productDialog.trigger') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ t('productDialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('productDialog.description') }}
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <!-- Type Selector -->
          <div>
            <Label class="text-sm font-medium mb-2 block">品类</Label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="(preset, key) in qrPresets"
                :key="key"
                type="button"
                class="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all"
                :class="selectedType === key
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/30'"
                @click="selectType(key as ProductTypeKey)"
              >
                <span class="text-lg">{{ preset.icon }}</span>
                <span class="text-[10px] font-medium leading-tight text-center">{{ preset.label }}</span>
              </button>
            </div>
          </div>

          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>{{ t('productDialog.nameLabel') }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  :placeholder="t('productDialog.namePlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>{{ t('productDialog.descriptionLabel') }}</FormLabel>
              <FormControl>
                <Textarea
                  :placeholder="t('productDialog.descriptionPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactEmail">
            <FormItem>
              <FormLabel>{{ t('productDialog.emailLabel') }}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  :placeholder="t('productDialog.emailPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactPhone">
            <FormItem>
              <FormLabel>{{ t('productDialog.phoneLabel') }}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  :placeholder="t('productDialog.phonePlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
            <FormItem>
              <FormLabel>{{ t('productDialog.webhookLabel') }}</FormLabel>
              <FormControl>
                <Input
                  :placeholder="t('productDialog.webhookPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="qrCustomText">
            <FormItem>
              <FormLabel>个性签名（显示在二维码下方）</FormLabel>
              <FormControl>
                <Input
                  :placeholder="'如：Ray 的滑雪板 🏂'"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            {{ isLoading ? t('productDialog.submitting') : t('productDialog.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
