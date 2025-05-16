import { useState } from "react";
import Image from "next/image";
import { BadgeResponse } from "@/app/(auth)/hub/api";
import { BlurFade } from "@/components/magicui/blur-fade";

interface BadgeImageProps {
  badge: BadgeResponse;
  isHovered: boolean;
}

export const BadgeImage = ({ badge, isHovered }: BadgeImageProps) => {
  const [imgSrc, setImgSrc] = useState(
    badge.imgName && badge.imgName.trim() !== ""
      ? `/images/badges/${badge.imgName}`
      : "/images/favicon-mabinogi-mobile.png",
  );

  return (
    <BlurFade delay={0.25} inView className={"w-auto h-[100%]"}>
      <Image
        src={imgSrc}
        alt={badge.badge.name}
        fill
        className="object-cover transition-transform duration-500"
        style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        onError={() => setImgSrc("/images/favicon-mabinogi-mobile.png")}
      />
    </BlurFade>
  );
};
