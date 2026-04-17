import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/common/page-transition";

export function AppShell({
  role,
  children,
}: {
  role: "learner" | "recruiter" | "admin";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav role={role} />
      <div className="flex pt-16">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <PageTransition className="mx-auto max-w-7xl">{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
