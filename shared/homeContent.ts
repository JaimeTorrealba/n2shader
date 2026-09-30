// Single source for the home page copy. The components render it, and the
// agent-facing Markdown (/index.md, /llms.txt, /llms-full.txt) and the JSON-LD
// are built from it, so what agents read never drifts from what people see.
// Placeholder copy (hero lede, About) stays out of here until it's real.

export const BRAND_NAME = 'N2Shader'
export const HOME_TITLE = 'N2Shader — Immersive web development & design studio'
export const HOME_SUMMARY =
  'N2Shader is a small creative studio building immersive websites: shader-driven visuals, interactive 3D and motion design, custom-coded to be fast and accessible.'

export type HomeService = {
  title: string
  items: string[]
}

export const HOME_SERVICES: HomeService[] = [
  {
    title: 'Immersive Web Experiences',
    items: [
      '3D Models (web optimized)',
      'Shader-driven visuals',
      'Interactive 3D environments',
      'Digital twins',
      'VR-ready experiences',
    ],
  },
  {
    title: 'Creative UI/UX Development',
    items: [
      'Motion design',
      'Scroll-driven animations',
      'Micro-interaction polish',
      'Design systems',
      'Interactive prototypes',
    ],
  },
  {
    title: 'Fundamentals',
    items: [
      'Accessibility-first build',
      'AI visibility',
      'SEO',
      'User centric design',
      'Responsive design',
    ],
  },
]

export type ProcessStepId = 'discuss' | 'agreement' | 'design' | 'aftercare'

export type ProcessStep = {
  id: ProcessStepId
  label: string
  title: string
  description: string
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'discuss',
    label: "Let's discuss",
    title: 'Your adventure starts here',
    description:
      'After the first contact we get to know your brand and requirements, then the team sends some references and ideas. This first guide is free.',
  },
  {
    id: 'agreement',
    label: "We're serious now",
    title: 'Gathering',
    description:
      'Once a direction is accepted, we sign a contract and ask for 50% of the payment in advance to start. Then we gather everything we need (assets, texts, etc.).',
  },
  {
    id: 'design',
    label: 'The exciting part!',
    title: 'The back and forth',
    description:
      'The team sends design proposals, which go back and forth a couple of times. Then, based on the selected design, we provide 3 simple websites.',
  },
  {
    id: 'aftercare',
    label: 'Post service',
    title: 'Post-sale',
    description: 'After the project is finished, we stay committed with a generous maintenance plan.',
  },
]

export type HomeFaqId = 'ai' | 'timeline' | 'cost' | 'cms' | 'design' | 'ownership' | 'brand' | 'media'

export type HomeFaqItem = {
  id: HomeFaqId
  question: string
  answer: string
}

export const HOME_FAQ: HomeFaqItem[] = [
  {
    id: 'ai',
    question: 'If I can build sites with AI, why do I need N2Shader?',
    answer:
      "AI is great at producing something that works — and that looks like everything else. What it can't give you is taste, intent, and the hundred small decisions that make a site feel crafted: the easing on a transition, the rhythm of the type, how it behaves on a slow phone. I use AI as a tool too, but you're hiring the judgment behind it — and someone accountable for the result long after launch.",
  },
  {
    id: 'timeline',
    question: 'How long does it take?',
    answer:
      'It depends on the scope, but most projects land between 4 and 10 weeks. A simple site can be live in less than a month; a complex interactive experience takes longer. Either way you get a realistic timeline upfront — no surprises.',
  },
  {
    id: 'cost',
    question: 'What is the cost?',
    answer:
      'Every project is scoped individually. After a short discovery call I send a fixed-price proposal so you know exactly what you are paying before any work begins. No hourly billing, no scope creep invoices.',
  },
  {
    id: 'cms',
    question: 'Is this using a CMS or a website builder?',
    answer:
      'No page builders, no drag-and-drop templates. Everything is custom-coded for performance and precision. If you need a CMS to edit content yourself, I integrate purpose-built headless options — you get a clean editing experience without sacrificing quality.',
  },
  {
    id: 'design',
    question: "What does it mean that I don't design my own website?",
    answer:
      "It means you don't have to. I handle the visual direction, layout, and interaction design as part of the project. You share references, goals, and feedback — I translate that into a site that looks and feels like you, without you needing to open a design tool.",
  },
  {
    id: 'ownership',
    question: 'Does the code belong to me?',
    answer:
      'Yes, fully. Once the project is delivered and paid, you own everything — source code, assets, and repositories. No licensing fees, no lock-in.',
  },
  {
    id: 'brand',
    question: 'I need a brand — can you help?',
    answer:
      'Yes. I can cover the full visual identity: logo, typography, colour system, and brand guidelines. Brand work is scoped separately and can be done before or alongside the web project.',
  },
  {
    id: 'media',
    question: 'Do you take custom photos or make video edits?',
    answer:
      'I work with trusted photographers and videographers for shoots, and I handle post-production and editing in-house. If your project needs original imagery or motion content, we can scope that in.',
  },
]
