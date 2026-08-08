import SafeExternalImage from '@/components/SafeExternalImage';
import { isLocalImage } from '@/lib/seller-images';

export default function SellerImage({
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
  if (!src) return null;

  if (isLocalImage(src)) {
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

  return <SafeExternalImage src={src} alt={alt} className={className} fill={fill} />;
}
