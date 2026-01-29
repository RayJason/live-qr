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
      toast.error("QR Code not ready");
    }
  } else {
    toast.error("QR Code component not found");
  }
};
</script>

<template>
  <Card class="overflow-hidden border-2 border-primary/10 h-full">
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
</template>
