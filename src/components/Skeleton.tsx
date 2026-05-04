"use client";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-maktub-border/50 ${className || ""}`}
    />
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-maktub-panel rounded-2xl p-5 border border-maktub-border">
      <div className="flex items-start gap-4 mb-4">
        <Pulse className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Pulse className="h-5 w-36" />
          <Pulse className="h-4 w-48" />
        </div>
        <Pulse className="w-8 h-8 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <Pulse className="h-4 w-40" />
        <Pulse className="h-4 w-44" />
        <Pulse className="h-4 w-36" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Pulse className="h-7 w-16 rounded-full" />
        <Pulse className="h-7 w-14 rounded-full" />
        <Pulse className="h-7 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function ProfileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function InterestRowSkeleton() {
  return (
    <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4 flex items-center gap-4">
      <Pulse className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Pulse className="h-4 w-32" />
        <Pulse className="h-3.5 w-48" />
      </div>
      <Pulse className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function InterestListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <InterestRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="bg-maktub-panel rounded-xl border border-maktub-border p-4 flex items-center gap-3">
      <Pulse className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Pulse className="h-4 w-56" />
        <Pulse className="h-3 w-24" />
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6">
        <div className="flex items-start gap-4 mb-6">
          <Pulse className="w-20 h-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-6 w-40" />
            <Pulse className="h-4 w-56" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Pulse className="h-4 w-28 shrink-0" />
              <Pulse className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
