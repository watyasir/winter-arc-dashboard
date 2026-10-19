import Link from "next/link";

/* Pieces shared by the workout log and the body check: the same sheet look as the check-in. */

export type Status = "editing" | "saved" | { error: string };

/** 44px pill text box, like the check-in's number boxes. */
export const fieldClass = "h-11 rounded-full border-0 bg-fill-strong px-4 text-[17px] text-ink placeholder:text-sub";

/** Cancel · title and date · Save (the one primary button; turns sage "Saved ✓"). */
export function SheetHeader({
  title,
  subtitle,
  cancelHref,
  onSave,
  saving,
  saved,
}: {
  title: string;
  subtitle: string;
  cancelHref: string;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <>
      <div aria-hidden="true" className="h-[5px] w-9 self-center rounded-full bg-rule" />
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Link href={cancelHref} className="flex min-h-11 items-center text-[17px] text-brand-text no-underline hover:text-brand-hover">
          Cancel
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="m-0 text-[17px] font-semibold">{title}</h1>
          <span className="text-xs text-sub">{subtitle}</span>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`min-h-11 cursor-pointer justify-self-end rounded-full border-0 px-4 text-[17px] font-semibold text-white transition-colors motion-reduce:transition-none ${
            saved ? "bg-sage-text" : "bg-brand hover:bg-brand-hover"
          }`}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </header>
    </>
  );
}

export function StatusMessages({ status, savedText }: { status: Status; savedText: string }) {
  return (
    <>
      {status === "saved" ? (
        <p role="status" className="m-0 rounded-2xl bg-sage/14 px-4 py-3 text-[15px] text-sage-text">
          {savedText}
        </p>
      ) : (
        <p role="status" className="sr-only" />
      )}
      {typeof status === "object" && (
        <p role="alert" className="m-0 rounded-2xl bg-coral/12 px-4 py-3 text-[15px] text-coral-text">
          {status.error}
        </p>
      )}
    </>
  );
}
