<script setup lang="ts">
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  QrCodeIcon,
} from "lucide-vue-next";
const { status } = useAuth();

definePageMeta({
  layout: "default",
});
</script>

<template>
  <div class="flex flex-col min-h-[calc(100vh-14rem)]">
    <!-- Hero Section -->
    <section
      class="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50"
    >
      <div class="container px-4 md:px-6">
        <div
          class="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]"
        >
          <div class="flex flex-col justify-center space-y-4">
            <div class="space-y-2">
              <h1
                class="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
              >
                Never Lose What Matters Most
              </h1>
              <p class="max-w-[600px] text-muted-foreground md:text-xl">
                Create secure QR codes for your valuables. If lost, finders can
                contact you instantly without revealing your private details
                until necessary.
              </p>
            </div>
            <div class="flex flex-col gap-2 min-[400px]:flex-row">
              <NuxtLink v-if="status === 'authenticated'" to="/dashboard">
                <UiButton size="lg" class="w-full min-[400px]:w-auto">
                  Go to Dashboard
                  <ArrowRightIcon class="ml-2 h-4 w-4" />
                </UiButton>
              </NuxtLink>
              <NuxtLink v-else to="/login">
                <UiButton size="lg" class="w-full min-[400px]:w-auto">
                  Get Started
                  <ArrowRightIcon class="ml-2 h-4 w-4" />
                </UiButton>
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <div
              class="relative flex h-[300px] w-[300px] flex-col items-center justify-center rounded-xl border bg-background p-8 shadow-xl"
            >
              <QrCodeIcon class="h-32 w-32 text-primary mb-4" />
              <div class="space-y-2 text-center">
                <div class="font-semibold">Scan to Return</div>
                <div class="text-xs text-muted-foreground">ID: 123-456-789</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="w-full py-12 md:py-24 lg:py-32">
      <div class="container px-4 md:px-6">
        <div class="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <div class="flex flex-col items-center space-y-4 text-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <QrCodeIcon class="h-8 w-8 text-primary" />
            </div>
            <h3 class="text-xl font-bold">Smart QR Codes</h3>
            <p class="text-muted-foreground">
              Generate unique QR codes for keys, wallets, laptops, and more.
            </p>
          </div>
          <div class="flex flex-col items-center space-y-4 text-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <SmartphoneIcon class="h-8 w-8 text-primary" />
            </div>
            <h3 class="text-xl font-bold">Instant Contact</h3>
            <p class="text-muted-foreground">
              Finders can scan and message you immediately through our secure
              platform.
            </p>
          </div>
          <div class="flex flex-col items-center space-y-4 text-center">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
            >
              <ShieldCheckIcon class="h-8 w-8 text-primary" />
            </div>
            <h3 class="text-xl font-bold">Privacy First</h3>
            <p class="text-muted-foreground">
              Your contact info remains hidden. You choose what to share when an
              item is found.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
