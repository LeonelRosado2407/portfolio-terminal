// Non-translated portfolio data (ported from the v1 components). Translatable copy stays in i18n.
import dulceHome from '../assets/img/projects/dulce-tentacion/home.jpg'
import dulceMenu from '../assets/img/projects/dulce-tentacion/menu.jpg'
import dulceSearch from '../assets/img/projects/dulce-tentacion/mobile-busqueda.jpg'
import dulceLightbox from '../assets/img/projects/dulce-tentacion/mobile-lightbox.jpg'
import nexusHero from '../assets/img/projects/nexus/hero.jpg'
import nexusPricing from '../assets/img/projects/nexus/pricing.jpg'
import nexusDialog from '../assets/img/projects/nexus/dialog.jpg'
import nexusMobile from '../assets/img/projects/nexus/mobile.jpg'

export const contact = {
  email: 'leonelrosado2407@gmail.com',
  phone: '+52 999 342 7756',
  github: 'https://github.com/LeonelRosado2407',
  githubUser: 'LeonelRosado2407',
  linkedin: 'https://www.linkedin.com/in/no%C3%A9-leonel-rosado-quintal-20a701263',
  linkedinName: 'Noé Leonel Rosado Quintal',
}

export const coreStack = [
  'Vue.js 3',
  'TypeScript',
  'PHP / Laravel',
  'Node.js / Express',
  'React',
  'Tailwind CSS',
  'MySQL',
]

// Titles come from i18n: skills.groups.<id>
export const skillGroups = [
  { id: 'frontend', items: ['JavaScript', 'TypeScript', 'Vue 3', 'React', 'Astro', 'HTML5 / CSS3', 'Tailwind CSS'] },
  { id: 'backend', items: ['PHP', 'Laravel', 'Node.js / Express', 'Slim 4', 'MySQL / MariaDB', 'REST APIs'] },
  {
    id: 'testing',
    items: ['Vitest', 'Playwright', 'axe-core', 'Lighthouse CI', 'ESLint / Prettier', 'GitHub Actions'],
  },
  { id: 'tools', items: ['Git / GitHub', 'Vite', 'Vercel', 'SCRUM'] },
]

// Oldest first; copy lives in about.experiences.<key>
export const experience = [
  { file: '01-netlancers-intern.txt', key: 'experience_1' },
  { file: '02-netlancers-jr.txt', key: 'experience_2' },
  { file: '03-intersoft.txt', key: 'experience_3' },
  { file: '04-tire-base.txt', key: 'experience_4' },
]

// Copy lives in projects.featured.<key>
export const featuredProjects = [
  {
    id: 'dulce-tentacion',
    title: 'Dulce Tentación',
    key: 'dulce',
    stack: ['Vue 3', 'TypeScript', 'Tailwind v4', 'Pinia', 'Vue Router', 'Vitest', 'Playwright'],
    demo: 'https://dulce.leonelrosado.dev',
    repo: 'https://github.com/LeonelRosado2407/dessert-page',
    screenshots: [
      { file: 'home.jpg', src: dulceHome, altKey: 'alt_home' },
      { file: 'menu.jpg', src: dulceMenu, altKey: 'alt_menu' },
      { file: 'mobile-search.jpg', src: dulceSearch, altKey: 'alt_search' },
      { file: 'mobile-lightbox.jpg', src: dulceLightbox, altKey: 'alt_lightbox' },
    ],
  },
  {
    id: 'nexus',
    title: 'Nexus',
    key: 'nexus',
    stack: ['Astro 6', 'TypeScript', 'Tailwind v4', 'Vitest', 'Playwright', 'axe-core', 'Lighthouse CI'],
    demo: 'https://nexus.leonelrosado.dev',
    repo: 'https://github.com/LeonelRosado2407/Nexus-Landing-Page',
    screenshots: [
      { file: 'hero.jpg', src: nexusHero, altKey: 'alt_hero' },
      { file: 'pricing.jpg', src: nexusPricing, altKey: 'alt_pricing' },
      { file: 'dialog.jpg', src: nexusDialog, altKey: 'alt_dialog' },
      { file: 'mobile.jpg', src: nexusMobile, altKey: 'alt_mobile' },
    ],
  },
]

// Copy lives in projects.items.<key>
export const clientProjects = [
  { file: 'recurring-payments.txt', key: 'project_1', tags: ['PHP', 'JavaScript', 'MySQL', 'Payments / POS'] },
  { file: 'ecom-redesign.txt', key: 'project_2', tags: ['JavaScript', 'Vue.js 3', 'CSS3', 'UI / UX'] },
  { file: 'accounts-receivable.txt', key: 'project_3', tags: ['PHP', 'JavaScript', 'MySQL', 'PayPal'] },
  { file: 'erp-expenses.txt', key: 'project_4', tags: ['PHP', 'JavaScript', 'MySQL', 'SCRUM'] },
]

// Copy lives in services.items.<key>
export const services = ['service_1', 'service_2', 'service_3', 'service_4']

export const cvFiles = [
  { file: 'leonel-rosado-cv-en.pdf', href: '/cv/leonel-rosado-cv-en.pdf', locale: 'en' },
  { file: 'leonel-rosado-cv-es.pdf', href: '/cv/leonel-rosado-cv-es.pdf', locale: 'es' },
]
