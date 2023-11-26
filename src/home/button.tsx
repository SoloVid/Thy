import type { JSX } from "preact"

type ButtonProps = {
  text: string
  centered?: boolean
  href?: string
  newTab?: boolean
  onClick?: () => void
}

export default function Button({
  text,
  centered,
  href,
  newTab,
  onClick,
  ...remainingProps
}: ButtonProps & JSX.HTMLAttributes<HTMLAnchorElement>) {
  const button = <a class="button" href={href} target={newTab ? "_blank" : undefined} onClick={onClick} style="margin:5px;" {...remainingProps}>{text}</a>
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
