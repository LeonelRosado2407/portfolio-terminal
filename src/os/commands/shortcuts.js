import { cvFiles, experience, skillGroups } from '../../data/profile'
import { runLine } from '../shell/run'

const newestFirst = [...experience].reverse().map((item) => item.file).join(' ')
const allSkills = skillGroups.map((group) => `${group.id}.txt`).join(' ')

// Friendly commands for visitors who don't know the tree; each one expands into real commands
const shortcut = (name, line) => ({
  name,
  summary: (t) => t(`term.cmd.${name}`),
  async *run(ctx) {
    yield* runLine(typeof line === 'function' ? line(ctx) : line, ctx)
  },
})

export default [
  shortcut('about', 'cat ~/about.txt'),
  shortcut('projects', 'cd ~/projects && cat README.md'),
  shortcut('experience', `cd ~/experience && cat ${newestFirst}`),
  shortcut('skills', `cd ~/skills && cat ${allSkills}`),
  shortcut('services', 'cat ~/services.txt'),
  shortcut('cv', (ctx) => `open ~/cv/${(cvFiles.find((cv) => cv.locale === ctx.locale) ?? cvFiles[0]).file}`),
  shortcut('contact', 'cd ~/contact && cat contact.txt'),
]
