import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';
import removeMd from 'remove-markdown';
import { prisma } from './prisma';

const NOTES_DIR = join(process.cwd(), 'data', 'notes');

/** 确保 notes 目录存在 */
async function ensureNotesDir(): Promise<void> {
    await mkdir(NOTES_DIR, { recursive: true });
}

/** 从 Markdown 正文提取纯文本（用于搜索索引） */
function extractPlainText(content: string): string {
    const stripped = removeMd(content);
    return stripped.replace(/\s+/g, ' ').trim().slice(0, 10000);
}

/** 笔记元数据 */
export interface NoteMetadata {
    title: string;
    tags: string[];
    createdAt: string; // ISO string
}

/** 合并后的笔记数据（用于返回给前端） */
export interface NoteData {
    id: string;
    title: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    content: string; // 纯 Markdown 正文（不含 Frontmatter）
}

/** 根据 id 生成 filePath（与 createNote 保持一致） */
function toFilePath(id: string): string {
    return `${id}.md`;
}

/**
 * 保存笔记（双写：文件 + 数据库）
 * @param id 笔记 UUID
 * @param content Markdown 正文（不含 Frontmatter）
 * @param metadata 元数据
 */
export async function saveNote(
    id: string,
    content: string,
    metadata: NoteMetadata,
): Promise<void> {
    await ensureNotesDir();

    const textContent = extractPlainText(content);
    const filePath = toFilePath(id);

    const frontmatterData = {
        uuid: id,
        title: metadata.title,
        tags: metadata.tags,
        createdAt: metadata.createdAt,
    };
    const fullContent = matter.stringify(content.trim(), frontmatterData, {
        language: 'yaml',
        delimiters: ['---', '---'],
    });

    const absPath = join(NOTES_DIR, filePath);
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, fullContent, 'utf-8');

    const now = new Date();

    await prisma.note.upsert({
        where: { id },
        create: {
            id,
            title: metadata.title,
            tags: JSON.stringify(metadata.tags),
            filePath,
            textContent,
            createdAt: new Date(metadata.createdAt),
            updatedAt: now,
        },
        update: {
            title: metadata.title,
            tags: JSON.stringify(metadata.tags),
            filePath,
            textContent,
            updatedAt: now,
        },
    });
}

/**
 * 获取笔记（先查库取 filePath，再读文件）
 */
export async function getNote(id: string): Promise<NoteData | null> {
    const record = await prisma.note.findUnique({
        where: { id },
    });
    if (!record) {
        return null;
    }

    const absPath = join(NOTES_DIR, record.filePath);
    let raw: string;
    try {
        raw = await readFile(absPath, 'utf-8');
    } catch (err) {
        throw new Error(`无法读取笔记文件: ${record.filePath}`, {
            cause: err,
        });
    }

    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const title = typeof data.title === 'string' ? data.title : record.title;
    const createdAt =
        typeof data.createdAt === 'string' ? data.createdAt : record.createdAt.toISOString();
    const updatedAt = record.updatedAt.toISOString();

    return {
        id,
        title,
        tags,
        createdAt,
        updatedAt,
        content: parsed.content.trim(),
    };
}

/**
 * 创建新笔记
 * @param title 标题
 * @returns 新笔记的 id (UUID)
 */
export async function createNote(title: string): Promise<string> {
    await ensureNotesDir();

    const id = crypto.randomUUID();
    const filePath = toFilePath(id);
    const now = new Date();

    const frontmatterData = {
        uuid: id,
        title,
        tags: [] as string[],
        createdAt: now.toISOString(),
    };
    const fullContent = matter.stringify(`# ${title}\n\n`, frontmatterData, {
        language: 'yaml',
        delimiters: ['---', '---'],
    });

    const absPath = join(NOTES_DIR, filePath);
    await writeFile(absPath, fullContent, 'utf-8');

    await prisma.note.create({
        data: {
            id,
            title,
            tags: JSON.stringify([]),
            filePath,
            textContent: extractPlainText(`# ${title}`),
            createdAt: now,
            updatedAt: now,
        },
    });

    return id;
}

/**
 * 列出所有笔记（按更新时间倒序）
 */
export async function listNotes(): Promise<Pick<NoteData, 'id' | 'title' | 'updatedAt'>[]> {
    const records = await prisma.note.findMany({
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, updatedAt: true },
    });
    return records.map((r) => ({
        id: r.id,
        title: r.title,
        updatedAt: r.updatedAt.toISOString(),
    }));
}

/**
 * 搜索笔记（对 title 和 textContent 进行模糊查询）
 */
export async function searchNotes(query: string): Promise<NoteData[]> {
    const trimmed = query.trim();
    if (!trimmed) {
        return [];
    }

    const records = await prisma.note.findMany({
        where: {
            OR: [
                { title: { contains: trimmed } },
                { textContent: { contains: trimmed } },
            ],
        },
        orderBy: { updatedAt: 'desc' },
    });

    const results: NoteData[] = [];
    for (const r of records) {
        const note = await getNote(r.id);
        if (note) {
            results.push(note);
        }
    }
    return results;
}
