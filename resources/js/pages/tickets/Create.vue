<script setup lang="ts">
import { computed, ref } from 'vue';
import { Head, Link, useForm, usePage } from '@inertiajs/vue3';
import { ArrowLeft } from '@lucide/vue';
import TicketController from '@/actions/App/Http/Controllers/TicketController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

const props = defineProps<{
    prefill?: { name: string; email: string } | null;
}>();

const page = usePage();
const isAuthed = computed(() => !!page.props.auth.user);
// Logged-in users have a dashboard to cancel back to; guests go to the
// login/home page — either way this is a real navigation (via <Link>),
// not a raw browser-back, so the destination always shows fresh data.
const backHref = computed(() => (isAuthed.value ? dashboard() : '/'));

const form = useForm({
    name: props.prefill?.name ?? '',
    email: props.prefill?.email ?? '',
    phone: '',
    price: '',
    message: '',
    screenshots: [] as File[],
});

const previews = ref<{ name: string; url: string }[]>([]);

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // must match the server rule (5MB each)
const fileNotice = ref('');

function onFilesSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const picked = Array.from(input.files ?? []);

    // Catch problems in the browser, where the message is clear, instead of letting
    // the server (or a proxy in front of it) reject a big upload with a vague error.
    const valid = picked.filter((file) => file.type.startsWith('image/') && file.size <= MAX_FILE_BYTES);
    const skipped = picked.length - valid.length;
    const files = valid.slice(0, MAX_FILES);

    const notices: string[] = [];
    if (skipped > 0) notices.push(`${skipped} file(s) skipped — only images up to 5MB each are allowed.`);
    if (valid.length > MAX_FILES) notices.push(`Only the first ${MAX_FILES} screenshots were kept.`);
    fileNotice.value = notices.join(' ');

    form.screenshots = files;

    previews.value.forEach((p) => URL.revokeObjectURL(p.url));
    previews.value = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));

    // Clear the native input so the same file can be picked again after being removed.
    if (!files.length) input.value = '';
}

function removeFile(index: number) {
    const files = [...form.screenshots];
    files.splice(index, 1);
    form.screenshots = files;

    URL.revokeObjectURL(previews.value[index].url);
    previews.value.splice(index, 1);
}

// The array-item error keys ("screenshots.0", "screenshots.1", ...) aren't
// part of the form's declared shape, so they're collected via a loosely
// typed lookup — one message per invalid file, not just the first.
const screenshotErrors = computed(() => {
    const errors = form.errors as Record<string, string>;
    return Object.keys(errors)
        .filter((key) => /^screenshots\.\d+$/.test(key))
        .sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]))
        .map((key) => errors[key]);
});

function submit() {
    form.post(TicketController.store.url(), {
        forceFormData: true,
        onSuccess: () => {
            previews.value.forEach((p) => URL.revokeObjectURL(p.url));
            previews.value = [];
            fileNotice.value = '';
            form.reset();
        },
    });
}
</script>

<template>
    <Head title="Submit a Support Ticket" />

    <div class="min-h-screen bg-background px-4 py-10 text-foreground">
        <div class="mx-auto max-w-xl">
            <Link
                :href="backHref"
                class="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft class="size-4" />
                Back
            </Link>

            <div class="mb-6 text-center">
                <h1 class="text-2xl font-semibold">Submit a Support Ticket</h1>
                <p class="mt-1 text-sm text-muted-foreground">Tell us what went wrong and we'll get back to you.</p>
            </div>

            <form class="space-y-4 rounded-2xl border bg-card p-6" @submit.prevent="submit">
                <div class="grid gap-2">
                    <Label for="name">Name</Label>
                    <Input id="name" v-model="form.name" />
                    <InputError :message="form.errors.name" />
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="grid gap-2">
                        <Label for="email">Email</Label>
                        <Input id="email" v-model="form.email" type="email" />
                        <InputError :message="form.errors.email" />
                    </div>
                    <div class="grid gap-2">
                        <Label for="phone">Phone</Label>
                        <Input id="phone" v-model="form.phone" />
                        <InputError :message="form.errors.phone" />
                    </div>
                </div>

                <div class="grid gap-2">
                    <Label for="price">Order / service amount (optional)</Label>
                    <Input id="price" v-model="form.price" type="number" step="0.01" min="0" />
                    <InputError :message="form.errors.price" />
                </div>

                <div class="grid gap-2">
                    <Label for="message">What's the problem?</Label>
                    <textarea
                        id="message"
                        v-model="form.message"
                        rows="4"
                        class="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                    ></textarea>
                    <InputError :message="form.errors.message" />
                </div>

                <div class="grid gap-2">
                    <Label for="screenshots">Screenshots (optional, up to 5)</Label>
                    <input
                        id="screenshots"
                        type="file"
                        accept="image/*"
                        multiple
                        class="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground"
                        @change="onFilesSelected"
                    />
                    <p v-if="fileNotice" class="text-sm text-amber-600 dark:text-amber-400" role="status">
                        {{ fileNotice }}
                    </p>
                    <InputError v-for="(err, i) in screenshotErrors" :key="i" :message="err" />

                    <div v-if="previews.length" class="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        <div v-for="(p, i) in previews" :key="p.url" class="relative aspect-square overflow-hidden rounded-lg border">
                            <img :src="p.url" class="h-full w-full object-cover" :alt="p.name" />
                            <button
                                type="button"
                                aria-label="Remove screenshot"
                                class="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-foreground/60 text-xs leading-none text-background"
                                @click="removeFile(i)"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <Button as-child variant="outline" type="button" class="flex-1" :disabled="form.processing">
                        <Link :href="backHref">Cancel</Link>
                    </Button>
                    <Button type="submit" class="flex-1" :disabled="form.processing">
                        {{ form.processing ? 'Submitting...' : 'Submit ticket' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
