<script setup lang="ts">
import { ref, computed } from "vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "vue-sonner";
import {
  AlertTriangle,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Phone,
  Mail,
} from "lucide-vue-next";

definePageMeta({
  auth: false,
  layout: false,
});

const route = useRoute();
const productId = route.params.id as string;

const {
  data: product,
  pending,
  error,
} = await useFetch(`/api/s/${productId}`, {
  key: `public-product-${productId}`,
});

useSeoMeta({
  title: () =>
    product.value?.name
      ? product.value?.status === "LOST"
        ? `LOST ITEM: ${product.value.name}`
        : `Safe Item - ${product.value.name}`
      : "Anti-Lost Item",
  description: () =>
    product.value?.status === "LOST"
      ? `HELP! This item is LOST. Please help return it to the owner. ${product.value?.lostMessage || ""}`
      : `This item is protected by Anti-Lost. If found, please scan to contact owner.`,
  ogTitle: () =>
    product.value?.name
      ? product.value?.status === "LOST"
        ? `LOST ITEM: ${product.value.name}`
        : `Safe Item - ${product.value.name}`
      : "Anti-Lost Item",
  ogDescription: () =>
    product.value?.status === "LOST"
      ? `HELP! This item is LOST. Please help return it to the owner. ${product.value?.lostMessage || ""}`
      : `This item is protected by Anti-Lost. If found, please scan to contact owner.`,
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
});

const showReportForm = ref(false);
const isSubmitting = ref(false);
const reportSuccess = ref(false);

const formSchema = toTypedSchema(
  z.object({
    finderContact: z
      .string()
      .min(1, "Please provide a way to contact you (Phone/Email)"),
    message: z.string().optional(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

const isLost = computed(() => product.value?.status === "LOST");

const onSubmit = form.handleSubmit(async (values) => {
  isSubmitting.value = true;
  try {
    await $fetch("/api/report", {
      method: "POST",
      body: {
        productId,
        ...values,
      },
    });
    reportSuccess.value = true;
    toast.success("Thank you! Report sent to the owner.");
  } catch (e) {
    toast.error("Failed to send report. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500"
    :class="
      isLost
        ? 'bg-gradient-to-b from-red-50 to-orange-100 dark:from-red-950/20 dark:to-background'
        : 'bg-gradient-to-b from-emerald-50 to-slate-100 dark:from-emerald-950/20 dark:to-background'
    "
  >
    <div v-if="pending" class="flex flex-col items-center gap-4">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"
      ></div>
      <p class="text-muted-foreground animate-pulse">Loading item details...</p>
    </div>

    <div v-else-if="error" class="max-w-md w-full text-center space-y-4">
      <div
        class="bg-destructive/10 text-destructive p-8 rounded-2xl border border-destructive/20 shadow-sm"
      >
        <AlertTriangle class="h-12 w-12 mx-auto mb-4" />
        <h3 class="font-bold text-xl">Item Not Found</h3>
        <p class="text-sm opacity-90">
          This QR code seems invalid or the item was removed.
        </p>
      </div>
      <Button variant="outline" @click="navigateTo('/')">Go Home</Button>
    </div>

    <div v-else class="max-w-md w-full space-y-6">
      <!-- Main Card -->
      <Card class="border-0 shadow-xl overflow-hidden relative">
        <!-- Status Header Banner -->
        <div
          class="py-8 px-6 text-center relative overflow-hidden transition-colors duration-500"
          :class="isLost ? 'bg-red-600' : 'bg-emerald-500'"
        >
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              class="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
            </svg>
          </div>

          <div class="relative z-10 flex flex-col items-center text-white">
            <component
              :is="isLost ? AlertTriangle : ShieldCheck"
              class="h-14 w-14 mb-4"
              :class="isLost ? 'animate-pulse' : ''"
            />

            <h1
              class="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none mb-2"
            >
              {{ product.name }}
            </h1>

            <div
              class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-3"
            >
              <span v-if="isLost">LOST ITEM</span>
              <span v-else>PROTECTED ITEM</span>
            </div>

            <p
              class="text-white/90 text-sm font-medium flex items-center gap-1"
              v-if="product.user?.name"
            >
              Owner: {{ product.user.name }}
            </p>
          </div>
        </div>

        <CardContent class="pt-8 pb-8 px-6 space-y-8">
          <!-- Product Description -->
          <div v-if="product.description" class="text-center">
            <p class="text-muted-foreground text-lg leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <!-- Separator -->
          <div v-if="product.description" class="h-px w-full bg-border"></div>

          <!-- Safe Mode Content -->
          <div v-if="!isLost" class="space-y-6">
            <div class="bg-muted/50 rounded-xl p-6 text-center space-y-3">
              <div
                class="mx-auto bg-background rounded-full p-3 w-12 h-12 flex items-center justify-center shadow-sm"
              >
                <MapPin class="h-6 w-6 text-primary" />
              </div>
              <h3 class="font-semibold text-foreground">Found this item?</h3>
              <p class="text-sm text-muted-foreground">
                If you found this item, you can send a secure message to the
                owner.
              </p>
            </div>

            <!-- Optional Safe Mode Contact -->
            <div
              v-if="
                product.showContactWhenSafe &&
                (product.contactEmail || product.contactPhone)
              "
              class="space-y-4 pt-2 animate-in fade-in"
            >
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background px-2 text-muted-foreground"
                    >Owner Contact</span
                  >
                </div>
              </div>

              <a
                v-if="product.contactPhone"
                :href="`tel:${product.contactPhone.replace(/\s/g, '')}`"
                class="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div class="bg-primary/10 p-2 rounded-full text-primary">
                  <Phone class="h-4 w-4" />
                </div>
                <span class="text-base font-semibold">{{
                  product.contactPhone
                }}</span>
              </a>

              <a
                v-if="product.contactEmail"
                :href="`mailto:${product.contactEmail}`"
                class="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div class="bg-primary/10 p-2 rounded-full text-primary">
                  <Mail class="h-4 w-4" />
                </div>
                <span class="text-base font-semibold">{{
                  product.contactEmail
                }}</span>
              </a>
            </div>
          </div>

          <!-- Lost Mode Content -->
          <div
            v-if="isLost && product"
            class="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500"
          >
            <!-- Owner Message -->
            <div
              v-if="product.lostMessage"
              class="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-5 relative"
            >
              <Mail class="absolute top-4 left-4 h-5 w-5 text-red-500/50" />
              <p
                class="text-center font-medium text-lg italic text-red-900 dark:text-red-200 pt-1 px-2"
              >
                "{{ product.lostMessage }}"
              </p>
            </div>

            <!-- Owner Contact -->
            <div
              v-if="product.contactPhone || product.contactEmail"
              class="space-y-3"
            >
              <!-- Phone -->
              <a
                v-if="product.contactPhone"
                :href="`tel:${product.contactPhone.replace(/\s/g, '')}`"
                class="group relative flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div class="bg-white/20 p-2 rounded-full">
                  <Phone class="h-6 w-6" />
                </div>
                <span class="text-xl font-bold tracking-wide">Call Owner</span>
              </a>

              <!-- Email -->
              <a
                v-if="product.contactEmail"
                :href="`mailto:${product.contactEmail}`"
                class="group relative flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div class="bg-white/20 p-2 rounded-full">
                  <Mail class="h-6 w-6" />
                </div>
                <span class="text-xl font-bold tracking-wide">Email Owner</span>
              </a>
            </div>
          </div>

          <!-- Report Action Area -->
          <div v-if="!showReportForm && !reportSuccess" class="pt-2">
            <Button
              size="lg"
              class="w-full h-14 text-lg font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
              :class="
                isLost
                  ? 'bg-white text-red-600 hover:bg-slate-50 border-2 border-red-100'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              "
              :variant="isLost ? 'secondary' : 'default'"
              @click="showReportForm = true"
            >
              <MapPin class="mr-2 h-5 w-5" />
              I Found This Item
            </Button>
          </div>

          <!-- Report Form -->
          <div
            v-if="showReportForm && !reportSuccess"
            class="space-y-4 animate-in fade-in slide-in-from-bottom-8"
          >
            <div class="text-center pb-2">
              <h3 class="font-bold text-lg">Send Message</h3>
              <p class="text-xs text-muted-foreground">
                Notify the owner securely
              </p>
            </div>

            <form @submit="onSubmit" class="space-y-4">
              <FormField v-slot="{ componentField }" name="finderContact">
                <FormItem>
                  <FormControl>
                    <Input
                      class="h-12 rounded-lg bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
                      placeholder="Your Phone or Email"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="message">
                <FormItem>
                  <FormControl>
                    <Textarea
                      class="min-h-[100px] rounded-lg bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all resize-none"
                      placeholder="Where did you find it?"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  class="flex-1 h-12 rounded-lg hover:bg-muted"
                  @click="showReportForm = false"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  class="flex-[2] h-12 rounded-lg font-bold shadow-md"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? "Sending..." : "Send Report" }}
                </Button>
              </div>
            </form>
          </div>

          <!-- Success Message -->
          <div
            v-if="reportSuccess"
            class="text-center py-4 animate-in zoom-in duration-300"
          >
            <div
              class="bg-green-100 text-green-600 p-4 rounded-full inline-block mb-4 shadow-sm"
            >
              <CheckCircle class="h-10 w-10" />
            </div>
            <h3 class="text-2xl font-bold text-foreground">Report Sent!</h3>
            <p
              class="text-muted-foreground mt-2 max-w-[200px] mx-auto leading-normal"
            >
              Thanks for being a good samaritan. The owner has been notified.
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div
        class="text-center space-y-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <a
          href="/"
          target="_blank"
          class="text-xs font-semibold tracking-wider text-muted-foreground uppercase hover:text-primary transition-colors"
        >
          Powered by Anti-Lost QR
        </a>
      </div>
    </div>
  </div>
</template>
