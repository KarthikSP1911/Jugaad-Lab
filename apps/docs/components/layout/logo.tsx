import Image from 'next/image';
import darkLogo from '../../public/logo-dark.svg';
import logo from '../../public/logo.svg';

// Both variants are rendered; the theme tokens show one of them.
export function Logo({ size }: { size: number }) {
  return [
    { src: logo, className: 'logo-light' },
    { src: darkLogo, className: 'logo-dark' },
  ].map(({ src, className }) => (
    <Image
      key={className}
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      unoptimized
      priority
    />
  ));
}
