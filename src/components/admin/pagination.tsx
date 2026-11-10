export function Pagination(props: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPage: (p: number) => void;
}) {
  const { page, totalPages, total, pageSize, hasPrev, hasNext, onPage } = props;
  if (total === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600 dark:text-white/70">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={!hasPrev} onClick={() => onPage(Math.max(1, page - 1))} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" disabled={!hasNext} onClick={() => onPage(page + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}