import Image from 'next/image';
import logo from '../public/logo.png';

export function Logo({ size }: { size: number }) {
  return (
    <Image
      src={logo}
      alt=""
      width={size}
      height={size}
      className="logo-tile"
      unoptimized
      priority
    />
  );
}
