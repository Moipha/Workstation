import { createNote } from '../../utils/noteManager';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ title: string }>(event);
    const title = body?.title?.trim() ?? '未命名笔记';

    const id = await createNote(title);
    return { id };
});
