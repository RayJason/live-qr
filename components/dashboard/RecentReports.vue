<script setup lang="ts">
import { shallowRef } from 'vue'
import { Loader2, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

defineProps<{
  productId: string
  reports: { id: string, finderContact: string | null, message: string | null, createdAt: string }[]
}>()
const emit = defineEmits<{ deleted: [reportId: string] }>()
const { t, locale } = useI18n()
const deletingId = shallowRef<string | null>(null)

const deleteReport = async (productId: string, reportId: string) => {
  if (deletingId.value) return
  deletingId.value = reportId
  try {
    await $fetch(`/api/products/${productId}/reports/${reportId}`, { method: 'DELETE' })
    emit('deleted', reportId)
    toast.success(t('dashboard.deleteReportSuccess'))
  } catch {
    toast.error(t('dashboard.deleteReportError'))
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <CardTitle class="text-lg">{{ t('dashboard.recentReports') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <TooltipProvider>
        <div v-if="reports.length" class="space-y-3">
          <div v-for="report in reports" :key="report.id" class="text-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="break-words font-medium">{{ report.finderContact || t('report.anonymous') }}</p>
                <p class="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {{ report.message }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <span class="text-xs text-muted-foreground whitespace-nowrap">
                  {{ new Date(report.createdAt).toLocaleDateString(locale) }}
                </span>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <AlertDialogTrigger as-child>
                        <Button
                          type="button" variant="ghost" size="icon"
                          class="h-8 w-8 text-muted-foreground hover:text-destructive"
                          :aria-label="t('dashboard.deleteReport')"
                          :disabled="deletingId !== null"
                        >
                          <Loader2 v-if="deletingId === report.id" class="h-4 w-4 animate-spin" />
                          <Trash2 v-else class="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.deleteReport') }}</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{{ t('dashboard.deleteReportTitle') }}</AlertDialogTitle>
                      <AlertDialogDescription>{{ t('dashboard.deleteReportDescription') }}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel :title="t('action.cancel')">{{ t('action.cancel') }}</AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        :title="t('dashboard.deleteReport')" :disabled="deletingId !== null"
                        @click="deleteReport(productId, report.id)"
                      >
                        {{ t('action.delete') }}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
            <span class="text-xl">📭</span>
          </div>
          <p class="text-sm font-medium">{{ t('dashboard.noReports') }}</p>
          <p class="mt-1 text-xs opacity-70">{{ t('dashboard.noReportsDesc') }}</p>
        </div>
      </TooltipProvider>
    </CardContent>
  </Card>
</template>
