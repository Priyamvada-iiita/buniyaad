import { phoneTelHref } from '@/lib/phone';

export default function PhoneLink({
  phone,
  className = 'text-rebar-600 font-semibold hover:underline',
}: {
  phone: string | null | undefined;
  className?: string;
}) {
  if (!phone?.trim()) return null;
  const href = phoneTelHref(phone);
  if (!href) return <span>📞 {phone}</span>;
  return (
    <a href={href} className={className}>
      📞 {phone}
    </a>
  );
}
