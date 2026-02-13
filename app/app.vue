<template>
    <div class="main min-h-screen">
        <div class="main-content">
            <NuxtLayout>
                <main>
                    <NuxtPage />
                </main>
            </NuxtLayout>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

let mainEl: HTMLElement | null = null;
let handler: (e: MouseEvent) => void;
let mouseOutHandler: (e: MouseEvent) => void;

onMounted(() => {
    mainEl = document.querySelector('.main');
    handler = (e: MouseEvent) => {
        if (!mainEl) return;
        mainEl.style.setProperty('--mouse-x', e.clientX + 'px');
        mainEl.style.setProperty('--mouse-y', e.clientY + 'px');
        mainEl.style.setProperty('--highlight-opacity', '1');
    };
    mouseOutHandler = (e: MouseEvent) => {
        if (!mainEl) return;
        if (!e.relatedTarget || !(e.relatedTarget instanceof Node) || !document.body.contains(e.relatedTarget)) {
            mainEl.style.setProperty('--highlight-opacity', '0');
            setTimeout(() => {
                if (mainEl) {
                    mainEl.style.setProperty('--mouse-x', '-9999px');
                    mainEl.style.setProperty('--mouse-y', '-9999px');
                }
            }, 200);
        }
    };
    document.addEventListener('mousemove', handler);
    document.addEventListener('mouseout', mouseOutHandler);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handler);
    document.removeEventListener('mouseout', mouseOutHandler);
});
</script>
<style scoped lang="scss">
.main {
    --mouse-x: -9999px;
    --mouse-y: -9999px;
    --highlight-opacity: 0;
    position: relative;
    background-color: white;
    background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 1px, transparent 1px);
    background-size: 2.4rem 2.4rem;
}

.main-content {
    position: relative;
    z-index: 1;
}

.main::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: var(--highlight-opacity);
    transition: opacity 0.2s ease;
    background-image:
        linear-gradient(to right, var(--primary) 1px, transparent 1px),
        linear-gradient(to bottom, var(--primary) 1px, transparent 1px);
    background-size: 2.4rem 2.4rem;
    mask-image: radial-gradient(circle 120px at var(--mouse-x) var(--mouse-y), black 40%, transparent 100%);
}
</style>
