import Image from 'next/image';

export default function OrPaynterMark({ className = '' }: { className?: string }) {
  return <Image className={className} src="/brand/orpaynter-mark.png" width={128} height={128} unoptimized alt="OrPaynter orbital O/P mark" />;
}
