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
import { useClipboard } from "@vueuse/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Loader2,
  ArrowLeft,
  Printer,
  Trash2,
  ExternalLink,
  Copy,
  Wand2,
  Download,
} from "lucide-vue-next";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";

definePageMeta({
  middleware: "auth",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const productId = route.params.id as string;
const { copy } = useClipboard({ legacy: true });

const {
  data: product,
  pending,
  refresh,
  error,
} = useFetch(`/api/products/${productId}`, {
  key: `product-${productId}`,
});

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    lostMessage: z.string().optional(),
    feishuWebhookUrl: z
      .string()
      .optional()
      .describe("URL to receive notifications in Feishu"),
    status: z.boolean().default(false).describe("True if Lost"),
    showContactWhenSafe: z.boolean().default(false),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

// Populate form when data loads
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
      });
    }
  },
  { immediate: true },
);

const isLost = computed(() => form.values.status);

const isSaving = ref(false); // Add isSaving ref which was missing in HEAD logic but used in template

const onSubmit = form.handleSubmit(async (values) => {
  isSaving.value = true;
  try {
    const payload = {
      ...values,
      status: (values.status ? "LOST" : "NORMAL") as "LOST" | "NORMAL",
    };

    // Optimistic update
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
      method: "patch",
      body: payload,
    });

    // Invalidate public page cache (ignore errors)
    try {
      await refreshNuxtData(`public-product-${productId}`);
    } catch {
      // Cache invalidation is not critical
    }

    toast.success(t('dashboard.saveSuccess'));
  } catch (e) {
    toast.error("Failed to update product");
    refresh(); // Revert on error
  } finally {
    isSaving.value = false;
  }
});

const deleteProduct = async () => {
  try {
    await $fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });
    toast.success(t('dashboard.deleteSuccess'));
    router.push("/dashboard");
  } catch (e) {
    toast.error("Failed to delete product");
  }
};

// QR Design Logic
const advancedQrRef = ref<any>(null);
const qrDotsType = ref<DotType>("rounded");
const qrCornerSquareType = ref<CornerSquareType>("extra-rounded");
const qrCornerDotType = ref<CornerDotType>("dot");

const dotTypes = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy R" },
  { value: "extra-rounded", label: "Extra R" },
];

const cornerSquareTypes = [
  { value: "square", label: "Square" },
  { value: "extra-rounded", label: "Rounded" },
  { value: "dot", label: "Dot" },
];

const qrCodeUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/s/${productId}`;
  }
  return "";
});

const copyLink = () => {
  copy(qrCodeUrl.value);
  toast.success(t('dashboard.linkCopied'));
};

const copyQrImage = () => {
  if (advancedQrRef.value) {
    const success = advancedQrRef.value.download("png");
    if (success) {
      toast.success(t('dashboard.imageDownloaded'));
    } else {
      toast.error("QR Code not ready");
    }
  } else {
    toast.error("QR Code component not found");
  }
};

const printQr = () => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${t('dashboard.printTitle')} - ${product.value?.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            h1 { margin-bottom: 20px; }
            img { max-width: 300px; height: auto; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${product.value?.name}</h1>
          <div id="qr-target"></div>
          <div class="footer">Scan to return to owner</div>
          <script>
            document.body.innerHTML = '<h2>${t('dashboard.printInstruction')}</h2>';
          <\/script>
        </body>
      </html>
    `);
    printWindow.print();
  }
};
</script>

<template>
  <div class="container py-10 max-w-4xl">
    <div class="mb-6">
      <Button variant="ghost" class="pl-0" @click="router.back()">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>

    <div v-if="pending" class="grid gap-6 md:grid-cols-2">
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton class="h-8 w-48 mb-2" />
            <Skeleton class="h-4 w-64" />
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-20 w-full" />
            </div>
            <Skeleton class="h-32 w-full rounded-lg" />
            <Skeleton class="h-32 w-full rounded-lg" />
            <Skeleton class="h-10 w-full" />
            <div class="flex justify-end pt-4">
              <Skeleton class="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton class="h-8 w-32 mb-2" />
            <Skeleton class="h-4 w-48" />
          </CardHeader>
          <CardContent class="flex flex-col items-center">
            <Skeleton class="h-[232px] w-[232px] rounded-lg" />
            <div class="mt-4 text-center w-full flex flex-col items-center">
              <Skeleton class="h-4 w-32 mb-1" />
              <Skeleton class="h-3 w-48" />
            </div>
          </CardContent>
          <CardFooter class="justify-center">
            <Skeleton class="h-10 w-28" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton class="h-6 w-32" />
          </CardHeader>
          <CardContent class="space-y-4">
            <Skeleton class="h-16 w-full" />
            <Skeleton class="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>

    <div v-else-if="error">
      <div class="text-destructive">
        Error loading product: {{ error.message }}
      </div>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2">
      <!-- Settings Column -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{{ t('dashboard.productDetails') }}</CardTitle>
            <CardDescription
              >{{ t('dashboard.productDetailsDesc') }}</CardDescription
            >
          </CardHeader>
          <CardContent>
            <form @submit="onSubmit" class="space-y-4">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>{{ t('dashboard.itemName') }}</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="description">
                <FormItem>
                  <FormLabel>{{ t('dashboard.description') }}</FormLabel>
                  <FormControl>
                    <Textarea v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div class="flex items-center justify-between">
                  <Label class="text-base font-medium leading-none"
                    >{{ t('dashboard.lostMode') }}</Label
                  >
                  <FormField v-slot="{ componentField }" name="status">
                    <Switch
                      :model-value="!!componentField.modelValue"
                      @update:model-value="componentField['onUpdate:modelValue']"
                    />
                  </FormField>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ t('dashboard.lostModeDesc') }}
                </p>

                <template v-if="isLost">
                  <FormField v-slot="{ componentField }" name="lostMessage">
                    <FormItem>
                      <FormLabel>{{ t('dashboard.lostMessage') }}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Please return to..."
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                  <FormField v-slot="{ componentField }" name="contactEmail">
                    <FormItem>
                      <FormLabel>{{ t('dashboard.contactEmail') }}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          v-bind="componentField"
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
                          placeholder="+1 234 567 8900"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </template>
              </div>

              <div
                class="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 space-y-4"
              >
                <div class="flex items-center justify-between">
                  <Label
                    class="text-base font-medium leading-none text-green-700 dark:text-green-400"
                    >{{ t('dashboard.showContactSafe') }}</Label
                  >
                  <FormField
                    v-slot="{ componentField }"
                    name="showContactWhenSafe"
                  >
                    <Switch
                      :model-value="!!componentField.modelValue"
                      @update:model-value="componentField['onUpdate:modelValue']"
                    />
                  </FormField>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ t('dashboard.showContactSafeDesc') }}
                </p>
              </div>

              <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
                <FormItem>
                  <FormLabel>{{ t('dashboard.feishuWebhook') }}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://open.feishu.cn/..."
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormDescription>
                    {{ t('dashboard.feishuWebhookDesc') }}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="flex justify-end pt-4">
                <Button type="submit" :disabled="isSaving">
                  <Loader2
                    v-if="isSaving"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ isSaving ? t('action.saving') : t('action.saveChanges') }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card class="border-destructive">
          <CardHeader>
            <CardTitle class="text-destructive">{{ t('dashboard.deleteConfirmTitle') || 'Danger Zone' }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground mb-4">
               {{ t('dashboard.deleteConfirmDesc') }}
            </p>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive">
                  <Trash2 class="mr-2 h-4 w-4" />
                  {{ t('action.delete') }}
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
                    @click="deleteProduct"
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {{ t('action.delete') }}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <!-- QR & Reports Column -->
      <div class="space-y-6">
        <Card class="overflow-hidden border-2 border-primary/10">
          <CardHeader class="bg-primary/5 pb-6">
            <CardTitle class="flex items-center gap-2">
                <Wand2 class="h-5 w-5 text-primary" />
                {{ t('dashboard.qrDesign') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-6 flex flex-col items-center space-y-6">
            <div class="bg-white p-4 rounded-xl shadow-sm border" ref="qrWrapper">
                 <AdvancedQrCode 
                    ref="advancedQrRef"
                    :data="qrCodeUrl"
                    :width="250"
                    :height="250"
                    :dots-type="qrDotsType"
                    :corner-square-type="qrCornerSquareType"
                    :corner-dot-type="qrCornerDotType"
                    background="#ffffff"
                    dots-color="#000000"
                    corner-square-color="#000000"
                    corner-dot-color="#000000"
                 />
            </div>

            <!-- Customization Controls -->
            <div class="w-full space-y-4">
                <div class="space-y-2">
                    <Label class="text-xs font-semibold uppercase text-muted-foreground">Dots Style</Label>
                    <div class="flex flex-wrap gap-2">
                        <Button 
                            v-for="type in dotTypes" 
                            :key="type.value"
                            variant="outline" 
                            size="sm" 
                            class="h-7 text-xs"
                            :class="qrDotsType === type.value ? 'border-primary bg-primary/5 text-primary' : ''"
                            @click="qrDotsType = type.value as DotType"
                        >
                            {{ type.label }}
                        </Button>
                    </div>
                </div>

                 <div class="space-y-2">
                    <Label class="text-xs font-semibold uppercase text-muted-foreground">Corner Style</Label>
                    <div class="flex flex-wrap gap-2">
                        <Button 
                            v-for="type in cornerSquareTypes" 
                            :key="type.value"
                            variant="outline" 
                            size="sm" 
                            class="h-7 text-xs"
                            :class="qrCornerSquareType === type.value ? 'border-primary bg-primary/5 text-primary' : ''"
                            @click="qrCornerSquareType = type.value as CornerSquareType"
                        >
                            {{ type.label }}
                        </Button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 w-full pt-4">
              <Button variant="secondary" class="w-full" @click="copyLink">
                <Copy class="mr-2 h-4 w-4" />
                {{ t('action.copyLink') }}
              </Button>
               <Button variant="secondary" class="w-full" @click="copyQrImage">
                <Download class="mr-2 h-4 w-4" />
                {{ t('action.download') }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{{ t('dashboard.reports') }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              v-if="product?.reports && product.reports.length > 0"
              class="space-y-4"
            >
              <div
                v-for="report in product.reports"
                :key="report.id"
                class="border-b pb-4 last:border-0"
              >
                <div class="flex justify-between">
                  <span class="font-medium text-sm">{{
                    report.finderContact || "Anonymous"
                  }}</span>
                  <span class="text-xs text-muted-foreground">{{
                    new Date(report.createdAt).toLocaleDateString()
                  }}</span>
                </div>
                <p class="text-sm mt-1 text-muted-foreground">
                  {{ report.message }}
                </p>
              </div>
            </div>
            <div v-else class="text-sm text-muted-foreground text-center py-4">
              {{ t('dashboard.noReports') }}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
