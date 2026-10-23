<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "vue-sonner";
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-vue-next";
import { Skeleton } from "@/components/ui/skeleton";
import QrCustomizer from '@/components/dashboard/QrCustomizer.vue'
import RecentReports from '@/components/dashboard/RecentReports.vue'
import { defaultQrDesign, qrColorSchema, qrDesignSchema, resolveQrDesign, type QrCustomization } from '@/lib/qr-design'
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
} from "@/components/ui/alert-dialog";

definePageMeta({
  middleware: "auth",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const productId = route.params.id as string;

const {
  data: product,
  pending,
  refresh,
  error,
} = useFetch(`/api/products/${productId}`, {
  key: `product-${productId}`,
  deep: true,
});

useSeoMeta({
  title: () =>
    product.value?.name
      ? `${product.value.name} - ${t("dashboard.productDetails")}`
      : t("dashboard.productDetails"),
  description: () => t("dashboard.productDetailsDesc"),
});

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(2, t("validation.productNameMin"))
      .max(50, t("validation.productNameMax")),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    lostMessage: z.string().optional(),
    feishuWebhookUrl: z.string().optional(),
    status: z.boolean().default(false),
    showContactWhenSafe: z.boolean().default(false),
    type: z.enum(['STICKER', 'KEYCHAIN', 'LUGGAGE_TAG', 'SNOWBOARD_STICKER', 'BOARDING_PASS']).optional(),
    qrDotsColor: qrColorSchema.or(z.literal('')).optional(),
    qrCornerColor: qrColorSchema.or(z.literal('')).optional(),
    qrBackgroundColor: qrColorSchema.or(z.literal('')).optional(),
    qrLogoUrl: z.string().optional(),
    qrCustomText: z.string().optional(),
    qrStyle: qrDesignSchema.optional(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

watch(
  product,
  (newProduct) => {
    if (newProduct) {
      form.setValues({
        name: newProduct.name,
        description: newProduct.description ?? "",
        contactEmail: newProduct.contactEmail ?? "",
        contactPhone: newProduct.contactPhone ?? "",
        lostMessage: newProduct.lostMessage ?? "",
        feishuWebhookUrl: newProduct.feishuWebhookUrl ?? "",
        status: newProduct.status === "LOST",
        showContactWhenSafe: newProduct.showContactWhenSafe ?? false,
        type: newProduct.type ?? "STICKER",
        qrDotsColor: newProduct.qrDotsColor ?? "",
        qrCornerColor: newProduct.qrCornerColor ?? "",
        qrBackgroundColor: newProduct.qrBackgroundColor ?? "",
        qrLogoUrl: newProduct.qrLogoUrl ?? "",
        qrCustomText: newProduct.qrCustomText ?? "",
        qrStyle: resolveQrDesign(newProduct.qrStyle, newProduct.type),
      });
    }
  },
  { immediate: true },
);

const qrCustomization = computed<QrCustomization>({
  get: () => ({
    type: form.values.type || 'STICKER',
    dotsColor: form.values.qrDotsColor || '',
    cornerColor: form.values.qrCornerColor || '',
    backgroundColor: form.values.qrBackgroundColor || '',
    logoUrl: form.values.qrLogoUrl || '',
    customText: form.values.qrCustomText || '',
    design: { ...defaultQrDesign(form.values.type || 'STICKER'), ...form.values.qrStyle },
  }),
  set: (value) => {
    form.setFieldValue('type', value.type)
    form.setFieldValue('qrDotsColor', value.dotsColor)
    form.setFieldValue('qrCornerColor', value.cornerColor)
    form.setFieldValue('qrBackgroundColor', value.backgroundColor)
    form.setFieldValue('qrLogoUrl', value.logoUrl)
    form.setFieldValue('qrCustomText', value.customText)
    form.setFieldValue('qrStyle', value.design)
  },
})

const isLost = computed(() => form.values.status);
const isSaving = ref(false);

const onSubmit = form.handleSubmit(async (values) => {
  isSaving.value = true;
  try {
    const payload = {
      ...values,
      status: (values.status ? "LOST" : "NORMAL") as "LOST" | "NORMAL",
    };

    if (product.value) {
      product.value.name = values.name;
      product.value.description = values.description || null;
      product.value.contactEmail = values.contactEmail || null;
      product.value.contactPhone = values.contactPhone || null;
      product.value.lostMessage = values.lostMessage || null;
      product.value.feishuWebhookUrl = values.feishuWebhookUrl || null;
      product.value.status = payload.status;
      product.value.showContactWhenSafe = values.showContactWhenSafe;
    }

    await $fetch(`/api/products/${productId}`, {
      method: "PATCH",
      body: payload,
    });

    try {
      await refreshNuxtData(`public-product-${productId}`);
    } catch {
      // Public page refresh is best effort.
    }

    toast.success(t("dashboard.saveSuccess"));
  } catch (e) {
    toast.error(t("dashboard.updateError"));
    refresh();
  } finally {
    isSaving.value = false;
  }
});

const removeReport = (reportId: string) => {
  if (product.value) {
    product.value.reports = product.value.reports.filter(report => report.id !== reportId)
  }
}

const deleteProduct = async () => {
  try {
    await $fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });
    toast.success(t("dashboard.deleteSuccess"));
    router.push("/dashboard");
  } catch (e) {
    toast.error(t("dashboard.deleteError"));
  }
};
</script>

<template>
  <div class="container py-6 max-w-7xl mx-auto space-y-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-foreground transition-colors"
          @click="router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>{{ t('action.back') }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="min-w-0 break-words text-3xl font-bold tracking-tight">
            {{ product?.name || t('dashboard.productDetails') }}
          </h1>
          <div
            v-if="product"
            :class="[
              'px-2.5 py-0.5 shrink-0 rounded-full text-xs font-semibold uppercase tracking-wide border',
              isLost
                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            ]"
          >
            {{ isLost ? t('status.lostShort') : t('status.active') }}
          </div>
        </div>
        <p class="text-muted-foreground max-w-2xl">
          {{ t('dashboard.productDetailsDesc') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" as-child>
          <a :href="`/s/${productId}`" target="_blank" class="flex items-center gap-2">
            <ExternalLink class="h-4 w-4" />
            {{ t('dashboard.viewPublicPage') }}
          </a>
        </Button>
      </div>
    </div>

    <div v-if="pending" class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton class="h-8 w-48 mb-2" />
            <Skeleton class="h-4 w-full max-w-sm" />
          </CardHeader>
          <CardContent class="space-y-6">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent class="h-48" />
        </Card>
      </div>
      <div class="space-y-6">
        <Skeleton class="h-[400px] w-full rounded-xl" />
        <Skeleton class="h-[200px] w-full rounded-xl" />
      </div>
    </div>

    <div
      v-else-if="error"
      class="p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5 text-destructive"
    >
      <p class="font-medium">{{ t('dashboard.loadProductErrorTitle') }}</p>
      <p class="text-sm opacity-80 mt-1">{{ error.message }}</p>
      <Button
        variant="outline"
        class="mt-4 border-destructive/30 hover:bg-destructive/10"
        @click="refresh"
      >
        {{ t('action.retry') }}
      </Button>
    </div>

    <form v-else @submit="onSubmit" class="grid gap-6 lg:grid-cols-3 items-start">
      <div class="lg:col-span-2 min-w-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('dashboard.basicInfo') }}</CardTitle>
            <CardDescription>{{ t('dashboard.basicInfoDesc') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>
                  {{ t('dashboard.itemName') }} <span class="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input v-bind="componentField" :placeholder="t('placeholder.itemName')" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="description">
              <FormItem>
                <FormLabel>{{ t('dashboard.description') }}</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    class="resize-y min-h-[100px]"
                    :placeholder="t('placeholder.itemDesc')"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </CardContent>
        </Card>

        <Card
          class="overflow-hidden transition-all duration-300"
          :class="isLost ? 'border-red-200 dark:border-red-900/50 shadow-sm' : ''"
        >
          <CardHeader :class="isLost ? 'bg-red-50/50 dark:bg-red-900/10' : ''">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <CardTitle class="flex items-center gap-2">
                  {{ t('dashboard.deviceStatus') }}
                </CardTitle>
                <CardDescription>{{ t('dashboard.deviceStatusDesc') }}</CardDescription>
              </div>
              <FormField v-slot="{ componentField }" name="status">
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm font-medium"
                    :class="isLost ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'"
                  >
                    {{ isLost ? t('status.lostModeOn') : t('status.normalMode') }}
                  </span>
                  <Switch
                    :model-value="!!componentField.modelValue"
                    @update:model-value="componentField['onUpdate:modelValue']"
                    class="data-[state=checked]:bg-red-600"
                  />
                </div>
              </FormField>
            </div>
          </CardHeader>

          <CardContent class="p-0">
            <div
              v-if="isLost"
              class="p-6 space-y-6 bg-red-50/20 animate-in slide-in-from-top-2 duration-300"
            >
              <div class="grid gap-4 md:grid-cols-2">
                <FormField v-slot="{ componentField }" name="contactEmail">
                  <FormItem>
                    <FormLabel>{{ t('dashboard.contactEmail') }}</FormLabel>
                    <FormControl>
                      <Input
                        v-bind="componentField"
                        class="bg-background"
                        :placeholder="t('placeholder.email')"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="contactPhone">
                  <FormItem>
                    <FormLabel>{{ t('dashboard.contactPhone') }}</FormLabel>
                    <FormControl>
                      <Input
                        v-bind="componentField"
                        class="bg-background"
                        :placeholder="t('placeholder.phone')"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
              <FormField v-slot="{ componentField }" name="lostMessage">
                <FormItem>
                  <FormLabel>{{ t('dashboard.lostMessage') }}</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      class="bg-background"
                      :placeholder="t('placeholder.lostMessage')"
                    />
                  </FormControl>
                  <FormDescription>{{ t('dashboard.lostMessageHelp') }}</FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <div
              v-else
              class="px-6 py-4 bg-muted/20 text-sm text-muted-foreground flex items-center justify-center italic"
            >
              {{ t('dashboard.normalModeDesc') }}
            </div>

            <div class="border-t" />

            <div class="p-6 flex items-center justify-between gap-4">
              <div class="space-y-0.5">
                <Label class="text-base">{{ t('dashboard.showContactSafe') }}</Label>
                <p class="text-sm text-muted-foreground">
                  {{ t('dashboard.showContactSafeDesc') }}
                </p>
              </div>
              <FormField v-slot="{ componentField }" name="showContactWhenSafe">
                <Switch
                  :model-value="!!componentField.modelValue"
                  @update:model-value="componentField['onUpdate:modelValue']"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{{ t('dashboard.integrations') }}</CardTitle>
            <CardDescription>{{ t('dashboard.integrationsDesc') }}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
              <FormItem>
                <FormLabel>{{ t('dashboard.feishuWebhook') }}</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    :placeholder="t('placeholder.feishuWebhook')"
                  />
                </FormControl>
                <FormDescription>
                  {{ t('dashboard.feishuWebhookDesc') }}
                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </CardContent>
        </Card>


      </div>

      <div class="min-w-0 space-y-6">

        <RecentReports
          :reports="product?.reports ?? []"
          :product-id="productId"
          @deleted="removeReport"
        />

        <Card class="border-destructive/30 shadow-none">
          <CardHeader class="pb-3">
            <CardTitle class="text-base text-destructive flex items-center gap-2">
              <Trash2 class="h-4 w-4" />
              {{ t('dashboard.dangerZone') }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground mb-4 leading-relaxed">
              {{ t('dashboard.deleteProductWarning') }}
            </p>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive" size="sm" class="w-full">
                  {{ t('action.deleteProduct') }}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{{ t('dashboard.deleteConfirmTitle') }}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {{ t('dashboard.deleteConfirmDesc') }}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{{ t('action.cancel') }}</AlertDialogCancel>
                  <AlertDialogAction
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    @click="deleteProduct"
                  >
                    {{ t('action.delete') }}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
      <Card class="min-w-0 lg:col-span-3">
        <CardHeader class="pb-3">
          <CardTitle class="text-lg">{{ t('customizer.title') }}</CardTitle>
          <CardDescription>{{ t('customizer.subtitle') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <QrCustomizer v-model="qrCustomization" :product-id="productId" />
        </CardContent>
      </Card>
      <div class="flex items-center justify-end gap-4 lg:col-span-3">
        <Button type="button" variant="outline" :title="t('action.cancel')" @click="router.back()" :disabled="isSaving">
          {{ t('action.cancel') }}
        </Button>
        <Button type="submit" :title="t('action.saveChanges')" :disabled="isSaving" class="min-w-[120px]">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ isSaving ? t('action.saving') : t('action.saveChanges') }}
        </Button>
      </div>
    </form>
  </div>
</template>
