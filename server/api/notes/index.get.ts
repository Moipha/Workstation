import { listNotes } from '../../utils/noteManager';

export default defineEventHandler(async () => {
    return listNotes();
});
