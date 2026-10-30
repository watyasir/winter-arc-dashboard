import type { ReactNode } from "react";

/* The grouped form rows used by the goals and settings pages (same look as the check-in sheet). */

export function Group({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} aria-label={title} className="flex scroll-mt-4 flex-col gap-1.5">
      <h2 className="m-0 ml-4 text-[13px] font-medium text-soft">{title}</h2>
      <div className="rounded-[14px] border border-line bg-card px-4 [&>*+*]:border-t [&>*+*]:border-solid [&>*+*]:border-line">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-h-[52px] items-center justify-between gap-3 py-1.5">
      <span className="text-[17px]">{label}</span>
      {children}
    </label>
  );
}
