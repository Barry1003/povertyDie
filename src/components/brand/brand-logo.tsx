import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  inverted?: boolean;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Shared Poverty Die brand lockup. The emblem is cropped directly from the
 * approved purple community-growth logo and is also used for app icons.
 */
export function BrandLogo({
  compact = false,
  inverted = false,
  className = "",
  size = "md",
}: BrandLogoProps) {
  const dimension = size === "sm" ? 40 : 44;

  return (
    <span className={`inline-flex min-w-0 items-center gap-3 ${className}`}>
      <Image
        src="/brand/poverty-die-mark.png"
        alt={compact ? "Poverty Die" : ""}
        width={dimension}
        height={dimension}
        priority
        className={`shrink-0 rounded-xl bg-white object-contain shadow-sm ring-1 ring-violet-200/50 ${size === "sm" ? "h-10 w-10" : "h-11 w-11"}`}
      />
      {!compact && (
        <span className="min-w-0 leading-tight">
          <strong className={`block truncate text-sm font-black tracking-[.08em] sm:text-base ${inverted ? "text-white" : "text-[#2E1065]"}`}>
            POVERTY <span className={inverted ? "text-[#D8B4FE]" : "text-[#7C3AED]"}>DIE</span>
          </strong>
          <small className={`mt-1 block truncate text-[9px] font-medium tracking-[.18em] ${inverted ? "text-[#DDD6FE]" : "text-[#77658F]"}`}>
            WEALTH COLLECTIVE
          </small>
        </span>
      )}
    </span>
  );
}
