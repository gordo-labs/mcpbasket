interface SourceControlProps {
  draftSource: string;
  onConnect: () => void;
  onRefresh: () => void;
  onSourceChange: (value: string) => void;
}

export function SourceControl({
  draftSource,
  onConnect,
  onRefresh,
  onSourceChange,
}: SourceControlProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor="source" className="text-xs font-semibold uppercase text-[var(--muted)]">
        Source
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_84px_44px] gap-2 max-sm:grid-cols-[minmax(0,1fr)_72px_44px]">
        <input
          id="source"
          value={draftSource}
          onChange={(event) => onSourceChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onConnect();
          }}
          className="h-11 min-w-0 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--green)]"
          spellCheck={false}
        />
        <button
          onClick={onConnect}
          className="h-11 rounded-md border border-[var(--line)] bg-white text-sm font-semibold text-[var(--ink)] hover:border-[#9fac9f]"
        >
          Connect
        </button>
        <button
          onClick={onRefresh}
          className="h-11 rounded-md border border-[var(--line)] bg-white text-lg font-semibold text-[var(--ink)] hover:border-[#9fac9f]"
          aria-label="Refresh basket"
          title="Refresh basket"
        >
          <span aria-hidden="true">&#8635;</span>
        </button>
      </div>
    </div>
  );
}
