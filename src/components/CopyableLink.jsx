import { useState } from 'react'
import { Button } from './ui'

/**
 * A link shown to be handed on, with a button that actually copies it.
 *
 * Its own file rather than a thirteenth entry in ui.jsx: everything in there
 * is stateless and imports nothing, and this needs a flag to say "Copied".
 * Worth keeping that file pure.
 *
 * Used in two places that both hand someone a set-your-password link — the
 * reset screen standing in for an email, and the owner's People screen after
 * adding a new starter.
 */
export function CopyableLink({ link, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked — over plain http on a phone, for instance. The
      // link is selectable on screen, so this is a missing convenience
      // rather than a dead end, and saying nothing is better than an error
      // about a thing they can still do by hand.
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <code
        className="min-w-0 flex-1 truncate rounded-control border border-line-strong bg-surface px-3 py-2.5 text-[12px] text-accent"
        title={link}
      >
        {link}
      </code>
      <Button variant="secondary" size="sm" onClick={copy}>
        {copied ? 'Copied' : (label ?? 'Copy')}
      </Button>
    </div>
  )
}
