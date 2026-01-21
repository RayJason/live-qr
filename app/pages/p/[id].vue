<script setup lang="ts">
import {
  AlertTriangleIcon,
  MessageSquareIcon,
  CheckCircleIcon,
} from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const id = route.params.id;

// Mock Data - In reality trigger an API call to get public info
const product = ref({
  id: id,
  name: "My Snowboard",
  ownerName: "Ray",
  status: "lost", // 'active' | 'lost'
  message: "I really love this board. Please help me get it back!",
  contactEmail: "ray@example.com",
});

// Simulate fetching different state based on ID for demo purposes
if (id === "1") {
  product.value.status = "active";
}

const isLost = computed(() => product.value.status === "lost");

const form = reactive({
  finderName: "",
  finderContact: "",
  message: "",
});

const isSubmitting = ref(false);
const isSent = ref(false);

const onSubmit = async () => {
  isSubmitting.value = true;
  // Simulate API Call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSubmitting.value = false;
  isSent.value = true;
};
</script>

<template>
  <div
    class="container flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center max-w-lg px-4 py-12"
  >
    <div
      v-if="isLost"
      class="w-full space-y-8 animate-in zoom-in-95 duration-500"
    >
      <div class="flex flex-col items-center text-center space-y-4">
        <div
          class="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10"
        >
          <AlertTriangleIcon class="h-12 w-12 text-destructive" />
        </div>
        <h1 class="text-3xl font-bold text-destructive">This item is lost!</h1>
        <p class="text-lg text-muted-foreground">
          The owner has marked this item as lost and is looking for it.
        </p>
      </div>

      <UiCard class="w-full border-destructive/50 shadow-lg">
        <UiCardHeader>
          <UiCardTitle>Owner's Message</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <blockquote
            class="border-l-4 border-destructive pl-4 italic text-muted-foreground"
          >
            "{{ product.message }}"
          </blockquote>
        </UiCardContent>
      </UiCard>

      <UiCard class="w-full" v-if="!isSent">
        <UiCardHeader>
          <UiCardTitle>Found it? Please contact the owner</UiCardTitle>
          <UiCardDescription>
            Your details will be sent privately to the owner.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="space-y-2">
            <UiLabel for="name">Your Name</UiLabel>
            <UiInput
              id="name"
              v-model="form.finderName"
              placeholder="Kind Finder"
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="contact">Your Contact Info</UiLabel>
            <UiInput
              id="contact"
              v-model="form.finderContact"
              placeholder="Phone or Email"
            />
          </div>
          <div class="space-y-2">
            <UiLabel for="msg">Message (Optional)</UiLabel>
            <UiTextarea
              id="msg"
              v-model="form.message"
              placeholder="I found your item at..."
            />
          </div>
        </UiCardContent>
        <UiCardFooter>
          <UiButton class="w-full" @click="onSubmit" :disabled="isSubmitting">
            <MessageSquareIcon class="mr-2 h-4 w-4" />
            {{ isSubmitting ? "Sending..." : "Send Message to Owner" }}
          </UiButton>
        </UiCardFooter>
      </UiCard>

      <div
        v-else
        class="text-center space-y-4 p-8 bg-muted/50 rounded-lg animate-in fade-in"
      >
        <CheckCircleIcon class="h-16 w-16 text-green-500 mx-auto" />
        <h3 class="text-xl font-semibold">Thank you!</h3>
        <p class="text-muted-foreground">
          The notification has been sent to the owner. You are a hero!
        </p>
      </div>
    </div>

    <!-- Active State -->
    <div
      v-else
      class="w-full space-y-8 text-center animate-in fade-in duration-700"
    >
      <div
        class="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mx-auto"
      >
        <CheckCircleIcon class="h-12 w-12 text-primary" />
      </div>
      <h1 class="text-2xl font-bold">This item is safe.</h1>
      <p class="text-muted-foreground">
        It belongs to <strong>{{ product.ownerName }}</strong
        >.
      </p>
      <div class="p-4 bg-muted rounded-lg text-sm">
        If you found this and it looks abandoned, please keep it safe.
      </div>
    </div>
  </div>
</template>
