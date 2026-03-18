<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { QrCode, Shield, Zap, Github } from 'lucide-vue-next'

const { loggedIn } = useUserSession()
const { t } = useI18n()

useSeoMeta({
  title: () => t('home.seo.title'),
  description: () => t('home.seo.description'),
  ogTitle: () => t('home.seo.ogTitle'),
  ogDescription: () => t('home.seo.description'),
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
})

const handleGetStarted = () => {
  if (loggedIn.value) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/auth/google', { external: true })
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <section class="grid flex-1 w-full max-w-7xl mx-auto px-6 py-24 md:py-32 gap-12 items-center lg:grid-cols-2">
      <div class="space-y-8 text-left">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-primary">
          {{ t('home.hero.titleLine1') }} <br />
          {{ t('home.hero.titleLine2') }}
        </h1>

        <p class="text-xl text-muted-foreground max-w-lg leading-relaxed">
          {{ t('home.hero.description') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <Button size="lg" class="h-14 px-8 text-lg rounded-full" @click="handleGetStarted">
            {{ t('home.hero.primaryCta') }}
          </Button>
          <Button variant="outline" size="lg" class="h-14 px-8 text-lg rounded-full gap-2" as-child>
            <a href="https://github.com/RayJason/live-qr" target="_blank">
              <Github class="w-5 h-5" />
              {{ t('home.hero.githubCta') }}
            </a>
          </Button>
        </div>
      </div>

      <div class="relative flex items-center justify-center">
        <div
          class="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-3xl opacity-70 -z-10 transform scale-110"
        />

        <div
          class="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 rotate-3 transition-transform hover:rotate-0 duration-500"
        >
          <QrCode class="w-64 h-64 text-primary stroke-[1.5]" />
        </div>
      </div>
    </section>

    <section class="py-24 px-4 bg-background border-t">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold tracking-tight mb-4">{{ t('home.features.title') }}</h2>
          <p class="text-muted-foreground">{{ t('home.features.description') }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <QrCode class="w-6 h-6" />
              </div>
              <CardTitle>{{ t('home.smart.title') }}</CardTitle>
              <CardDescription>
                {{ t('home.smart.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>{{ t('home.smart.point1') }}</li>
                <li>{{ t('home.smart.point2') }}</li>
                <li>{{ t('home.smart.point3') }}</li>
              </ul>
            </CardContent>
          </Card>

          <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Zap class="w-6 h-6" />
              </div>
              <CardTitle>{{ t('home.protection.title') }}</CardTitle>
              <CardDescription>
                {{ t('home.protection.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>{{ t('home.protection.point1') }}</li>
                <li>{{ t('home.protection.point2') }}</li>
                <li>{{ t('home.protection.point3') }}</li>
              </ul>
            </CardContent>
          </Card>

          <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Shield class="w-6 h-6" />
              </div>
              <CardTitle>{{ t('home.privacy.title') }}</CardTitle>
              <CardDescription>
                {{ t('home.privacy.description') }}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>{{ t('home.privacy.point1') }}</li>
                <li>{{ t('home.privacy.point2') }}</li>
                <li>{{ t('home.privacy.point3') }}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>
