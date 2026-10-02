import Image from 'next/image';

export default function OrPaynterMark({ className = '', variant = 'company' }: { className?: string; variant?: 'company' | 'portal' }) {
  return <Image className={className} src={variant === 'portal' ? '/brand/world-portal-mark.png' : '/brand/company-swiss.png'} width={128} height={128} unoptimized alt={variant === 'portal' ? 'World Portal O/P mark' : 'OrPaynter Swiss O/P mark'} />;
}
