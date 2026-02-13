<template>
    <div class="p-8 flex flex-col h-full w-full items-center">
        <div
            class="time-block flex flex-col items-center gap-4 text-center select-none py-8 px-16 rounded-3xl w-fit"
        >
            <h1 class="text-2xl font-bold text-gray-700">笔记列表</h1>
            <p class="text-base font-normal text-gray-500">功能开发中，敬请期待</p>
            <NuxtLink
                to="/"
                class="mt-4 px-6 py-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors text-gray-600 text-sm font-medium"
            >
                返回首页
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.time-block {
    background: radial-gradient(
        ellipse 80% 70% at 50% 50%,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.4) 60%,
        transparent 100%
    );
}
</style>
