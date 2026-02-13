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

<template>
    <div class="p-8 flex flex-col h-screen w-full items-center">
        <div
            class="time-block flex flex-col items-center gap-2 text-center select-none py-8 px-16 rounded-3xl w-fit absolute top-20"
        >
            <div class="text-7xl font-bold leading-tight tracking-wide">{{ timeStr }}</div>
            <div class="text-base font-normal text-gray-500">{{ dateStr }} {{ weekStr }}</div>
        </div>

        <!-- 底部 Dock 栏（仿 Mac 任务栏） -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
            <nav class="dock-bar flex items-end justify-center gap-1 px-4 py-3">
                <NuxtLink to="/notes" class="dock-item group flex flex-col items-center">
                    <span class="dock-label"> 笔记列表 </span>
                    <div class="dock-icon flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            class="size-9 text-black/95"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M12 10 L12 54 L44 54 L44 10 Z" />
                            <path d="M44 10 L52 10 L52 54 L44 54" stroke-dasharray="3 2" opacity="0.7" />
                            <line x1="18" y1="22" x2="38" y2="22" />
                            <line x1="18" y1="32" x2="38" y2="32" />
                            <line x1="18" y1="42" x2="30" y2="42" />
                        </svg>
                    </div>
                </NuxtLink>

                <NuxtLink to="/calendar" class="dock-item group flex flex-col items-center">
                    <span class="dock-label"> 时间与计划 </span>
                    <div class="dock-icon flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            class="size-9 text-black/95"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect x="10" y="14" width="44" height="40" rx="3" />
                            <line x1="10" y1="26" x2="54" y2="26" />
                            <rect x="22" y="6" width="6" height="12" rx="1" />
                            <rect x="36" y="6" width="6" height="12" rx="1" />
                            <circle cx="32" cy="40" r="10" />
                            <line x1="32" y1="40" x2="32" y2="34" />
                            <line x1="32" y1="40" x2="37" y2="42" />
                        </svg>
                    </div>
                </NuxtLink>

                <NuxtLink to="/settings" class="dock-item group flex flex-col items-center">
                    <span class="dock-label"> 设置 </span>
                    <div class="dock-icon flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            class="size-9 text-black/95"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M32 10 L51 21 L51 43 L32 54 L13 43 L13 21 Z" />
                            <circle cx="32" cy="32" r="8" />
                        </svg>
                    </div>
                </NuxtLink>
            </nav>
        </div>
    </div>
</template>

<style scoped lang="scss">
.time-block {
    background: radial-gradient(
        ellipse 80% 70% at 50% 50%,
        rgba(255, 255, 255, 0.85) 0%,
        rgba(255, 255, 255, 0.4) 60%,
        transparent 100%
    );
}

.dock-bar {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 20px;
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.12),
        0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.dock-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px 4px;
    border-radius: 12px;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-4px);

        .dock-label {
            opacity: 1;
            transform: translateX(-50%) scale(1);
        }

        .dock-icon {
            transform: scale(1.4);
        }
    }

    &:active {
        transform: translateY(-2px) scale(0.96);
    }

    .dock-label {
        position: absolute;
        bottom: calc(100% + 12px);
        left: 50%;
        transform: translateX(-50%) scale(0.9);
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        color: white;
        background: rgba(30, 30, 35, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 6px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .dock-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
}
</style>
