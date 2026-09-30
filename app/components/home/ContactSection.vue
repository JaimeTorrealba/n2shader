<template>
  <div class="w-full py-16 px-6 md:px-12 lg:px-24 min-h-screen flex items-center">
    <!-- The region's name ("Contact and FAQ") lives on the <section> in index.vue -->
    <div class="relative z-10 flex w-full flex-col gap-16 lg:flex-row lg:gap-24">

      <!-- Left: Contact form (appears second on mobile via order) -->
      <div class="order-2 flex flex-col gap-6 lg:order-1 lg:w-1/2">
        <h2 class="font-semibold !text-2xl text-white tracking-tight">Any project idea?</h2>

        <UForm :schema="schema" :state="form" class="flex flex-col gap-4" @submit="handleSubmit">
          <UFormField label="Name" name="name" required>
            <UInput
              v-model="form.name"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              variant="outline"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              autocomplete="email"
              variant="outline"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Message" name="message" required>
            <UTextarea
              v-model="form.message"
              :rows="5"
              placeholder="Tell me about your project..."
              variant="outline"
              class="w-full"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="mt-2 self-start backdrop-blur-sm text-white"
            :loading="pending"
          >
            Send message
          </UButton>
        </UForm>
      </div>

      <!-- Right: Worth Reading accordion (appears first on mobile) -->
      <div class="order-1 flex flex-col gap-6 lg:order-2 lg:w-1/2">
        <h2 class="font-semibold !text-2xl text-white tracking-tight">Worth reading</h2>

        <!-- Closed answers stay in the HTML (hidden) so crawlers and answer engines can read them -->
        <UAccordion
          :items="faqItems"
          :unmount-on-hide="false"
          :ui="{ label: 'font-semibold' }"
        >
          <template #body="{ item }">
            <span class="text-white/80">{{ item.content }}</span>
          </template>
        </UAccordion>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import { HOME_FAQ, type HomeFaqId } from '#shared/homeContent'

const schema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Name is required')),
  email: v.pipe(v.string(), v.nonEmpty('Email is required'), v.email('Please enter a valid email')),
  message: v.pipe(v.string(), v.nonEmpty('Message is required')),
})

type Schema = v.InferOutput<typeof schema>

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const pending = ref(false)

async function handleSubmit(_event: FormSubmitEvent<Schema>) {
  pending.value = true
  // TODO: wire up submission logic
  await new Promise((resolve) => setTimeout(resolve, 1000))
  pending.value = false
}

const FAQ_ICONS: Record<HomeFaqId, string> = {
  ai: 'i-heroicons-cpu-chip',
  timeline: 'i-heroicons-clock',
  cost: 'i-heroicons-banknotes',
  cms: 'i-heroicons-cube',
  design: 'i-heroicons-paint-brush',
  ownership: 'i-heroicons-code-bracket',
  brand: 'i-heroicons-sparkles',
  media: 'i-heroicons-film',
}

const faqItems = HOME_FAQ.map(({ id, question, answer }) => ({
  label: question,
  icon: FAQ_ICONS[id],
  content: answer,
}))
</script>
