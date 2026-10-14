// Output blocks: plain objects that OutputBlock.vue knows how to render
export const text = (value, tone) => (tone ? { type: 'text', text: value, tone } : { type: 'text', text: value })
export const error = (value) => ({ type: 'error', text: value })
export const list = (items) => ({ type: 'list', items }) // [{ label, kind, cmd? }]
export const actions = (label, cmds) => ({ type: 'actions', label, items: cmds }) // cmds: string[]
export const table = (rows) => ({ type: 'table', rows }) // [{ label, value, href?, cmd? }]
export const tags = (items) => ({ type: 'tags', items })
export const link = (label, href, download = false) => ({ type: 'link', label, href, download })
export const image = (src, alt) => ({ type: 'image', src, alt })
export const gallery = (images) => ({ type: 'gallery', images }) // [{ src, alt }]
export const prompt = (label) => ({ type: 'prompt', label })
