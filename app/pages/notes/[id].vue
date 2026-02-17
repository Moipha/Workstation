<script setup lang="ts">
const route = useRoute();
const noteId = computed(() => (route.params.id as string) ?? null);

const { note, loading, error, fetchNote, saveNote } = useNote(noteId);

watch(noteId, () => fetchNote(), { immediate: true });

const handleSave = async (
    content: string,
    metadata: { title: string; tags: string[]; createdAt: string },
) => {
    return saveNote(content, metadata);
};
</script>

<template>
    <div class="flex flex-col h-screen w-full">
        <header class="flex items-center gap-4 px-6 py-3 border-b border-gray-100 shrink-0">
            <NuxtLink
                to="/notes"
                class="text-gray-500 hover:text-gray-700 transition-colors"
            >
                ← 返回
            </NuxtLink>
            <span
                v-if="error"
                class="text-red-500 text-sm"
            >{{ error }}</span>
        </header>
        <main class="flex-1 overflow-hidden">
            <NoteEditor
                v-if="noteId"
                :note="note"
                :loading="loading"
                :on-save="handleSave"
            />
            <div
                v-else
                class="p-8 text-gray-500"
            >
                请选择或创建笔记
            </div>
        </main>
    </div>
</template>
