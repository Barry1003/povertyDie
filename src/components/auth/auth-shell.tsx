import { BrandLogo } from "@/components/brand/brand-logo";
import Link from "next/link";
import type { ReactNode } from "react";
import { ImmersiveWealth } from "@/components/3d/immersive-wealth";

export function AuthShell({
  eyebrow, title, description, children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#FAF5FF] text-[#2E1065] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <aside className="relative hidden min-h-screen flex-col overflow-hidden bg-[#2E1065] p-10 text-white lg:flex xl:p-14">
        <Link href="/" className="z-10 flex w-fit items-center gap-3"><BrandLogo inverted /></Link>
        <div className="relative z-10 mt-14 max-w-lg">
          <p className="text-xs font-bold tracking-[.2em] text-[#D8B4FE]">A SHARED FUTURE</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.16] tracking-tight xl:text-6xl">
            Grow together. <span className="text-[#D8B4FE]">Know where you stand.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#D3BBE8]">
            Your private circle, shared contributions, rotating custody, and clear records—built for friends who invest together.
          </p>
        </div>
        <div className="relative mt-auto h-[36vh] min-h-[210px] max-h-[440px] overflow-hidden">
          <ImmersiveWealth variant="welcome" />
        </div>
        <p className="z-10 mt-4 text-xs text-[#DDD6FE]">Sign up is open. Private group finances remain invitation-only.</p>
      </aside>
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-7 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden"><BrandLogo /></Link>
          <div className="rounded-3xl border border-[#E9D5FF] bg-white p-6 shadow-[0_18px_45px_rgba(13,55,40,0.07)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.17em] text-[#7C3AED]">{eyebrow}</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#2B0D45] sm:text-3xl">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#7137A4]">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-[#7A3BB2]">
            Sign-in is managed securely by Neon Auth. Account creation alone does not provide access to a private group's financial records.
          </p>
        </div>
      </section>
    </main>
  );
}
