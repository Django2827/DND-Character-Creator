// Small presentational pieces shared by the sheet and the builder.

function inline(t) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  )
}

// Renders SRD text: paragraphs, "- " bullet lists, and **bold**.
export function Rich({ text }) {
  if (!text) return null
  const blocks = []
  let list = null
  text.split('\n').forEach((line, i) => {
    if (/^[-•]\s+/.test(line)) {
      ;(list ??= []).push(line.replace(/^[-•]\s+/, ''))
      return
    }
    if (list) {
      blocks.push({ type: 'ul', items: list, key: `ul${i}` })
      list = null
    }
    blocks.push({ type: 'p', text: line, key: `p${i}` })
  })
  if (list) blocks.push({ type: 'ul', items: list, key: 'ul-end' })

  return (
    <div className="rich">
      {blocks.map((b) =>
        b.type === 'ul' ? (
          <ul key={b.key}>
            {b.items.map((t, j) => (
              <li key={j}>{inline(t)}</li>
            ))}
          </ul>
        ) : (
          <p key={b.key}>{inline(b.text)}</p>
        )
      )}
    </div>
  )
}

// A titled box, like the sections on a paper sheet.
export function Box({ title, children, className = '' }) {
  return (
    <section className={`box ${className}`}>
      {children}
      {title && <h3 className="box__title">{title}</h3>}
    </section>
  )
}

// A row of checkboxes: the first `used` are ticked.
export function Pips({ total, used, onChange, label }) {
  return (
    <span className="pips" role="group" aria-label={label}>
      {Array.from({ length: total }, (_, n) => (
        <input
          key={n}
          type="checkbox"
          aria-label={`${label} ${n + 1}`}
          checked={n < used}
          onChange={() => onChange(n < used ? n : n + 1)}
        />
      ))}
    </span>
  )
}
