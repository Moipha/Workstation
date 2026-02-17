import { saveNote } from '../../utils/noteManager';
import type { NoteMetadata } from '../../utils/noteManager';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, message: '缺少笔记 ID' });
    }

    const body = await readBody<{ content: string; metadata: NoteMetadata }>(event);
    if (!body?.content || !body?.metadata) {
        throw createError({ statusCode: 400, message: '缺少 content 或 metadata' });
    }

    const { content, metadata } = body;
    if (
        typeof content !== 'string' ||
        typeof metadata?.title !== 'string' ||
        !Array.isArray(metadata?.tags) ||
        typeof metadata?.createdAt !== 'string'
    ) {
        throw createError({ statusCode: 400, message: 'metadata 格式错误' });
    }

    await saveNote(id, content, metadata);
    return { ok: true };
});
