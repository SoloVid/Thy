type ButtonProps = {
  text: string
  centered?: boolean
  extraButtonClass?: string
  href?: string
  newTab?: boolean
  onclick?: string
}

export function generateButton({
  text,
  centered,
  extraButtonClass,
  href,
  newTab,
  onclick,
}: ButtonProps) {
  const button = `<a
  class="button ${extraButtonClass}"
  href="${href}"
  target="${newTab ? "_blank" : ""}"
  onclick="${onclick}"
>
  ${text}
</a>`
  if (centered) {
    return `<div class="text-center">${button}</div>`
  }
  return button
}

type TryButtonProps = {
  playgroundUrl: string
  source: string
}

export function generateTryButton({ playgroundUrl, source }: TryButtonProps) {
  return generateButton({
    text: "Try",
    centered: true,
    href: `${playgroundUrl}#b64=${btoa(source.trim())}`,
    newTab: true,
  })
}
