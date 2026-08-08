/** User-uploaded URLs — use <img> to avoid next/image hostname crashes in production. */
export default function SafeExternalImage({
  src,
  alt = '',
  className = '',
  fill,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fill?: boolean;
}) {
  if (!src || !src.startsWith('http')) return null;

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
