import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BadgeDollarSignIcon, BookOpen, DollarSign, Folder, LayoutGrid, ShoppingCart, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    // sales
    {
        title: 'Sales',
        href: '/sales',
        icon: ShoppingCart,
    },
    // products
    {
        title: 'Products',
        href: '/products',
        icon: Folder,
    },
    // categories
    {
        title: 'Categories',
        href: '/categories',
        icon: Folder,
    },
    // sales reports
    {
        title: 'Sales Reports',
        href: '/sales-reports',
        icon: DollarSign,
    },
    // expenses
    {
        title: 'Expenses',
        href: '/expenses',
        // change the icon
        icon: BadgeDollarSignIcon,
    },
    // suppliers
    {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Users,
    },
    // users
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
];
const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                            
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
