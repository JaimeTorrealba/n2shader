<template>
  <div aria-labelledby="contact-section-label" class="w-full py-16 px-6 md:px-12 lg:px-24 min-h-screen flex items-center">
    <span id="contact-section-label" class="sr-only">Contact and FAQ</span>

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
            aria-label="Send your message"
          >
            Send message
          </UButton>
        </UForm>
      </div>

      <!-- Right: Worth Reading accordion (appears first on mobile) -->
      <div class="order-1 flex flex-col gap-6 lg:order-2 lg:w-1/2">
        <h2 class="font-semibold !text-2xl text-white tracking-tight">Worth reading</h2>

        <UAccordion
          :items="faqItems"
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

const faqItems = [
  {
    label: 'How long does it take?',
    icon: 'i-heroicons-clock',
    content: 'It depends on the scope, but most projects land between 4 and 10 weeks. A simple site can be live in less than a month; a complex interactive experience takes longer. Either way you get a realistic timeline upfront — no surprises.',
  },
  {
    label: 'What is the cost?',
    icon: 'i-heroicons-banknotes',
    content: 'Every project is scoped individually. After a short discovery call I send a fixed-price proposal so you know exactly what you are paying before any work begins. No hourly billing, no scope creep invoices.',
  },
  {
    label: 'Is this using a CMS or a website builder?',
    icon: 'i-heroicons-cube',
    content: `No page builders, no drag-and-drop templates. Everything is custom-coded for performance and precision. If you need a CMS to edit content yourself, I integrate purpose-built headless options — you get a clean editing experience without sacrificing quality.`,
  },
  {
    label: `What does it mean that I don't design my own website?`,
    icon: 'i-heroicons-paint-brush',
    content: `It means you don't have to. I handle the visual direction, layout, and interaction design as part of the project. You share references, goals, and feedback — I translate that into a site that looks and feels like you, without you needing to open a design tool.`,
  },
  {
    label: 'Does the code belong to me?',
    icon: 'i-heroicons-code-bracket',
    content: 'Yes, fully. Once the project is delivered and paid, you own everything — source code, assets, and repositories. No licensing fees, no lock-in.',
  },
  {
    label: 'I need a brand — can you help?',
    icon: 'i-heroicons-sparkles',
    content: `Yes. I can cover the full visual identity: logo, typography, colour system, and brand guidelines. Brand work is scoped separately and can be done before or alongside the web project.`,
  },
  {
    label: 'Do you take custom photos or make video edits?',
    icon: 'i-heroicons-film',
    content: `I work with trusted photographers and videographers for shoots, and I handle post-production and editing in-house. If your project needs original imagery or motion content, we can scope that in.`,
  },
]
</script>
