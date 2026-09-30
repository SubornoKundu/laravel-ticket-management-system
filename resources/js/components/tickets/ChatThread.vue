<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Send } from '@lucide/vue';
import TicketController from '@/actions/App/Http/Controllers/Admin/TicketController';
import { Button } from '@/components/ui/button';
import { useChatPolling } from '@/composables/useChatPolling';
import { xsrfHeader } from '@/lib/ticketFormat';

const props = defineProps<{
    ticketId: number;
}>();

const newMessage = ref('');
const sending = ref(false);
const sendError = ref('');
const scrollEl = ref<HTMLDivElement | null>(null);
// Only jump to the newest message if the admin is already at the bottom
// (or just sent something) — never yank them away while they read older messages.
let stickToBottom = true;

const { messages, pollNow, addLocal, reset } = useChatPolling({
    url: (after) => TicketController.messages.url(props.ticketId, after > 0 ? { query: { after } } : undefined),
});

const quickReplies = [
    'Thanks for reaching out — checking this now.',
    'Could you share a bit more detail or a screenshot?',
    'This has been resolved. Let us know if anything else comes up!',
    "We're still working on this — thanks for your patience.",
];

function sendQuick(text: string) {
    newMessage.value = text;
    send();
}

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
    const ticketIdAtSend = props.ticketId;
    try {
        const res = await fetch(TicketController.sendMessage.url(ticketIdAtSend), {
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
            // If the admin switched tickets while this was in flight, don't show it in the wrong thread.
            if (ticketIdAtSend === props.ticketId) {
                stickToBottom = true;
                addLocal(data.message);
                pollNow();
            }
        } else {
            sendError.value = 'Message could not be sent. Please try again.';
        }
    } catch {
        sendError.value = 'Connection problem — message was not sent. Please try again.';
    } finally {
        sending.value = false;
    }
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

watch(
    () => props.ticketId,
    () => {
        stickToBottom = true;
        sendError.value = '';
        reset();
    },
);
</script>

<template>
    <div class="flex h-full flex-col">
        <div ref="scrollEl" class="flex-1 space-y-3 overflow-y-auto px-1 py-2" @scroll.passive="onScroll">
            <div
                v-for="msg in messages"
                :key="msg.id"
                class="flex"
                :class="msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'"
            >
                <div
                    class="max-w-[80%] rounded-2xl px-3.5 py-2 text-sm"
                    :class="
                        msg.sender_type === 'admin'
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-bl-sm bg-muted text-foreground'
                    "
                >
                    <p class="break-words whitespace-pre-wrap">{{ msg.message }}</p>
                    <p class="mt-1 text-[10px] opacity-70">
                        {{ msg.sender_type === 'admin' ? (msg.admin?.name ?? 'Admin') : 'Customer' }}
                        · {{ formatTime(msg.created_at) }}
                    </p>
                </div>
            </div>
            <p v-if="!messages.length" class="py-6 text-center text-xs text-muted-foreground">No messages yet.</p>
        </div>

        <p v-if="sendError" class="px-1 pt-1 text-xs text-destructive" role="alert">{{ sendError }}</p>

        <div class="mt-3 flex gap-1.5 overflow-x-auto border-t pt-3 pb-0.5">
            <button
                v-for="reply in quickReplies"
                :key="reply"
                type="button"
                :disabled="sending"
                class="shrink-0 rounded-full border bg-muted/50 px-3 py-1 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                @click="sendQuick(reply)"
            >
                {{ reply.length > 28 ? reply.slice(0, 28) + '…' : reply }}
            </button>
        </div>

        <form class="mt-2 flex items-end gap-2 pt-1" @submit.prevent="send">
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
