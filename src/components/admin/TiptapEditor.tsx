'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Typography } from '@tiptap/extension-typography';
import { Extension, Mark, textblockTypeInputRule, markInputRule, nodeInputRule, InputRule } from '@tiptap/core';
import { Strike } from '@tiptap/extension-strike';
import { Youtube } from '@tiptap/extension-youtube';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

/**
 * Spoiler Mark Extension
 * Custom mark for Steam-style [spoiler] text.
 */
const Spoiler = Mark.create({
    name: 'spoiler',
    addOptions() {
        return {
            HTMLAttributes: {
                class: 'spoiler-text',
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: element => (element as HTMLElement).classList.contains('spoiler-text') && null,
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', HTMLAttributes, 0];
    },
});

const VoxoBBCode = Extension.create({
    name: 'voxoBBCode',

    addInputRules() {
        return [
            // BBCode Headings: [h1] Title [/h1] (Block rule)
            ...[1, 2, 3].map(level => textblockTypeInputRule({
                find: new RegExp(`^\\[h${level}\\]\\s*(.*)\\s*\\[\\/h${level}\\]$`),
                type: this.editor.schema.nodes.heading,
                getAttributes: { level },
            })),

            // BBCode Bold: [b]text[/b]
            markInputRule({
                find: /\[b\](.*?)\[\/b\]/,
                type: this.editor.schema.marks.bold,
            }),
            // BBCode Italic: [i]text[/i]
            markInputRule({
                find: /\[i\](.*?)\[\/i\]/,
                type: this.editor.schema.marks.italic,
            }),
            // BBCode Underline: [u]text[/u]
            markInputRule({
                find: /\[u\](.*?)\[\/u\]/,
                type: this.editor.schema.marks.underline,
            }),
            // BBCode Strike: [strike]text[/strike]
            markInputRule({
                find: /\[strike\](.*?)\[\/strike\]/,
                type: this.editor.schema.marks.strike,
            }),
            // BBCode Monospace: [code]text[/code] (Inline)
            markInputRule({
                find: /\[code\](.*?)\[\/code\]/,
                type: this.editor.schema.marks.code,
            }),
            // BBCode Spoiler: [spoiler]text[/spoiler]
            markInputRule({
                find: /\[spoiler\](.*?)\[\/spoiler\]/,
                type: this.editor.schema.marks.spoiler,
            }),
            // BBCode URL: [url=http://...]label[/url]
            markInputRule({
                find: /\[url=(.*?)\](.*?)\[\/url\]/,
                type: this.editor.schema.marks.link,
                getAttributes: (match) => ({
                    href: match[1],
                }),
            }),
            // BBCode Horizontal Rule: [hr][/hr]
            nodeInputRule({
                find: /\[hr\]\[\/hr\]$/,
                type: this.editor.schema.nodes.horizontalRule,
            }),

            // BBCode Lists (Block rules, triggered by typing [list] and space at start of line)
            textblockTypeInputRule({
                find: /^\[list\]\s$/,
                type: this.editor.schema.nodes.bulletList,
            }),
            textblockTypeInputRule({
                find: /^\[olist\]\s$/,
                type: this.editor.schema.nodes.orderedList,
            }),
            // BBCode List Item: [*] (Block rule)
            textblockTypeInputRule({
                find: /^\[\*\]\s$/,
                type: this.editor.schema.nodes.listItem,
            }),

            // BBCode Quote: [quote=author] text [/quote]
            new InputRule({
                find: /^\[quote=(.*?)\]\s*(.*)\s*\[\/quote\]$/,
                handler: ({ state, range, match }) => {
                    const author = match[1];
                    const content = match[2];

                    const blockquote = this.editor.schema.nodes.blockquote.create(null, [
                        this.editor.schema.nodes.paragraph.create(null, [
                            this.editor.schema.text(`${author} 님이 먼저 게시:`, [this.editor.schema.marks.bold.create()]),
                        ]),
                        this.editor.schema.nodes.paragraph.create(null, [
                            this.editor.schema.text(content),
                        ]),
                    ]);

                    state.tr.replaceWith(range.from, range.to, blockquote);
                    return null;
                },
            }),

            // BBCode Code Block: [code] ... [/code]
            textblockTypeInputRule({
                find: /^\[code\]\s*(.*)\s*\[\/code\]$/,
                type: this.editor.schema.nodes.codeBlock,
            }),

            // --- JIRA/Wiki Compatibility ---
            ...[1, 2, 3].map(level => textblockTypeInputRule({
                find: new RegExp(`^h${level}\\.\\s$`),
                type: this.editor.schema.nodes.heading,
                getAttributes: { level },
            })),
            markInputRule({
                find: /\*([^*]+)\*$/,
                type: this.editor.schema.marks.bold,
            }),
            markInputRule({
                find: /\+([^+]+)\+$/,
                type: this.editor.schema.marks.underline,
            }),
            markInputRule({
                find: /\{\{([^}]+)\}\} $/,
                type: this.editor.schema.marks.code,
            }),
        ];
    },
});

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    CheckSquare,
    Table as TableIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Code,
    Video,
    Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ... (previous extensions like Spoiler and VoxoBBCode are above this point in the file)

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutubeVideo = () => {
        const url = window.prompt('Enter YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
            });
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const buttons = [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: 'bold', tooltip: 'Bold ([b]text[/b])' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', tooltip: 'Italic ([i]text[/i])' },
        { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: 'underline', tooltip: 'Underline ([u]text[/u])' },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: 'code', tooltip: 'Monospaced ([code]text[/code])' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', activeOptions: { level: 1 }, tooltip: 'Heading 1 ([h1])' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', activeOptions: { level: 2 }, tooltip: 'Heading 2 ([h2])' },
        { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: 'heading', activeOptions: { level: 3 }, tooltip: 'Heading 3 ([h3])' },
        { type: 'divider' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList', tooltip: 'Bullet List ([list])' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: 'orderedList', tooltip: 'Ordered List ([olist])' },
        { icon: CheckSquare, action: () => editor.chain().focus().toggleTaskList().run(), active: 'taskList', tooltip: 'Task List' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote', tooltip: 'Blockquote ([quote])' },
        { type: 'divider' },
        { icon: TableIcon, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), active: 'table', tooltip: 'Insert Table' },
        { icon: LinkIcon, action: setLink, active: 'link', tooltip: 'Link ([url=...])' },
        { icon: ImageIcon, action: addImage, tooltip: 'Image' },
        { icon: Video, action: addYoutubeVideo, tooltip: 'YouTube Video' },
        { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), tooltip: 'Horizontal Rule ([hr])' },
        { type: 'spacer' },
        { icon: Undo, action: () => editor.chain().focus().undo().run() },
        { icon: Redo, action: () => editor.chain().focus().redo().run() },
    ];

    return (
        <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 p-2 flex items-center gap-1 mb-8 overflow-x-auto no-scrollbar shadow-2xl">
            {buttons.map((btn, i) => {
                if (btn.type === 'divider') return <div key={i} className="h-4 w-px bg-white/10 mx-2" />;
                if (btn.type === 'spacer') return <div key={i} className="flex-1" />;

                const Icon = btn.icon!;
                const isActive = btn.active ? editor.isActive(btn.active, btn.activeOptions) : false;

                return (
                    <button
                        key={i}
                        type="button"
                        onClick={btn.action}
                        title={btn.tooltip}
                        className={cn(
                            "size-9 flex items-center justify-center transition-all duration-300 rounded-sm hover:scale-105",
                            isActive
                                ? "bg-accent-green text-black"
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Icon size={14} />
                    </button>
                );
            })}
        </div>
    );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
                bold: false, // Handled via VoxoBBCode
            }),
            VoxoBBCode,
            Spoiler,
            Strike,
            Underline,
            Typography,
            HorizontalRule,
            Youtube.configure({
                controls: false,
                nocookie: true,
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({ nested: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent-green underline cursor-pointer' } }),
            Image.configure({ HTMLAttributes: { class: 'rounded-sm border border-white/10 my-8 w-full' } }),
            Placeholder.configure({
                placeholder: 'START TYPING... [h1] TITLE [/h1], [b]BOLD[/b], [spoiler]SECRET[/spoiler] OR / FOR COMMANDS',
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-invert max-w-none focus:outline-none min-h-[600px] font-serif font-light leading-relaxed text-gray-300 selection:bg-accent-green/30 px-2 py-4',
            },
        },
    });

    return (
        <div className="w-full relative group/editor">
            <MenuBar editor={editor} />

            {editor && (
                <>
                    <BubbleMenu
                        editor={editor}
                        className="flex bg-black border border-white/10 rounded overflow-hidden shadow-2xl"
                    >
                        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-2 transition-colors", editor.isActive('bold') ? "text-accent-green" : "text-gray-400 hover:text-white")}>
                            <Bold size={14} />
                        </button>
                        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-2 transition-colors", editor.isActive('italic') ? "text-accent-green" : "text-gray-400 hover:text-white")}>
                            <Italic size={14} />
                        </button>
                        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("p-2 transition-colors", editor.isActive('underline') ? "text-accent-green" : "text-gray-400 hover:text-white")}>
                            <UnderlineIcon size={14} />
                        </button>
                    </BubbleMenu>

                    <FloatingMenu
                        editor={editor}
                        className="flex flex-col bg-black border border-white/10 rounded shadow-2xl p-2 min-w-[180px]"
                    >
                        <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 px-2">Quick Actions</p>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className="flex items-center gap-3 px-2 py-1.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white rounded transition-all"
                        >
                            <Heading1 size={14} /> Heading 1
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className="flex items-center gap-3 px-2 py-1.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white rounded transition-all"
                        >
                            <Heading2 size={14} /> Heading 2
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className="flex items-center gap-3 px-2 py-1.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white rounded transition-all"
                        >
                            <List size={14} /> Bullet List
                        </button>
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className="flex items-center gap-3 px-2 py-1.5 text-[11px] text-gray-300 hover:bg-white/5 hover:text-white rounded transition-all"
                        >
                            <Quote size={14} /> Blockquote
                        </button>
                    </FloatingMenu>
                </>
            )}

            <div className="relative">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #4b5563;
                    pointer-events: none;
                    height: 0;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: 0.1em;
                    font-size: 11px;
                    text-transform: uppercase;
                }
                .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding: 0;
                }
                .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
                    appearance: none;
                    width: 1.2rem;
                    height: 1.2rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05);
                    cursor: pointer;
                    position: relative;
                    margin: 0;
                }
                .ProseMirror ul[data-type="taskList"] input[type="checkbox"]:checked {
                    background: #10b981;
                    border-color: #10b981;
                }
                .ProseMirror ul[data-type="taskList"] input[type="checkbox"]:checked::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: black;
                    font-size: 0.8rem;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 0;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .ProseMirror td, .ProseMirror th {
                    min-width: 1em;
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 3px 5px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    font-weight: bold;
                    text-align: left;
                    background-color: rgba(255,255,255,0.02);
                }
                .spoiler-text {
                    background-color: #1a1a1a;
                    color: transparent;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    padding: 0 4px;
                    border-radius: 2px;
                }
                .spoiler-text:hover {
                    background-color: #333;
                    color: inherit;
                }
            `}</style>
        </div>
    );
}
