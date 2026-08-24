interface BrandLogoProps {
  className?: string
  variant?: 'dark' | 'light'
}

/**
 * Renders public/assets/logo/garnier-logo.svg (dark) or garnier-logo-white.svg
 * (light, for use on dark backgrounds). A hand-drawn placeholder wordmark
 * ships until real logo files are dropped in — see
 * public/assets/logo/README.md for exact filenames.
 */
export default function BrandLogo({ className = '', variant = 'dark' }: BrandLogoProps) {
  const src = variant === 'light' ? '/assets/logo/garnier-logo-white.svg' : '/assets/logo/garnier-logo.svg'
  return (
    <img
      src={src}
      alt="Garnier"
      className={className}
      draggable={false}
      onError={(e) => {
        // If a real logo hasn't been dropped in yet, don't show a broken
        // image icon on the kiosk — hide it gracefully.
        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
