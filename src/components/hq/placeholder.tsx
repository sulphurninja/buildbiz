import { hqModuleById } from "./nav";

export function ModulePlaceholder({ id }: { id: string }) {
  const meta = hqModuleById[id];
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-d-accent">{meta?.group ?? "HQ"}</p>
      <h1 className="mt-1.5 font-serif text-[40px] font-medium leading-tight">{meta?.label ?? id}</h1>
      <p className="mt-2 text-[14.5px] text-d-mute">{meta?.blurb}</p>
      <div className="desk-card mt-8 p-10 text-center text-[14px] text-d-mute">This module is being set up.</div>
    </div>
  );
}
