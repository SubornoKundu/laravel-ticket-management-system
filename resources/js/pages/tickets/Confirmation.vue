<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, Link, router, usePage } from '@inertiajs/vue3';
import { ArrowLeft, CheckCircle2 } from '@lucide/vue';
import { create } from '@/routes/tickets';
import { dashboard } from '@/routes';
import CopyButton from '@/components/tickets/CopyButton.vue';
import CustomerChatThread from '@/components/tickets/CustomerChatThread.vue';
import StatusBadge from '@/components/tickets/StatusBadge.vue';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/ticketFormat';
import type { TicketStatusValue } from '@/types';

const props = defineProps<{
    ticket: {
        ticket_uid: string;
        name: string;
        status: TicketStatusValue;
        price: string;
        message: string | null;
        created_at: string;
    };
}>();

const page = usePage();
// A real Link visit (not a raw browser back) so the dashboard always
// re-fetches fresh data and shows the ticket just created.
const isAuthed = computed(() => !!page.props.auth.user);

// The chat poll (every few seconds) also reports the ticket's current
// status, so this stays in sync without needing a page reload if an admin
// changes it while the customer has this page open.
const liveStatus = ref<TicketStatusValue>(props.ticket.status);
watch(
    () => props.ticket.status,
    (s) => (liveStatus.value = s),
);
function onStatusUpdate(status: TicketStatusValue) {
    liveStatus.value = status;
}

// Only pending/reserved tickets can be self-cancelled — once an admin has
// taken it or marked it successful, the customer can no longer cancel it.
const canCancel = computed(() => ['pending', 'reserve'].includes(liveStatus.value));
const cancelling = ref(false);

function cancelTicket() {
    if (!confirm('Cancel this ticket? This cannot be undone.')) return;

    cancelling.value = true;
    router.post(
        `/tickets/confirmation/${props.ticket.ticket_uid}/cancel`,
        {},
        {
            preserveScroll: true,
            onFinish: () => (cancelling.value = false),
        },
    );
}
</script>

<template>
    <Head title="Ticket submitted" />

    <div class="min-h-screen bg-background px-4 py-10 text-foreground">
        <div class="mx-auto w-full max-w-xl space-y-4">
            <Link
                v-if="isAuthed"
                :href="dashboard()"
                class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft class="size-4" />
                Back to my tickets
            </Link>

            <div class="rounded-2xl border bg-card p-6 text-center">
                <CheckCircle2 class="mx-auto mb-3 size-10 text-emerald-500" />
                <h1 class="text-xl font-semibold">Ticket submitted</h1>
                <p class="mt-1 text-sm text-muted-foreground">
                    Keep this page bookmarked — you can check your status and chat with our team here anytime.
                </p>

                <div class="mt-4 flex items-center justify-center gap-1.5">
                    <p class="rounded-lg bg-muted/50 py-2 px-3 font-mono text-base font-semibold">
                        {{ props.ticket.ticket_uid }}
                    </p>
                    <CopyButton :value="props.ticket.ticket_uid" label="ticket ID" />
                </div>

                <div class="mt-3 flex items-center justify-center gap-2">
                    <span class="text-xs text-muted-foreground">Status:</span>
                    <StatusBadge :status="liveStatus" />
                </div>

                <div v-if="canCancel" class="mt-4">
                    <Button variant="outline" size="sm" :disabled="cancelling" @click="cancelTicket">
                        {{ cancelling ? 'Cancelling...' : 'Cancel ticket' }}
                    </Button>
                </div>
                <p v-else-if="liveStatus === 'cancelled'" class="mt-4 text-xs text-muted-foreground">
                    This ticket has been cancelled.
                </p>
            </div>

            <div class="space-y-2 rounded-2xl border bg-card p-5 text-sm">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-muted-foreground">Name</span>
                    <span class="font-medium">{{ props.ticket.name }}</span>
                </div>
                <div v-if="Number(props.ticket.price) > 0" class="flex items-center justify-between gap-2">
                    <span class="text-muted-foreground">Amount</span>
                    <span class="font-medium">{{ formatPrice(props.ticket.price) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                    <span class="text-muted-foreground">Submitted</span>
                    <span class="font-medium">{{ formatDate(props.ticket.created_at) }}</span>
                </div>
                <div v-if="props.ticket.message" class="pt-1">
                    <p class="text-muted-foreground">Your message</p>
                    <p class="mt-1 rounded-lg bg-muted/50 p-3 whitespace-pre-wrap">{{ props.ticket.message }}</p>
                </div>
            </div>

            <div class="rounded-2xl border bg-card p-4">
                <p class="mb-2 px-1 text-sm font-medium">Chat with our team</p>
                <div class="h-80">
                    <CustomerChatThread :ticket-uid="props.ticket.ticket_uid" @status="onStatusUpdate" />
                </div>
            </div>

            <div class="text-center">
                <Link :href="create()" class="text-sm font-medium text-primary hover:underline">
                    Submit another ticket
                </Link>
            </div>
        </div>
    </div>
</template>
