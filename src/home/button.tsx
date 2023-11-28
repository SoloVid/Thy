import type { JSX } from "preact"
import { useState } from "preact/hooks"

type ButtonProps = {
  text: string
  centered?: boolean
  extraButtonClass?: string
  href?: string
  newTab?: boolean
  onClick?: () => void
}

export default function Button({
  text,
  centered,
  extraButtonClass,
  href,
  newTab,
  onClick,
  ...remainingProps
}: ButtonProps & JSX.HTMLAttributes<HTMLAnchorElement>) {
  const button = <a class={`button ${extraButtonClass}`} href={href} target={newTab ? "_blank" : undefined} onClick={onClick} style="margin:5px;" {...remainingProps}>{text}</a>
  if (centered) {
    return <div class="text-center">{button}</div>
  }
  return button
}

type TryButtonProps = {
  playgroundUrl: string
  source: string
}

export function TryButton({
  playgroundUrl,
  source,
}: TryButtonProps) {
  return <Button
    text="Try"
    centered
    href={`${playgroundUrl}#b64=${btoa(source.trim())}`}
    newTab
  ></Button>
}

type CopyToClipboardButtonProps = {
  extraButtonClass?: string
  getValue: () => string
  tooltip?: string
  children: string
}

export function CopyToClipboardButton ({ extraButtonClass, getValue, tooltip, children }: CopyToClipboardButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getValue())
      .then(() => {
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 2000) // Hide tooltip after 2 seconds
      })
      .catch(err => {
        console.error('Unable to copy to clipboard:', err);
      })
  }

  return (
    <span style="position:relative;">
      <Button extraButtonClass={extraButtonClass} text={children} onClick={copyToClipboard}></Button>
      {showTooltip && <div className="tooltip">{ tooltip ?? "Copied!" }</div>}
    </span>
  )
}
