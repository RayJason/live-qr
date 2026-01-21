<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { QrCode, Shield, Zap, ArrowRight, Github } from 'lucide-vue-next'

const { status, signIn } = useAuth()

const handleGetStarted = () => {
    if (status.value === 'authenticated') {
        navigateTo('/dashboard')
    } else {
        signIn('google', { callbackUrl: '/dashboard' })
    }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Hero Section -->
    <section class="flex-1 w-full max-w-7xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
      <!-- Left Column: Content -->
      <div class="space-y-8 text-left">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-primary">
          Never Lose <br /> Your Gear.
        </h1>
        
        <p class="text-xl text-muted-foreground max-w-lg leading-relaxed">
          Smart, trackable QR codes for your most valuable items. 
          Protect what matters with instant "Safe" and "Lost" modes.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <Button size="lg" class="h-14 px-8 text-lg rounded-full" @click="handleGetStarted">
            Get Started
          </Button>
          <Button variant="outline" size="lg" class="h-14 px-8 text-lg rounded-full gap-2" as-child>
            <a href="https://github.com/RayJason/live-qr" target="_blank">
              <Github class="w-5 h-5" />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      <!-- Right Column: Visual -->
      <div class="relative flex items-center justify-center">
        <!-- Abstract Background Blob -->
        <div class="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-3xl opacity-70 -z-10 transform scale-110"></div>
        
        <!-- Large QR Icon -->
        <div class="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 rotate-3 transition-transform hover:rotate-0 duration-500">
           <QrCode class="w-64 h-64 text-primary stroke-[1.5]" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-4 bg-background border-t">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold tracking-tight mb-4">Why Anti-Lost?</h2>
          <p class="text-muted-foreground">Simple, effective, and privacy-focused protection for your belongings.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <QrCode class="w-6 h-6" />
              </div>
              <CardTitle>Smart QR Codes</CardTitle>
              <CardDescription>
                Generate unique QR codes that anyone can scan to contact you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Instant generation</li>
                <li>Customizable landing pages</li>
                <li>Print-ready formats</li>
              </ul>
            </CardContent>
          </Card>

           <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Zap class="w-6 h-6" />
              </div>
              <CardTitle>Instant Protection</CardTitle>
              <CardDescription>
                Switch modes instantly when you realize something is missing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Safe Mode: Shows basic info</li>
                <li>Lost Mode: Shows contact details</li>
                <li>Real-time updates</li>
              </ul>
            </CardContent>
          </Card>

           <Card class="bg-card/50 backdrop-blur-sm border-muted transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Shield class="w-6 h-6" />
              </div>
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your personal information is hidden until you choose to reveal it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul class="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>No app required for finders</li>
                <li>Secure data storage</li>
                <li>Control what you share</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 text-center text-sm text-muted-foreground border-t">
      <p>&copy; {{ new Date().getFullYear() }} Anti-Lost. Open Source Project.</p>
    </footer>
  </div>
</template>
