<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        :class="className"
        v-bind="$attrs"
    >
        <path
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4,5 L20,5 A3,3 0 0 1 23,8 L23,16 A3,3 0 0 1 20,19 L4,19 A3,3 0 0 1 1,16 L1,8 A3,3 0 0 1 4,5 Z M8.9,5 A3.1,3.1 0 1 0 15.1,5 A3.1,3.1 0 1 0 8.9,5 Z M8.9,19 A3.1,3.1 0 1 0 15.1,19 A3.1,3.1 0 1 0 8.9,19 Z"
        />
    </svg>
</template>
