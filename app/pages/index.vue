<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

let mainEl: HTMLElement | null = null;
let handler: (e: MouseEvent) => void;

onMounted(() => {
    mainEl = document.querySelector('.main');
    handler = (e: MouseEvent) => {
        if (!mainEl) return;
        mainEl.style.setProperty('--mouse-x', e.clientX + 'px');
        mainEl.style.setProperty('--mouse-y', e.clientY + 'px');
    };
    document.addEventListener('mousemove', handler);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handler);
});
</script>

<template>
    <div class="min-h-screen p-8 main">
        <div class="mt-4">
            <NuxtPage></NuxtPage>
        </div>
    </div>
</template>

<style scoped lang="scss">
.main {
    --mouse-x: 50%;
    --mouse-y: 50%;
    position: relative;
    background-color: white;
    background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 2.4rem 2.4rem;
}

/* 高亮层 */
.main::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
        linear-gradient(to right, rgba(96, 178, 213, 0.9) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(96, 178, 213, 0.9) 1px, transparent 1px);
    background-size: 2.4rem 2.4rem;
    mask-image: radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%);
}
</style>
