import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  return (
    <main className={cn("flex-1 overflow-auto px-8 py-6", className)}>
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </main>
  );
}
