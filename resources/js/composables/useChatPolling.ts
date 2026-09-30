import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { TicketMessage } from '@/types';

type Options = {
    /** Builds the URL that returns the messages newer than `afterId` (0 = initial load). */
    url: (afterId: number) => string;
    /** Poll interval while the chat is active (ms). */
    minDelay?: number;
    /** Poll interval the chat slows down to when idle / when the server is busy (ms). */
    maxDelay?: number;
    /** Called with the full parsed JSON body on every successful poll (e.g. to read a `status` field). */
    onResponse?: (data: Record<string, unknown>) => void;
};

/**
 * Polls a ticket chat without hammering the server.
 *
 * - One request at a time (the next poll is scheduled only after the previous
 *   one finished), so a slow server never gets a pile-up of requests.
 * - Only fetches messages newer than the last one received (`after` cursor).
 * - Slows down while nothing new happens, and speeds up when something does.
 * - Backs off on 429 / 5xx / network errors (honours Retry-After).
 * - Pauses while the browser tab is hidden and refreshes when it comes back.
 * - Random jitter so thousands of open pages never poll in lock-step.
 */
export function useChatPolling(options: Options) {
    const minDelay = options.minDelay ?? 5000;
    const maxDelay = options.maxDelay ?? 30000;

    const messages = ref<TicketMessage[]>([]);
    const loaded = ref(false);

    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let delay = minDelay;
    // Highest message id received *from the server*. Deliberately not advanced by
    // locally-sent messages, so a reply that arrived just before ours is never skipped.
    let cursor = 0;
    let running = false;
    let generation = 0;

    function jitter(ms: number): number {
        return Math.round(ms * (0.85 + Math.random() * 0.3));
    }

    function schedule(ms: number) {
        clearTimeout(timer);
        if (!running) return;
        timer = setTimeout(poll, ms);
    }

    /** Adds messages that aren't known yet; returns true if anything was added. */
    function merge(incoming: TicketMessage[]): boolean {
        const known = new Set(messages.value.map((m) => m.id));
        const fresh = incoming.filter((m) => !known.has(m.id));
        if (!fresh.length) return false;
        messages.value = [...messages.value, ...fresh].sort((a, b) => a.id - b.id);
        return true;
    }

    async function poll() {
        if (!running) return;

        if (document.hidden) {
            schedule(maxDelay);
            return;
        }

        const myGeneration = generation;
        controller = new AbortController();
        let next = delay;

        try {
            const res = await fetch(options.url(cursor), {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
                signal: controller.signal,
            });

            if (myGeneration !== generation) return;

            if (res.ok) {
                const data = await res.json();
                const incoming: TicketMessage[] = data.messages ?? [];

                loaded.value = true;
                options.onResponse?.(data);

                if (incoming.length) {
                    cursor = Math.max(cursor, incoming[incoming.length - 1].id);
                    merge(incoming);
                    delay = minDelay;
                    // A full page means there is probably more waiting: fetch it right away.
                    next = data.has_more ? 0 : delay;
                } else {
                    delay = Math.min(maxDelay, Math.round(delay * 1.5));
                    next = delay;
                }
            } else if (res.status === 429 || res.status >= 500) {
                const retryAfter = Number(res.headers.get('Retry-After'));
                delay = Math.min(maxDelay, Math.max(delay * 2, retryAfter > 0 ? retryAfter * 1000 : 0));
                next = delay;
            } else {
                // 4xx (e.g. ticket not found): nothing will change, so poll rarely.
                delay = maxDelay;
                next = delay;
            }
        } catch (error) {
            if ((error as Error)?.name === 'AbortError' || myGeneration !== generation) return;
            delay = Math.min(maxDelay, delay * 2);
            next = delay;
        }

        schedule(next === 0 ? 0 : jitter(next));
    }

    /** Poll as soon as possible and go back to the fast interval. */
    function pollNow() {
        delay = minDelay;
        controller?.abort();
        generation++;
        schedule(0);
    }

    /** Adds a message the current user just sent (deduplicated against later polls). */
    function addLocal(message: TicketMessage) {
        merge([message]);
        delay = minDelay;
    }

    /** Forget everything and start over (e.g. the admin opened a different ticket). */
    function reset() {
        controller?.abort();
        generation++;
        messages.value = [];
        loaded.value = false;
        cursor = 0;
        delay = minDelay;
        schedule(0);
    }

    function onVisibilityChange() {
        if (!document.hidden && running) pollNow();
    }

    onMounted(() => {
        running = true;
        document.addEventListener('visibilitychange', onVisibilityChange);
        poll();
    });

    onBeforeUnmount(() => {
        running = false;
        generation++;
        clearTimeout(timer);
        controller?.abort();
        document.removeEventListener('visibilitychange', onVisibilityChange);
    });

    return { messages, loaded, pollNow, addLocal, reset };
}
