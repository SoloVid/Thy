import type { ComponentChildren, JSX } from "preact"
import { useState } from "preact/hooks"

type ButtonProps = {
  children: ComponentChildren
  centered?: boolean
  extraButtonClass?: string
  href?: string
  newTab?: boolean
  onClick?: () => void
}

export default function Button({
  children,
  centered,
  extraButtonClass,
  href,
  newTab,
  onClick,
  ...remainingProps
}: ButtonProps & JSX.HTMLAttributes<HTMLAnchorElement>) {
  const button = (
    <a
      class={`button ${extraButtonClass}`}
      href={href}
      target={newTab ? "_blank" : undefined}
      onClick={onClick}
      {...remainingProps}
    >
      {children}
    </a>
  )
  if (centered) {
    return <div class="text-center">{button}</div>
  }
  return button
}

type TryButtonProps = {
  playgroundUrl: string
  source: string
}

export function TryButton({ playgroundUrl, source }: TryButtonProps) {
  return (
    <Button
      centered
      href={`${playgroundUrl}#b64=${btoa(source.trim())}`}
      newTab
    >
      Try
    </Button>
  )
}

type CopyToClipboardButtonProps = {
  extraButtonClass?: string
  getValue: () => string
  title?: string
  tooltip?: string
  children: ComponentChildren
}

export function CopyToClipboardButton({
  extraButtonClass,
  getValue,
  title,
  tooltip,
  children,
}: CopyToClipboardButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(getValue())
      .then(() => {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 2000) // Hide tooltip after 2 seconds
      })
      .catch((err) => {
        console.error("Unable to copy to clipboard:", err)
      })
  }

  return (
    <Button
      extraButtonClass={extraButtonClass}
      onClick={copyToClipboard}
      title={title}
    >
      {children}
      {showTooltip && <div className="tooltip">{tooltip ?? "Copied!"}</div>}
    </Button>
  )
}
