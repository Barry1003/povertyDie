"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { WealthSceneVariant } from "./wealth-scene";

const LazyWealthScene = dynamic(
  () => import("./wealth-scene").then((module) => module.WealthScene),
  { ssr: false, loading: () => null },
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return false;
    // Release the test context; the real scene uses its own canvas.
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function ImmersiveWealth({
  variant = "overview",
  className = "",
}: {
  variant?: WealthSceneVariant;
  className?: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowBandwidth = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const mobile = window.matchMedia("(max-width: 480px)");

    // Avoid heavy WebGL on very small devices, data-saver mode, or when
    // the visitor explicitly prefers less animation.
    const available = !lowBandwidth && supportsWebGL();
    const update = () => setMotionAllowed(Boolean(available && !reducedMotion.matches && !mobile.matches));
    update();

    reducedMotion.addEventListener("change", update);
    mobile.addEventListener("change", update);

    if (!target.current) return () => {
      reducedMotion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };

    const node = target.current;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return () => {
        reducedMotion.removeEventListener("change", update);
        mobile.removeEventListener("change", update);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "80px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  const animated = visible && motionAllowed;

  return (
    <div
      ref={target}
      className={`immersive-wealth ${animated ? "has-webgl" : ""} ${className}`}
      aria-hidden="true"
    >
      <div className="wealth-fallback">
        <span className="wealth-fallback-orbit orbit-a" />
        <span className="wealth-fallback-orbit orbit-b" />
        <span className="wealth-fallback-medallion"><i /></span>
        <span className="wealth-fallback-coin coin-left" />
        <span className="wealth-fallback-coin coin-right" />
      </div>
      {animated && (
        <div className="wealth-webgl">
          <LazyWealthScene variant={variant} />
        </div>
      )}
    </div>
  );
}
