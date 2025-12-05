import AppBreadcrumb from "@/src/components/AppBreadcrumb";
import AppSidebar from "@/src/components/SideNav";
import { Separator } from "@/src/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/src/components/ui/sidebar";
import { Outlet } from "react-router-dom";


const RootLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-1 h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <SidebarInset>
            <header className="flex items-center justify-between h-16 gap-2 px-4 border-b border-gray-300 shrink-0 dark:border-[#444557] bg-gray-50 dark:bg-[#1e1f2a]">
              <div className="flex items-center">
                <SidebarTrigger className="-ml-1 dark:text-white" />
                <Separator orientation="vertical" className="h-4 mr-2" />
                <AppBreadcrumb />
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-slate-200 dark:bg-[#12131d]">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RootLayout;
