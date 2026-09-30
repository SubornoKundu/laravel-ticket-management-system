<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { MessageCircle, Plus } from '@lucide/vue';
import StatusBadge from '@/components/tickets/StatusBadge.vue';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/ticketFormat';
import { dashboard } from '@/routes';
import { confirmation, create } from '@/routes/tickets';
import type { Paginated, Ticket } from '@/types';

const props = defineProps<{
    tickets: Paginated<Ticket>;
}>();

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
    },
});

function goToPage(url: string | null) {
    if (!url) return;
    router.get(url, {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <Head title="Dashboard" />

    <div class="flex h-full flex-1 flex-col gap-4 p-4">
        <div class="flex items-center justify-between gap-3">
            <div>
                <h1 class="text-lg font-semibold">My Tickets</h1>
                <p class="text-sm text-muted-foreground">Submit a new support ticket or check up on an existing one.</p>
            </div>
            <Button as-child>
                <Link :href="create()">
                    <Plus class="size-4" />
                    New ticket
                </Link>
            </Button>
        </div>

        <div v-if="props.tickets.data.length === 0" class="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
            <MessageCircle class="size-10 text-muted-foreground" />
            <div>
                <p class="font-medium">You haven't submitted any tickets yet</p>
                <p class="text-sm text-muted-foreground">Once you submit one, you can track its status and chat with our team here.</p>
            </div>
            <Button as-child>
                <Link :href="create()">
                    <Plus class="size-4" />
                    Submit your first ticket
                </Link>
            </Button>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Link
                v-for="ticket in props.tickets.data"
                :key="ticket.id"
                :href="confirmation.url(ticket.ticket_uid)"
                class="rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
            >
                <div class="flex items-start justify-between gap-2">
                    <p class="font-mono text-xs text-muted-foreground">{{ ticket.ticket_uid }}</p>
                    <StatusBadge :status="ticket.status" />
                </div>
                <p class="mt-2 line-clamp-2 text-sm">{{ ticket.message ?? 'No description provided.' }}</p>
                <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span v-if="Number(ticket.price) > 0">{{ formatPrice(ticket.price) }}</span>
                    <span v-else />
                    <span>{{ formatDate(ticket.created_at) }}</span>
                </div>
            </Link>
        </div>

        <div v-if="props.tickets.links.length > 3" class="flex flex-wrap gap-1">
            <template v-for="link in props.tickets.links" :key="link.label">
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
</template>
