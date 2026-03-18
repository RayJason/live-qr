<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "vue-sonner";
import { Plus } from "lucide-vue-next";

const emit = defineEmits(["product-created"]);
const { t } = useI18n();

const isOpen = ref(false);
const isLoading = ref(false);

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(2, t("validation.productNameMin"))
      .max(50, t("validation.productNameMax")),
    description: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    feishuWebhookUrl: z.string().optional(),
  }),
);

const { data: userProfile } = useLazyFetch("/api/profile");

const form = useForm({
  validationSchema: formSchema,
});

watch(isOpen, (open) => {
  if (open && userProfile.value) {
    form.setValues({
      contactEmail: userProfile.value.email || "",
      contactPhone: userProfile.value.phone || "",
      feishuWebhookUrl: userProfile.value.feishuWebhookUrl || "",
    });
  }
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    isLoading.value = true;
    const { data, error } = await useFetch("/api/products", {
      method: "POST",
      body: values,
    });

    if (error.value) {
      toast.error(t("productDialog.createError"));
      return;
    }

    toast.success(t("productDialog.createSuccess"));
    isOpen.value = false;
    emit("product-created", data.value);
    form.resetForm();
  } catch (err) {
    toast.error(t("productDialog.unexpectedError"));
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        {{ t("productDialog.trigger") }}
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t("productDialog.title") }}</DialogTitle>
        <DialogDescription>
          {{ t("productDialog.description") }}
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit">
        <div class="grid gap-4 py-4">
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>{{ t("productDialog.nameLabel") }}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  :placeholder="t('productDialog.namePlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>{{ t("productDialog.descriptionLabel") }}</FormLabel>
              <FormControl>
                <Textarea
                  :placeholder="t('productDialog.descriptionPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactEmail">
            <FormItem>
              <FormLabel>{{ t("productDialog.emailLabel") }}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  :placeholder="t('productDialog.emailPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="contactPhone">
            <FormItem>
              <FormLabel>{{ t("productDialog.phoneLabel") }}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  :placeholder="t('productDialog.phonePlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="feishuWebhookUrl">
            <FormItem>
              <FormLabel>{{ t("productDialog.webhookLabel") }}</FormLabel>
              <FormControl>
                <Input
                  :placeholder="t('productDialog.webhookPlaceholder')"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <DialogFooter>
          <Button type="submit" :disabled="isLoading">
            {{ isLoading ? t("productDialog.submitting") : t("productDialog.submit") }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
