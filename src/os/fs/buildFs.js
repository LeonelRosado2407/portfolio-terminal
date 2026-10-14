import * as b from '../blocks'
import {
  clientProjects, contact, cvFiles, experience, featuredProjects, services, skillGroups,
} from '../../data/profile'

const dir = (name, children) => ({ type: 'dir', name, children })
const file = (name, content) => ({ type: 'file', name, content })
const linkNode = (name, href, action, alt) => ({ type: 'link', name, href, action, ...(alt && { alt }) })
const exec = (name, command) => ({ type: 'exec', name, command })
const next = (t, ...cmds) => b.actions(t('term.next'), cmds)

function aboutFile(t) {
  return file('about.txt', [
    b.text(t('about.title'), 'accent'),
    b.text(`${t('about.subtitle')} ${t('about.subtitle_2')}.`, 'dim'),
    b.text(t('about.bio_1')),
    b.text(t('about.bio_2')),
    b.text(t('about.bio_3')),
    next(t, 'experience', 'projects', 'skills', 'contact'),
  ])
}

function skillsDir(t) {
  return dir('skills', skillGroups.map((group) => file(`${group.id}.txt`, [
    b.text(t(`skills.groups.${group.id}`), 'accent'),
    b.tags(group.items),
  ])))
}

function experienceDir(t) {
  return dir('experience', experience.map(({ file: name, key }) => {
    const k = `about.experiences.${key}`
    return file(name, [
      b.text(`${t(`${k}.position`)} · ${t(`${k}.company`)}`, 'accent'),
      b.text(t(`${k}.period`), 'dim'),
      b.text(t(`${k}.description`)),
    ])
  }))
}

function featuredDir(t, project) {
  const k = `projects.featured.${project.key}`
  const home = `~/projects/${project.id}`
  return dir(project.id, [
    file('README.md', [
      b.text(`# ${project.title}`, 'accent'),
      b.text(t(`${k}.desc`)),
      b.text(t('term.fs.highlights'), 'dim'),
      b.text(['h1', 'h2', 'h3', 'h4'].map((h) => `• ${t(`${k}.${h}`)}`).join('\n')),
      b.text(t('term.fs.stack'), 'dim'),
      b.tags(project.stack),
      b.gallery(project.screenshots.map((shot) => ({ src: shot.src, alt: t(`${k}.${shot.altKey}`) }))),
      next(t, `open ${home}/demo.url`, `open ${home}/repo.url`),
    ]),
    linkNode('demo.url', project.demo, 'open'),
    linkNode('repo.url', project.repo, 'open'),
    dir('screenshots', project.screenshots.map((shot) =>
      linkNode(shot.file, shot.src, 'image', t(`${k}.${shot.altKey}`)))),
  ])
}

function clientFile(t, project) {
  const k = `projects.items.${project.key}`
  return file(project.file, [
    b.text(t(`${k}.title`), 'accent'),
    b.text(`${t(`${k}.kind`)} · ${t('projects.private_note')}`, 'dim'),
    b.text(t(`${k}.desc`)),
    b.text(`${t('term.fs.role')}: ${t(`${k}.role`)}`),
    b.tags(project.tags),
  ])
}

function projectsDir(t) {
  return dir('projects', [
    file('README.md', [
      b.text(t('projects.title'), 'accent'),
      b.text(t('projects.personal_label'), 'dim'),
      b.table(featuredProjects.map((p) => ({
        label: `${p.id}/`, value: p.title, cmd: `cat ~/projects/${p.id}/README.md`,
      }))),
      b.text(t('projects.client_label'), 'dim'),
      b.table(clientProjects.map((p) => ({
        label: p.file, value: t(`projects.items.${p.key}.title`), cmd: `cat ~/projects/client-work/${p.file}`,
      }))),
    ]),
    dir('client-work', clientProjects.map((project) => clientFile(t, project))),
    ...featuredProjects.map((project) => featuredDir(t, project)),
  ])
}

function servicesFile(t) {
  return file('services.txt', [
    b.text(t('services.title'), 'accent'),
    ...services.flatMap((key) => [
      b.text(`▸ ${t(`services.items.${key}.title`)}`),
      b.text(t(`services.items.${key}.desc`), 'dim'),
    ]),
    next(t, 'contact', 'projects'),
  ])
}

function contactDir(t) {
  return dir('contact', [
    file('contact.txt', [
      b.text(t('term.contact.title'), 'accent'),
      b.text(t('contact.description')),
      b.table([
        { label: t('contact.items.email'), value: contact.email, href: `mailto:${contact.email}` },
        { label: t('contact.items.phone'), value: contact.phone },
        { label: t('contact.items.location'), value: t('contact.items.location_value') },
        { label: t('contact.items.github'), value: contact.githubUser, href: contact.github },
        { label: t('contact.items.linkedin'), value: contact.linkedinName, href: contact.linkedin },
      ]),
      b.actions(t('term.contact.send'), ['send-message']),
      next(t, 'cv'),
    ]),
    exec('send-message.sh', 'send-message'),
  ])
}

// The whole portfolio as a tiny Unix tree. Rebuilt on language change; paths never depend on the language.
export function buildFs(t) {
  return dir('', [
    dir('root', [
      aboutFile(t),
      contactDir(t),
      dir('cv', cvFiles.map((cv) => linkNode(cv.file, cv.href, 'download'))),
      experienceDir(t),
      projectsDir(t),
      servicesFile(t),
      skillsDir(t),
      file('.secrets', [b.text(t('term.egg.secrets'))]),
    ]),
  ])
}
