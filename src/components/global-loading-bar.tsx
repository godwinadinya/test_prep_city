"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/api-activity";

export function GlobalLoadingBar() {
  const { active, slow } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <>
      <div
        aria-hidden
        className={
          "pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden transition-opacity duration-200 " +
          (active > 0 ? "opacity-100" : "opacity-0")
        }
      >
        <div className="tpc-bar h-full w-1/3 bg-gold-500" />
      </div>
      {slow ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-navy-900 px-4 py-2 text-xs font-semibold text-white shadow-lg lg:bottom-6"
        >
          Waking up the server… this can take up to a minute.
        </div>
      ) : null}
    </>
  );
}