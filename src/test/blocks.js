// Flattens output blocks to plain text so tests can assert on what a visitor would read
export function textOf(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'text':
        case 'error':
          return block.text
        case 'prompt':
          return block.label
        case 'echo':
          return `${block.prompt} ${block.input}`
        case 'list':
          return block.items.map((item) => item.label).join(' ')
        case 'actions':
          return [block.label, ...block.items].filter(Boolean).join(' ')
        case 'table':
          return block.rows.map((row) => `${row.label} ${row.value ?? ''}`).join('\n')
        case 'tags':
          return block.items.join(' ')
        case 'link':
          return `${block.label} ${block.href}`
        case 'image':
          return block.alt
        case 'gallery':
          return block.images.map((image) => image.alt).join('\n')
        case 'banner':
          return [block.title, block.subtitle, ...block.rows.map((row) => `${row.label} ${row.value}`)].join('\n')
        default:
          return ''
      }
    })
    .join('\n')
}
