<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { useDebounce } from '~/composables/useDebounce';
import type { NoteData } from '~/composables/useNote';
import type { SaveStatus } from '~/composables/useNote';

const props = defineProps<{
    note: NoteData | null;
    loading?: boolean;
    onSave: (content: string, metadata: { title: string; tags: string[]; createdAt: string }) => Promise<boolean>;
}>();

const saveStatus = ref<SaveStatus>('saved');
const title = ref('');
const isClient = ref(false);

onMounted(() => {
    isClient.value = true;
});

watch(
    () => props.note,
    (n) => {
        title.value = n?.title ?? '';
    },
    { immediate: true },
);

const performSave = async () => {
    const ed = editor.value;
    if (!ed || !props.note) return;

    const markdown = typeof ed.getMarkdown === 'function' ? ed.getMarkdown() : ed.getHTML();
    saveStatus.value = 'saving';

    const ok = await props.onSave(markdown, {
        title: title.value || props.note.title,
        tags: props.note.tags ?? [],
        createdAt: props.note.createdAt,
    });

    saveStatus.value = ok ? 'saved' : 'unsaved';
};

const debouncedSave = useDebounce(performSave, 1500);

const editor = useEditor({
    content: '',
    extensions: [StarterKit, Markdown],
    editable: true,
    editorProps: {
        attributes: {
            class: 'note-editor-content focus:outline-none min-h-[400px]',
        },
    },
    onUpdate: () => {
        saveStatus.value = 'unsaved';
        debouncedSave();
    },
});

/* 当 note 加载完成后，将 Markdown 写入编辑器 */
watch(
    () => [props.note, editor.value] as const,
    ([n, ed]) => {
        if (ed && n) {
            const content = n.content ?? '';
            const current = typeof ed.getMarkdown === 'function' ? ed.getMarkdown() : ed.getHTML();
            if (current !== content) {
                ed.commands.setContent(content, { contentType: 'markdown', emitUpdate: false });
            }
        }
    },
    { immediate: true },
);

/* 标题变更时也触发保存（排除从 props 同步时的触发） */
watch(title, (newVal) => {
    if (!props.note || newVal === props.note.title) return;
    saveStatus.value = 'unsaved';
    debouncedSave();
});

onBeforeUnmount(() => {
    editor.value?.destroy();
});
</script>

<template>
    <div class="note-editor flex flex-col h-full w-full">
        <!-- 状态指示器 -->
        <div class="flex justify-end items-center gap-2 px-4 py-2 text-sm text-gray-500">
            <span
                v-if="loading"
                class="status-dot status-loading"
            />
            <span v-else-if="saveStatus === 'saving'" class="status-text">保存中...</span>
            <span v-else-if="saveStatus === 'unsaved'" class="status-text text-amber-600">未保存</span>
            <span v-else class="status-text text-emerald-600">已保存</span>
        </div>

        <!-- 标题栏 -->
        <div class="px-6 pb-2 border-b border-gray-100">
            <input
                v-model="title"
                type="text"
                placeholder="无标题"
                class="title-input w-full text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300"
            />
        </div>

        <!-- 编辑区 -->
        <div class="flex-1 overflow-auto px-6 py-6">
            <ClientOnly>
                <EditorContent
                    v-if="isClient"
                    :editor="editor"
                    class="note-editor-body"
                />
                <div
                    v-else
                    class="min-h-[400px] animate-pulse bg-gray-50 rounded"
                />
            </ClientOnly>
        </div>
    </div>
</template>

<style scoped>
.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}
.status-loading {
    animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
    50% {
        opacity: 0.4;
    }
}

/* Typora 风格：简洁编辑区 */
:deep(.note-editor-content) {
    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #374151;
}
:deep(.note-editor-content h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}
:deep(.note-editor-content h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
}
:deep(.note-editor-content h3) {
    font-size: 1.25rem;
    font-weight: 600;
}
:deep(.note-editor-content p) {
    margin-bottom: 0.75rem;
}
:deep(.note-editor-content ul),
:deep(.note-editor-content ol) {
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
}
:deep(.note-editor-content pre) {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 0.75rem;
}
:deep(.note-editor-content code) {
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
}
:deep(.note-editor-content blockquote) {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 0.75rem 0;
    color: #6b7280;
}
</style>
