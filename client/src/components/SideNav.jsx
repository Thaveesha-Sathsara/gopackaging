import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/src/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail
} from "@/src/components/ui/sidebar";
import {
    BookOpenCheck,
    BookText,
    CalendarDays,
    ChevronRight,
    ContactRound,
    File,
    FileLock2,
    Folder,
    FireExtinguisher,
    FolderArchive,
    FolderCog,
    Globe,
    Layers,
    ListTodo,
    Network,
    NotebookPen,
    ShieldCheck,
    Speech,
    UserCog2,
    UserRound,
    UserRoundCheck,
    UsersRound,
    Video
} from "lucide-react"; 
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import reactLogo from "../assets/logo.svg";

const SideNav = () => {
    const data = {
        navMain: [
            {
                title: "Dashboard",
                icon: Globe,
                url: "/"
            },
            {
                title: "Workforce",
                icon: UserRoundCheck,
                items: [   
                    {
                        title: "Employees",
                        icon: UsersRound,
                        url: "/workforce/employee"
                    },
                    {
                        title: "Attendance",
                        icon: CalendarDays,
                        url: "/workforce/attendance"
                    },
                    {
                        title: "Allowances",
                        icon: BookOpenCheck,
                        url: "/workforce/monthly-adjustment"
                    },
                    {
                        title: "Payroll",
                        icon: FileLock2,
                        url: "/workforce/payroll"
                    },
                ],
                
            },
            {
                title: "Inventory",
                icon: FolderArchive,
                items: [
                    {
                        title: "Raw Materials",
                        icon: FolderCog,
                        url: "/inventory/raw-materials"

                    },
                    {
                        title: "Finished Goods",
                        icon: Folder,
                        url: "/inventory/finished-goods"
                    },
                ],
            },
            {
                title: "Production",
                icon: FireExtinguisher,
                url: "/production"
            },
            {
                title: "Reports",
                icon: File,
                items: [
                    {
                        title: "Employee Reports",
                        icon: UserCog2,
                        url: "/reports/employee-reports"
                    },
                    {
                        title: "Inventory Reports",
                        icon: FileLock2,
                        url: "reports/inventory-reports"
                    },
                    {
                        title: "Production Reports",
                        icon: NotebookPen,
                        url: "/reports/production-reports"
                    },
                ],
            },
            {
                title: "Calendar",
                icon: CalendarDays,
                url: "/calendar"
            },
            {
                title: "Profile",
                icon: UserRound,
                url: "/profile"
            },
        ],
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 p-2">
                            <div className="flex items-center justify-center rounded-lg size-8 bg-color: #0F0F48; aspect-square text-sidebar-primary-foreground">
                                <img
                                    src={reactLogo}
                                    alt="Logo"
                                    className="object-contain size-8"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="text-sm font-semibold">Go Packaging</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <ScrollArea>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.navMain.map((item, index) => (
                                    <Tree key={index} item={item} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <ScrollBar orientation="vertical" />
                </ScrollArea>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
};

function Tree({ item}) {
    const hasChildren = Array.isArray(item.items) && item.items.length > 0;

    const Icon = item.icon ? item.icon : hasChildren ? Folder : File;

    if (!hasChildren) {
        return (
            <SidebarMenuItem>
                <NavLink 
                    to={item.url} 
                >
                    {/* Use NavLink's "render prop" to get the isActive state */}
                    {({ isActive }) => (
                        <SidebarMenuButton
                            className={`flex w-full items-center gap-2 rounded-md ${
                                isActive
                                    ? "bg-[#2051DA] text-white hover:bg-blue-700"
                                    : "hover:bg-accent"
                            }`}
                        >
                            <Icon />
                            {item.title}
                        </SidebarMenuButton>
                    )}
                </NavLink>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen={item.title === "Workforce" || item.title === "Reports"}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                        <ChevronRight className="transition-transform" />
                        <Icon />
                        {item.title}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        <span className="my-1 whitespace-nopwrap">
                            {item.items.map((subItem, index) => (
                                <Tree key={index} item={subItem} />
                            ))}
                        </span>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

Tree.propTypes = {
    item: PropTypes.object,
};

export default SideNav;
