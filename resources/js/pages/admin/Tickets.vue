<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import TicketController from '@/actions/App/Http/Controllers/Admin/TicketController';
import DetailSheet from '@/components/tickets/DetailSheet.vue';
import StatusBadge from '@/components/tickets/StatusBadge.vue';
import TicketFilters from '@/components/tickets/TicketFilters.vue';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/ticketFormat';
import { index as adminTicketsIndex } from '@/routes/admin/tickets';
import type { Paginated, Ticket, TicketFilters as TicketFiltersType, TicketStats, TicketStatusOption } from '@/types';

const props = defineProps<{
    tickets: Paginated<Ticket>;
    filters: TicketFiltersType;
    statusOptions: TicketStatusOption[];
    stats: TicketStats;
}>();

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Tickets', href: adminTicketsIndex() }],
    },
});

const activeTicketId = ref<number | null>(null);
const panelOpen = ref(false);

// Derived (not a snapshot) so status changes made through the sheet are
// reflected immediately once Inertia refreshes the `tickets` prop.
const activeTicket = computed<Ticket | null>(
    () => props.tickets.data.find((t) => t.id === activeTicketId.value) ?? null,
);

function openTicket(ticket: Ticket) {
    activeTicketId.value = ticket.id;
    panelOpen.value = true;
}

function closePanel() {
    panelOpen.value = false;
}

function applyFilters(newFilters: TicketFiltersType) {
    router.get(adminTicketsIndex.url(), { ...newFilters }, { preserveState: true, preserveScroll: true, replace: true });
}

function goToPage(url: string | null) {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
}

const statCards = computed(() => [
    { label: 'Total', value: props.stats.total, class: 'text-foreground' },
    { label: 'Pending', value: props.stats.pending, class: 'text-amber-600 dark:text-amber-400' },
    { label: 'Reserve', value: props.stats.reserve, class: 'text-blue-600 dark:text-blue-400' },
    { label: 'Successful', value: props.stats.successful, class: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Taken', value: props.stats.taken, class: 'text-violet-600 dark:text-violet-400' },
    { label: 'Cancelled', value: props.stats.cancelled, class: 'text-red-600 dark:text-red-400' },
]);

// Background refresh so new tickets and status changes made by other
// admins show up without a manual reload. Only the list + stats are
// re-fetched (not filters), and preserveScroll/preserveState keep the
// filter inputs, scroll position, and open detail sheet undisturbed.
let pollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    pollTimer = setInterval(() => {
        router.reload({
            only: ['tickets', 'stats'],
            preserveScroll: true,
            preserveState: true,
        });
    }, 6000);
});

onUnmounted(() => {
    clearInterval(pollTimer);
});
</script>

<template>
    <Head title="Tickets" />

    <div class="flex flex-1 flex-col gap-5 p-4">
        <h1 class="text-xl font-semibold">Support Tickets</h1>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div
                v-for="card in statCards"
                :key="card.label"
                class="rounded-xl border bg-card p-4"
            >
                <p class="text-xs font-medium" :class="card.class">{{ card.label }}</p>
                <p class="mt-1 text-2xl font-semibold">{{ card.value }}</p>
            </div>
        </div>

        <TicketFilters :filters="filters" :status-options="statusOptions" @update="applyFilters" />

        <!-- Desktop table -->
        <div class="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table class="w-full text-sm">
                <thead class="bg-muted/50">
                    <tr class="text-left text-muted-foreground">
                        <th class="px-4 py-3 font-medium">Ticket</th>
                        <th class="px-4 py-3 font-medium">Customer</th>
                        <th class="px-4 py-3 font-medium">Price</th>
                        <th class="px-4 py-3 font-medium">Status</th>
                        <th class="px-4 py-3 font-medium">Created</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    <tr
                        v-for="ticket in tickets.data"
                        :key="ticket.id"
                        class="cursor-pointer transition-colors hover:bg-muted/50"
                        @click="openTicket(ticket)"
                    >
                        <td class="px-4 py-3 font-mono">{{ ticket.ticket_uid }}</td>
                        <td class="px-4 py-3">
                            <p class="font-medium">{{ ticket.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ ticket.email }}</p>
                        </td>
                        <td class="px-4 py-3">{{ formatPrice(ticket.price) }}</td>
                        <td class="px-4 py-3"><StatusBadge :status="ticket.status" /></td>
                        <td class="px-4 py-3 text-muted-foreground">{{ formatDate(ticket.created_at) }}</td>
                        <td class="px-4 py-3 text-right">
                            <Button variant="link" size="sm" class="h-auto p-0" @click.stop="openTicket(ticket)">
                                View
                            </Button>
                        </td>
                    </tr>
                    <tr v-if="tickets.data.length === 0">
                        <td colspan="6" class="px-4 py-10 text-center text-muted-foreground">No tickets found.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile cards -->
        <div class="space-y-3 md:hidden">
            <div
                v-for="ticket in tickets.data"
                :key="ticket.id"
                class="rounded-xl border bg-card p-4"
                @click="openTicket(ticket)"
            >
                <div class="flex items-start justify-between gap-2">
                    <span class="font-mono text-xs text-muted-foreground">{{ ticket.ticket_uid }}</span>
                    <StatusBadge :status="ticket.status" />
                </div>
                <p class="mt-2 text-sm font-semibold">{{ ticket.name }}</p>
                <p class="text-xs text-muted-foreground">{{ ticket.email }}</p>
                <div class="mt-3 flex items-center justify-between">
                    <span class="text-sm font-medium">{{ formatPrice(ticket.price) }}</span>
                    <span class="text-xs text-muted-foreground">{{ formatDate(ticket.created_at) }}</span>
                </div>
            </div>
            <p v-if="tickets.data.length === 0" class="py-10 text-center text-muted-foreground">No tickets found.</p>
        </div>

        <div v-if="tickets.links.length > 3" class="flex flex-wrap gap-1">
            <template v-for="link in tickets.links" :key="link.label">
                <Button
                    v-if="link.url"
                    :variant="link.active ? 'default' : 'outline'"
                    size="sm"
                    @click="goToPage(link.url)"
                    v-html="link.label"
                />
                <span v-else class="px-3 py-1.5 text-sm text-muted-foreground" v-html="link.label" />
            </template>
        </div>
    </div>

    <DetailSheet :ticket="activeTicket" :open="panelOpen" :status-options="statusOptions" @close="closePanel" />
</template>
