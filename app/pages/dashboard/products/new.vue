<script setup lang="ts">
import { ArrowLeftIcon, SaveIcon, Loader2Icon } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const router = useRouter();
const isLoading = ref(false);

const form = reactive({
  name: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
  message: "If found, please scan this code to contact me. Thank you!",
});

const onSubmit = async () => {
  isLoading.value = true;
  try {
    // TODO: Implement API call
    // await $fetch('/api/products', { method: 'POST', body: form })
    // router.push('/dashboard')

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Product created! (Mock)");
    router.push("/dashboard");
  } catch (error) {
    console.error(error);
    alert("Failed to create product");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UiButton variant="outline" size="icon" @click="router.back()">
        <ArrowLeftIcon class="h-4 w-4" />
      </UiButton>
      <h1 class="text-lg font-semibold md:text-2xl">Create New Product</h1>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Basic Information</UiCardTitle>
          <UiCardDescription> Details about your item. </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="space-y-2">
            <UiLabel for="name">Name</UiLabel>
            <UiInput
              id="name"
              v-model="form.name"
              placeholder="e.g. My Snowboard"
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="description">Description</UiLabel>
            <UiTextarea
              id="description"
              v-model="form.description"
              placeholder="e.g. Burton Custom X 2024"
            />
          </div>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Contact & Message</UiCardTitle>
          <UiCardDescription> How finders can reach you. </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="space-y-2">
            <UiLabel for="message">Lost Message</UiLabel>
            <UiTextarea
              id="message"
              v-model="form.message"
              placeholder="Message to display when scanned..."
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="email">Contact Email</UiLabel>
            <UiInput
              id="email"
              type="email"
              v-model="form.contactEmail"
              placeholder="your@email.com"
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="phone">Contact Phone</UiLabel>
            <UiInput
              id="phone"
              type="tel"
              v-model="form.contactPhone"
              placeholder="+1234567890"
            />
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <div class="flex justify-end">
      <UiButton @click="onSubmit" :disabled="isLoading">
        <Loader2Icon v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
        <SaveIcon v-else class="mr-2 h-4 w-4" />
        Create Product
      </UiButton>
    </div>
  </div>
</template>
