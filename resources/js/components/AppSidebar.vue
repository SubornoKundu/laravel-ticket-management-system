<script setup lang="ts">
import { computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import { LayoutGrid, ShieldCheck, Ticket } from '@lucide/vue';
import AppLogo from '@/components/AppLogo.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
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
import { index as adminTicketsIndex } from '@/routes/admin/tickets';
import { index as adminAdminsIndex } from '@/routes/admin/admins';
import type { NavItem } from '@/types';

const page = usePage();
const isAdmin = computed(() => page.props.auth.user.role === 'admin');

const mainNavItems = computed<NavItem[]>(() => {
    if (!isAdmin.value) {
        return [{ title: 'Dashboard', href: dashboard(), icon: LayoutGrid }];
    }

    return [
        { title: 'Tickets', href: adminTicketsIndex(), icon: Ticket },
        { title: 'Admins', href: adminAdminsIndex(), icon: ShieldCheck },
    ];
});
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
