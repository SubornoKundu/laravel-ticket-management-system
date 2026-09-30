<script setup lang="ts">
import { ref } from 'vue';
import { Check, Copy } from '@lucide/vue';
import { Button } from '@/components/ui/button';

const props = defineProps<{
    value: string;
    label?: string;
}>();

const copied = ref(false);

async function copy() {
    try {
        await navigator.clipboard.writeText(props.value);
    } catch {
        const el = document.createElement('textarea');
        el.value = props.value;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
    <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="`Copy ${label || value}`"
        @click="copy"
    >
        <Check v-if="copied" class="text-emerald-500" />
        <Copy v-else />
    </Button>
</template>
