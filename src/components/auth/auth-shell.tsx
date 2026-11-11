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
    <main className="min-h-screen bg-[#f3f8f5] text-[#173c32] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <aside className="relative hidden min-h-screen flex-col overflow-hidden bg-[#143c33] p-10 text-white lg:flex xl:p-14">
        <Link href="/" className="z-10 flex w-fit items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#16a27b] text-xl font-black">P</span>
          <span><strong className="block text-lg tracking-[.12em]">POVERTY DIE</strong>
            <small className="text-xs tracking-[.18em] text-[#a3d9c1]">WEALTH COLLECTIVE</small>
          </span>
        </Link>
        <div className="relative z-10 mt-14 max-w-lg">
          <p className="text-xs font-bold tracking-[.2em] text-[#e3bf7a]">A SHARED FUTURE</p>
          <h1 className="mt-4 text-5xl font-black leading-[1.16] tracking-tight xl:text-6xl">
            Grow together. <span className="text-[#8be2bb]">Know where you stand.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#c5ded1]">
            Your private circle, shared contributions, rotating custody, and clear records—built for friends who invest together.
          </p>
        </div>
        <div className="relative mt-auto h-[36vh] min-h-[210px] max-h-[440px] overflow-hidden">
          <ImmersiveWealth variant="welcome" />
        </div>
        <p className="z-10 mt-4 text-xs text-[#b2d6c6]">Sign up is open. Private group finances remain invitation-only.</p>
      </aside>
      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-7 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#16856e] text-xl font-black text-white">P</span>
            <span><strong className="block text-base">POVERTY DIE</strong>
              <small className="text-xs text-[#587d6e]">WEALTH COLLECTIVE</small>
            </span>
          </Link>
          <div className="rounded-3xl border border-[#d8e8df] bg-white p-6 shadow-[0_18px_45px_rgba(13,55,40,0.07)] sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.17em] text-[#14866e]">{eyebrow}</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#173b30] sm:text-3xl">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#617a70]">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-5 text-center text-xs leading-relaxed text-[#698476]">
            Sign-in is managed securely by Neon Auth. Account creation alone does not provide access to a private group's financial records.
          </p>
        </div>
      </section>
    </main>
  );
}
