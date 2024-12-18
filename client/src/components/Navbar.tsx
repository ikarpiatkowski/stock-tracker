"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ModeToggle";

export const Navbar = () => {
  const { open } = useSidebar();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full p-4 backdrop-blur-[6px] z-10 transition-all duration-300",
        open ? "pl-[260px]" : "pl-[48px]"
      )}
    >
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center">
          <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear ">
            <div className="flex items-center gap-2 px-4">
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Stock Tracker</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
        </div>
        <div className="flex justify-center flex-1">
          <p className="font-bold">Profits: 617.98 PLN</p>
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
};
