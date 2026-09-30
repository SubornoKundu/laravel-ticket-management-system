<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Send } from '@lucide/vue';
import TicketController from '@/actions/App/Http/Controllers/TicketController';
import { Button } from '@/components/ui/button';
import { useChatPolling } from '@/composables/useChatPolling';
import { xsrfHeader } from '@/lib/ticketFormat';
import type { TicketStatusValue } from '@/types';

const props = defineProps<{
    ticketUid: string;
}>();

const emit = defineEmits<{
    status: [status: TicketStatusValue];
}>();

const newMessage = ref('');
const sending = ref(false);
const sendError = ref('');
const scrollEl = ref<HTMLDivElement | null>(null);
// Only jump to the newest message if the customer is already at the bottom
// (or just sent something) — never yank them away while they read older messages.
let stickToBottom = true;

const { messages, loaded, pollNow, addLocal } = useChatPolling({
    url: (after) =>
        TicketController.messages.url(props.ticketUid, after > 0 ? { query: { after } } : undefined),
    // The confirmation page's status badge follows this so it stays live
    // (e.g. an admin marking the ticket "taken" or "successful") without a reload.
    onResponse: (data) => {
        if (typeof data.status === 'string') emit('status', data.status as TicketStatusValue);
    },
});

function onScroll() {
    const el = scrollEl.value;
    if (!el) return;
    stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
}

function scrollToBottom() {
    if (scrollEl.value) {
        scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
    }
}

watch(
    () => messages.value.length,
    async () => {
        await nextTick();
        if (stickToBottom) scrollToBottom();
    },
);

async function send() {
    const text = newMessage.value.trim();
    if (!text || sending.value) return;

    sending.value = true;
    sendError.value = '';
    try {
        const res = await fetch(TicketController.sendMessage.url(props.ticketUid), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...xsrfHeader(),
            },
            body: JSON.stringify({ message: text }),
        });
        if (res.ok) {
            const data = await res.json();
            newMessage.value = '';
            stickToBottom = true;
            addLocal(data.message);
            // Fetch anything the team wrote in the meantime, then poll quickly for their reply.
            pollNow();
        } else if (res.status === 429) {
            sendError.value = 'You are sending messages too quickly. Please wait a moment and try again.';
        } else {
            sendError.value = 'Your message could not be sent. Please try again.';
        }
    } catch {
        sendError.value = 'Connection problem — your message was not sent. Please try again.';
    } finally {
        sending.value = false;
    }
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
    <div class="flex h-full flex-col">
        <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto px-1 py-2" @scroll.passive="onScroll">
            <div
                v-for="msg in messages"
                :key="msg.id"
                class="flex"
                :class="msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'"
            >
                <div
                    class="max-w-[80%] rounded-2xl px-3.5 py-2 text-sm"
                    :class="
                        msg.sender_type === 'customer'
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm bg-muted text-foreground'
                    "
                >
                    <p class="break-words whitespace-pre-wrap">{{ msg.message }}</p>
                    <p class="mt-1 text-[10px] opacity-70">
                        {{ msg.sender_type === 'customer' ? 'You' : (msg.admin?.name ?? 'Support team') }}
                        · {{ formatTime(msg.created_at) }}
                    </p>
                </div>
            </div>
            <p v-if="loaded && !messages.length" class="py-6 text-center text-xs text-muted-foreground">
                No messages yet — send one below and our team will reply here.
            </p>
        </div>

        <p v-if="sendError" class="px-1 pt-1 text-xs text-destructive" role="alert">{{ sendError }}</p>

        <form class="mt-2 flex items-end gap-2 border-t pt-3" @submit.prevent="send">
            <textarea
                v-model="newMessage"
                rows="1"
                maxlength="2000"
                placeholder="Type a message..."
                class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-9 flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                @keydown.enter.exact.prevent="send"
            />
            <Button type="submit" size="icon" :disabled="sending || !newMessage.trim()" aria-label="Send message">
                <Send />
            </Button>
        </form>
    </div>
</template>
