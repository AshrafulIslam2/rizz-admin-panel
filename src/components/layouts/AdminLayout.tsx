"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
              <SidebarTrigger className="mr-4" />
              <div className="flex flex-1 items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold">Admin Panel</h1>
                </div>
              </div>
            </div>
          </header>
          <div className="flex-1 space-y-4 p-4 pt-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
