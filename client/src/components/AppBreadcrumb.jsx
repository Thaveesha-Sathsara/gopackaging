import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/src/components/ui/drawer";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSidebar } from "./ui/sidebar";

const capitalizeWords = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const KEYWORDS = [
  "employees",
  "products",
  "create",
  "edit",
  "view",
];

const AppBreadcrumb = () => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();
  const location = useLocation();
  const params = useParams();

  const ITEMS_TO_DISPLAY = isMobile ? 1 : 5;

  const isParam = (segment) => Object.values(params).includes(segment);

  const pathSegments = location.pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => ({
      label: segment,
      path: "/" + array.slice(0, index + 1).join("/"),
    }))
    .filter((segment) => !isParam(segment.label));

  const collapsedSegments = pathSegments.slice(
    0,
    -Math.min(pathSegments.length, ITEMS_TO_DISPLAY)
  );

  const isNonClickable = (segment) =>
    Object.values(params).includes(segment) ||
    KEYWORDS.includes(segment.toLowerCase());

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Go Packaging</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.length > 0 && <BreadcrumbSeparator />}

        {/* Conditionally display collapsed breadcrumbs */}
        {pathSegments.length > ITEMS_TO_DISPLAY && (
          <>
            <BreadcrumbItem>
              {!isMobile ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger
                    className="flex items-center gap-1"
                    aria-label="Toggle menu"
                  >
                    <BreadcrumbEllipsis className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {collapsedSegments.map((segment, index) => {
                      const isNonClickableItem = isNonClickable(segment.label);
                      return (
                        <DropdownMenuItem key={index}>
                          {isNonClickableItem ? (
                            <span className="text-gray-500">
                              {capitalizeWords(segment.label)}
                            </span>
                          ) : (
                            <Link to={segment.path}>
                              {capitalizeWords(segment.label)}
                            </Link>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger aria-label="Toggle menu">
                    <BreadcrumbEllipsis className="w-4 h-4" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle className="">
                        Navigate to
                      </DrawerTitle>
                      <DrawerDescription>
                        Select a page to navigate to.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {collapsedSegments.map((segment, index) => {
                        const isNonClickableItem = isNonClickable(
                          segment.label
                        );
                        return (
                          <div key={index} className="py-1 text-sm">
                            {isNonClickableItem ? (
                              <span className="text-gray-500">
                                {capitalizeWords(segment.label)}
                              </span>
                            ) : (
                              <Link
                                to={segment.path}
                                className=""
                              >
                                {capitalizeWords(segment.label)}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button
                          variant="outline"
                          className=""
                        >
                          Close
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* Render last breadcrumbs (up to ITEMS_TO_DISPLAY) */}
        {pathSegments.slice(-ITEMS_TO_DISPLAY).map((segment, index, array) => {
          const isLast = index === array.length - 1;
          const isNonClickableItem = isNonClickable(segment.label);
          const label = capitalizeWords(segment.label);

          return (
            <BreadcrumbItem key={index}>
              {isLast ? (
                // Last breadcrumb should not be a link
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : isNonClickableItem ? (
                <>
                  <span className="text-gray-500">{label}</span>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link
                      to={segment.path}
                      className="truncate max-w-20 md:max-w-none"
                    >
                      {label}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumb;
