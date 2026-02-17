import { getNote } from '../../utils/noteManager';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({ statusCode: 400, message: '缺少笔记 ID' });
    }

    const note = await getNote(id);
    if (!note) {
        throw createError({ statusCode: 404, message: '笔记不存在' });
    }

    return note;
});
