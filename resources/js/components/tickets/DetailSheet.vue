<script setup lang="ts">
import { ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { ImageOff } from '@lucide/vue';
import TicketController from '@/actions/App/Http/Controllers/Admin/TicketController';
import ChatThread from '@/components/tickets/ChatThread.vue';
import CopyButton from '@/components/tickets/CopyButton.vue';
import StatusBadge from '@/components/tickets/StatusBadge.vue';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatDate, formatPrice } from '@/lib/ticketFormat';
import type { Ticket, TicketStatusOption, TicketStatusValue } from '@/types';

const props = defineProps<{
    ticket: Ticket | null;
    open: boolean;
    statusOptions: TicketStatusOption[];
}>();

const emit = defineEmits<{
    close: [];
}>();

const localStatus = ref<TicketStatusValue>(props.ticket?.status ?? 'pending');
const updating = ref(false);
const lightboxUrl = ref<string | null>(null);

watch(
    () => props.ticket,
    (t) => {
        if (t) localStatus.value = t.status;
        lightboxUrl.value = null;
    },
);

function updateStatus(status: TicketStatusValue) {
    if (!props.ticket) return;
    updating.value = true;
    router.patch(
        TicketController.updateStatus.url(props.ticket.id),
        { status },
        {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => (updating.value = false),
        },
    );
}

function takeTicket() {
    localStatus.value = 'taken';
    updateStatus('taken');
}

function copyAllDetails() {
    if (!props.ticket) return;
    const t = props.ticket;
    const text = [
        `Ticket: ${t.ticket_uid}`,
        `Name: ${t.name}`,
        `Email: ${t.email}`,
        `Phone: ${t.phone}`,
        `Price: ${t.price}`,
        `Status: ${t.status}`,
        `Message: ${t.message ?? ''}`,
    ].join('\n');
    navigator.clipboard?.writeText(text);
}

function onOpenChange(value: boolean) {
    if (!value) emit('close');
}
</script>

<template>
    <Sheet :open="open" @update:open="onOpenChange">
        <SheetContent v-if="ticket" class="flex w-full flex-col gap-0 p-0 sm:max-w-md">
            <SheetHeader class="border-b">
                <SheetTitle class="flex items-center gap-1.5 font-mono text-sm">
                    {{ ticket.ticket_uid }}
                    <CopyButton :value="ticket.ticket_uid" label="ticket ID" />
                </SheetTitle>
                <SheetDescription>Created {{ formatDate(ticket.created_at) }}</SheetDescription>
            </SheetHeader>

            <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4">
                <div>
                    <div class="mb-1.5 flex items-center justify-between">
                        <span class="text-xs font-medium text-muted-foreground">Status</span>
                        <StatusBadge :status="ticket.status" />
                    </div>
                    <div class="flex gap-2">
                        <Select
                            :model-value="localStatus"
                            @update:model-value="(v) => { localStatus = v as TicketStatusValue; updateStatus(localStatus); }"
                        >
                            <SelectTrigger class="flex-1" :disabled="updating">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            v-if="ticket.status !== 'taken'"
                            type="button"
                            variant="secondary"
                            :disabled="updating"
                            @click="takeTicket"
                        >
                            Take
                        </Button>
                    </div>
                    <p v-if="ticket.assigned_admin" class="mt-1.5 text-xs text-muted-foreground">
                        Taken by {{ ticket.assigned_admin.name }}
                    </p>
                </div>

                <div class="space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
                    <div class="mb-1 flex items-center justify-between">
                        <span class="text-xs font-medium text-muted-foreground">Customer details</span>
                        <Button type="button" variant="link" size="sm" class="h-auto p-0" @click="copyAllDetails">
                            Copy all
                        </Button>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-muted-foreground">Name</span>
                        <span class="flex items-center gap-1 font-medium">
                            {{ ticket.name }}
                            <CopyButton :value="ticket.name" label="name" />
                        </span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-muted-foreground">Account</span>
                        <span class="font-medium">{{ ticket.user ? ticket.user.name : 'Guest (no account)' }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-muted-foreground">Email</span>
                        <span class="flex items-center gap-1 font-medium break-all">
                            {{ ticket.email }}
                            <CopyButton :value="ticket.email" label="email" />
                        </span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-muted-foreground">Phone</span>
                        <span class="flex items-center gap-1 font-medium">
                            {{ ticket.phone }}
                            <CopyButton :value="ticket.phone" label="phone" />
                        </span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-muted-foreground">Price</span>
                        <span class="font-medium">{{ formatPrice(ticket.price) }}</span>
                    </div>
                </div>

                <div>
                    <p class="mb-1.5 text-xs font-medium text-muted-foreground">Message</p>
                    <p class="rounded-xl bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                        {{ ticket.message || 'No message provided.' }}
                    </p>
                </div>

                <div>
                    <p class="mb-1.5 text-xs font-medium text-muted-foreground">Screenshots</p>
                    <div v-if="ticket.screenshots.length" class="grid grid-cols-3 gap-2">
                        <button
                            v-for="(shot, i) in ticket.screenshots"
                            :key="shot.id"
                            type="button"
                            class="focus-visible:ring-ring aspect-square overflow-hidden rounded-lg border transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
                            @click="lightboxUrl = shot.url"
                        >
                            <img :src="shot.url" class="h-full w-full object-cover" :alt="`Screenshot ${i + 1}`" />
                        </button>
                    </div>
                    <p v-else class="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <ImageOff class="size-4" /> No screenshots attached.
                    </p>
                </div>

                <div class="border-t pt-4">
                    <p class="mb-2 text-xs font-medium text-muted-foreground">Live chat</p>
                    <div class="h-64">
                        <ChatThread :ticket-id="ticket.id" />
                    </div>
                </div>
            </div>
        </SheetContent>
    </Sheet>

    <Dialog :open="lightboxUrl !== null" @update:open="(v) => { if (!v) lightboxUrl = null; }">
        <DialogContent class="sm:max-w-3xl border-none bg-transparent p-0 shadow-none">
            <DialogTitle class="sr-only">Screenshot preview</DialogTitle>
            <img v-if="lightboxUrl" :src="lightboxUrl" class="max-h-[85vh] w-full rounded-lg object-contain" alt="Ticket screenshot" />
        </DialogContent>
    </Dialog>
</template>
