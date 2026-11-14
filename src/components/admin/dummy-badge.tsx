export function DummyBadge({ label = "Prototype" }: { label?: string }) {
  return (
    <span
      title="Not connected to the backend yet. Nothing here is saved to the server."
      className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-bold text-amber-900"
    >
      {label}
    </span>
  );
}