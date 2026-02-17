<script setup lang="ts">
const notes = ref<{ id: string; title: string; updatedAt: string }[]>([]);
const loading = ref(true);

async function loadNotes() {
    loading.value = true;
    try {
        notes.value = await $fetch('/api/notes');
    } catch {
        notes.value = [];
    } finally {
        loading.value = false;
    }
}

async function createNew() {
    try {
        const { id } = await $fetch<{ id: string }>('/api/notes', {
            method: 'POST',
            body: { title: '未命名笔记' },
        });
        await navigateTo(`/notes/${id}`);
    } catch {
        // 忽略
    }
}

onMounted(loadNotes);
</script>

<template>
    <div class="p-8 flex flex-col h-full w-full max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-gray-700">笔记列表</h1>
            <button
                class="px-4 py-2 rounded-xl bg-white/80 hover:bg-white transition-colors text-gray-700 text-sm font-medium shadow-sm"
                @click="createNew"
            >
                新建笔记
            </button>
        </div>
        <div
            v-if="loading"
            class="text-gray-500 py-8"
        >
            加载中...
        </div>
        <ul
            v-else-if="notes.length"
            class="space-y-2"
        >
            <li
                v-for="n in notes"
                :key="n.id"
            >
                <NuxtLink
                    :to="`/notes/${n.id}`"
                    class="block px-4 py-3 rounded-xl bg-white/60 hover:bg-white/80 transition-colors"
                >
                    <span class="font-medium text-gray-800">{{ n.title || '未命名' }}</span>
                    <span class="text-gray-400 text-sm ml-2">{{ new Date(n.updatedAt).toLocaleDateString() }}</span>
                </NuxtLink>
            </li>
        </ul>
        <p
            v-else
            class="text-gray-500 py-8"
        >
            暂无笔记，点击「新建笔记」开始创作
        </p>
        <NuxtLink
            to="/"
            class="mt-6 text-gray-500 hover:text-gray-700 text-sm"
        >
            ← 返回首页
        </NuxtLink>
    </div>
</template>
