<template>
    <div class="p-8 flex flex-col h-screen items-center">
        <div
            class="time-block flex flex-col items-center gap-2 text-center mt-20 select-none py-8 px-16 rounded-3xl w-fit"
        >
            <div class="text-7xl font-bold leading-tight tracking-wide">{{ timeStr }}</div>
            <div class="text-base font-normal text-gray-500">{{ dateStr }} {{ weekStr }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const timeStr = ref('');
const dateStr = ref('');
const weekStr = ref('');

const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const setting = ref({
    showSeconds: false,
});

function updateTime() {
    const now = new Date();
    timeStr.value =
        now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            second: setting.value.showSeconds ? '2-digit' : undefined,
        }) ?? '';
    dateStr.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) ?? '';
    weekStr.value = weeks[now.getDay()] ?? '';
}

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
    clearInterval(timer);
});
</script>

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
