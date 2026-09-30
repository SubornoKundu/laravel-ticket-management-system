<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { TicketFilters, TicketStatusOption } from '@/types';

const props = defineProps<{
    filters: TicketFilters;
    statusOptions: TicketStatusOption[];
}>();

const emit = defineEmits<{
    update: [filters: TicketFilters];
}>();

const search = ref(props.filters.search ?? '');
// reka-ui's Select rejects an empty-string item value, so "all" stands in
// for "no status filter" and is translated back to undefined below.
const status = ref(props.filters.status ?? 'all');
const from = ref(props.filters.from ?? '');
const to = ref(props.filters.to ?? '');
const sort = ref<'newest' | 'oldest'>(props.filters.sort ?? 'newest');

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function emitUpdate() {
    emit('update', {
        search: search.value || undefined,
        status: status.value === 'all' ? undefined : status.value,
        from: from.value || undefined,
        to: to.value || undefined,
        sort: sort.value,
    });
}

watch(search, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(emitUpdate, 350);
});

watch([status, from, to, sort], emitUpdate);

function clearFilters() {
    search.value = '';
    status.value = 'all';
    from.value = '';
    to.value = '';
    sort.value = 'newest';
}
</script>

<template>
    <div class="rounded-xl border bg-card p-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div class="lg:col-span-2">
                <Label class="mb-1.5">Search</Label>
                <div class="relative">
                    <Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input v-model="search" placeholder="Name, email, phone, ticket ID..." class="pl-9" />
                </div>
            </div>

            <div>
                <Label class="mb-1.5">Status</Label>
                <Select v-model="status">
                    <SelectTrigger class="w-full">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label class="mb-1.5">From</Label>
                <Input v-model="from" type="date" />
            </div>

            <div>
                <Label class="mb-1.5">To</Label>
                <Input v-model="to" type="date" />
            </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <Label>Sort</Label>
                <Select v-model="sort">
                    <SelectTrigger size="sm" class="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="button" variant="ghost" size="sm" @click="clearFilters">Clear filters</Button>
        </div>
    </div>
</template>
