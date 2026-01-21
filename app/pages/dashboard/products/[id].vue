<script setup lang="ts">
import {
  ArrowLeftIcon,
  SaveIcon,
  Loader2Icon,
  DownloadIcon,
  AlertTriangleIcon,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const id = route.params.id;

// Mock data
const form = reactive({
  name: "My Snowboard",
  description: "Burton Custom X 2024",
  status: "active", // active (normal) | lost
  contactEmail: "ray@example.com",
  message: "If found, please scan this code to contact me.",
});

const isLost = computed({
  get: () => form.status === "lost",
  set: (val) => (form.status = val ? "lost" : "active"),
});

const onSubmit = async () => {
  isLoading.value = true;
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  isLoading.value = false;
  alert("Saved! (Mock)");
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UiButton variant="outline" size="icon" @click="router.back()">
        <ArrowLeftIcon class="h-4 w-4" />
      </UiButton>
      <h1 class="text-lg font-semibold md:text-2xl">Edit Product</h1>
      <div class="ml-auto flex items-center gap-2">
        <UiBadge
          :variant="isLost ? 'destructive' : 'secondary'"
          class="text-sm px-3 py-1"
        >
          {{ isLost ? "LOST" : "SECURE" }}
        </UiBadge>
      </div>
    </div>

    <UiAlert v-if="isLost" variant="destructive">
      <AlertTriangleIcon class="h-4 w-4" />
      <UiAlertTitle>Item Marked as Lost!</UiAlertTitle>
      <UiAlertDescription>
        Scanning the QR code will now verify identity and display your contact
        information to the finder.
      </UiAlertDescription>
    </UiAlert>

    <div class="grid gap-6 md:grid-cols-3">
      <div class="md:col-span-2 space-y-6">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Product Details</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="name">Name</UiLabel>
              <UiInput id="name" v-model="form.name" />
            </div>
            <div class="space-y-2">
              <UiLabel for="description">Description</UiLabel>
              <UiTextarea id="description" v-model="form.description" />
            </div>
            <div class="flex items-center gap-4 rounded-lg border p-4">
              <UiSwitch id="lost-mode" v-model:checked="isLost" />
              <div class="space-y-0.5">
                <UiLabel for="lost-mode">Lost Mode</UiLabel>
                <div class="text-sm text-muted-foreground">
                  Enable this when your item is missing.
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Contact Settings</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-4">
            <div class="space-y-2">
              <UiLabel for="message">Public Message</UiLabel>
              <UiTextarea id="message" v-model="form.message" />
            </div>
            <div class="space-y-2">
              <UiLabel for="email">Contact Email</UiLabel>
              <UiInput id="email" v-model="form.contactEmail" />
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <div class="space-y-6">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>QR Code</UiCardTitle>
          </UiCardHeader>
          <UiCardContent
            class="flex flex-col items-center justify-center space-y-4"
          >
            <div
              class="h-48 w-48 bg-muted rounded-lg flex items-center justify-center"
            >
              <!-- Placeholder for Real QR Code -->
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('http://localhost:3000/p/' + id)}`"
                alt="QR Code"
                class="h-full w-full"
              />
            </div>
            <UiButton class="w-full" variant="outline">
              <DownloadIcon class="mr-2 h-4 w-4" />
              Download QR
            </UiButton>
          </UiCardContent>
        </UiCard>

        <UiButton
          class="w-full"
          size="lg"
          @click="onSubmit"
          :disabled="isLoading"
        >
          <Loader2Icon v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          <SaveIcon v-else class="mr-2 h-4 w-4" />
          Save Changes
        </UiButton>
      </div>
    </div>
  </div>
</template>
