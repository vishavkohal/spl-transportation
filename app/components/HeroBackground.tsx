import Image from "next/image";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/home.webp"
        alt="SPL Transportation Airport Transfers"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
