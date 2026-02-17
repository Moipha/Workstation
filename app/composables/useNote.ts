import { ref } from 'vue';
import type { Ref } from 'vue';

/** 笔记数据（与 API 返回一致） */
export interface NoteData {
    id: string;
    title: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    content: string;
}

/** 保存状态 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved';

/**
 * 笔记 API 交互
 * @param noteId 笔记 ID（可为 null，表示新建）
 */
export function useNote(noteId: Ref<string | null>) {
    const note = ref<NoteData | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /** 获取笔记 */
    async function fetchNote() {
        const id = noteId.value;
        if (!id) {
            note.value = null;
            return;
        }
        loading.value = true;
        error.value = null;
        try {
            const data = await $fetch<NoteData>(`/api/notes/${id}`);
            note.value = data;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '获取笔记失败';
            note.value = null;
        } finally {
            loading.value = false;
        }
    }

    /** 保存笔记 */
    async function saveNote(
        content: string,
        metadata: { title: string; tags: string[]; createdAt: string },
    ): Promise<boolean> {
        const id = noteId.value;
        if (!id) return false;

        try {
            await $fetch(`/api/notes/${id}`, {
                method: 'PUT',
                body: { content, metadata },
            });
            return true;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '保存失败';
            return false;
        }
    }

    /** 创建新笔记 */
    async function createNote(title: string): Promise<string | null> {
        try {
            const { id } = await $fetch<{ id: string }>('/api/notes', {
                method: 'POST',
                body: { title },
            });
            return id;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '创建失败';
            return null;
        }
    }

    return {
        note,
        loading,
        error,
        fetchNote,
        saveNote,
        createNote,
    };
}
