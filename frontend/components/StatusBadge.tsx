type Status = "idle" | "pending" | "running" | "done" | "error";
const map: Record<Status, { label: string; cls: string }> = {
  idle:    { label: "Idle",       cls: "bg-muted text-muted-foreground" },
  pending: { label: "Queued",     cls: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  running: { label: "Running…",   cls: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse" },
  done:    { label: "Done",       cls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  error:   { label: "Error",      cls: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  );
}