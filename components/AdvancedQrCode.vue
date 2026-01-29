<script setup lang="ts">
import QRCodeStyling from "qr-code-styling";
import type {
  Options,
  DrawType,
  TypeNumber,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
} from "qr-code-styling";

const props = defineProps({
  data: { type: String, required: true },
  width: { type: Number, default: 300 },
  height: { type: Number, default: 300 },
  margin: { type: Number, default: 10 },
  image: { type: String, default: "" },
  dotsType: { type: String as PropType<DotType>, default: "square" },
  dotsColor: { type: String, default: "#000000" },
  cornerSquareType: { type: String as PropType<CornerSquareType>, default: "square" },
  cornerSquareColor: { type: String, default: "#000000" },
  cornerDotType: { type: String as PropType<CornerDotType>, default: "square" },
  cornerDotColor: { type: String, default: "#000000" },
  background: { type: String, default: "#ffffff" },
});

const qrCode = ref<QRCodeStyling>();
const qrContainer = ref<HTMLElement>();

const options = computed<Options>(() => ({
  width: props.width,
  height: props.height,
  type: "canvas" as DrawType,
  data: props.data,
  image: props.image,
  margin: props.margin,
  qrOptions: {
    typeNumber: 0 as TypeNumber,
    mode: "Byte",
    errorCorrectionLevel: "H" as ErrorCorrectionLevel,
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 10,
    crossOrigin: "anonymous",
  },
  dotsOptions: {
    color: props.dotsColor,
    type: props.dotsType,
  },
  backgroundOptions: {
    color: props.background,
  },
  cornersSquareOptions: {
    color: props.cornerSquareColor,
    type: props.cornerSquareType,
  },
  cornersDotOptions: {
    color: props.cornerDotColor,
    type: props.cornerDotType,
  },
}));

onMounted(() => {
  if (process.client) {
    qrCode.value = new QRCodeStyling(options.value);
    qrCode.value.append(qrContainer.value);
  }
});

watch(
  options,
  (newOptions) => {
    if (qrCode.value) {
      qrCode.value.update(newOptions);
    }
  },
  { deep: true }
);

const download = (extension: "png" | "jpeg" | "webp") => {
  if (qrCode.value) {
    qrCode.value.download({ extension });
    return true;
  }
  return false;
};

defineExpose({ download });
</script>

<template>
  <div ref="qrContainer"></div>
</template>
