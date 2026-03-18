<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useClipboard } from "@vueuse/core";
import { toast } from "vue-sonner";
import {
  Wand2,
  Copy,
  Download,
} from "lucide-vue-next";
import type { DotType, CornerSquareType, CornerDotType } from "qr-code-styling";
import AdvancedQrCode from "@/components/AdvancedQrCode.vue";

const props = defineProps<{
  productId: string;
}>();

const { t } = useI18n();
const { copy } = useClipboard({ legacy: true });

// QR Design Logic
const advancedQrRef = ref<any>(null);
const qrDotsType = ref<DotType>("rounded");
const qrCornerSquareType = ref<CornerSquareType>("extra-rounded");
const qrCornerDotType = ref<CornerDotType>("dot");

const dotTypes = computed(() => [
  { value: "square", label: t("qr.square") },
  { value: "dots", label: t("qr.dots") },
  { value: "rounded", label: t("qr.rounded") },
  { value: "classy", label: t("qr.classy") },
  { value: "classy-rounded", label: t("qr.classyRounded") },
  { value: "extra-rounded", label: t("qr.extraRounded") },
]);

const cornerSquareTypes = computed(() => [
  { value: "square", label: t("qr.square") },
  { value: "extra-rounded", label: t("qr.rounded") },
  { value: "dot", label: t("qr.dot") },
]);

const qrCodeUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/s/${props.productId}`;
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
      toast.error(t("qr.notReady"));
    }
  } else {
    toast.error(t("qr.missingComponent"));
  }
};
</script>

<template>
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
          <Label class="text-xs font-semibold uppercase text-muted-foreground">{{ t("qr.dotsStyle") }}</Label>
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
          <Label class="text-xs font-semibold uppercase text-muted-foreground">{{ t("qr.cornerStyle") }}</Label>
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
</template>
