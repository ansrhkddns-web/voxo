'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Quote,
    List,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: 'bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', activeOptions: { level: 1 } },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', activeOptions: { level: 2 } },
        { type: 'divider' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: 'bulletList' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: 'blockquote' },
        { type: 'divider' },
        { icon: LinkIcon, action: setLink, active: 'link' },
        { icon: ImageIcon, action: addImage },
        { type: 'spacer' },
        { icon: Undo, action: () => editor.chain().focus().undo().run() },
        { icon: Redo, action: () => editor.chain().focus().redo().run() },
    ];

    return (
        <div className="sticky top-[80px] z-40 bg-black border border-white/5 p-1 flex items-center gap-0.5 mb-10 overflow-x-auto no-scrollbar">
            {buttons.map((btn, i) => {
                if (btn.type === 'divider') return <div key={i} className="h-4 w-px bg-white/5 mx-2" />;
                if (btn.type === 'spacer') return <div key={i} className="flex-1" />;

                const Icon = btn.icon!;
                const isActive = btn.active ? editor.isActive(btn.active, btn.activeOptions) : false;

                return (
                    <button
                        key={i}
                        onClick={btn.action}
                        className={cn(
                            "size-10 flex items-center justify-center transition-all duration-300",
                            isActive
                                ? "bg-white text-black"
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
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image,
            Placeholder.configure({
                placeholder: 'START WRITING THE NEXT LEGACY...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-invert max-w-none focus:outline-none min-h-[600px] font-serif font-light leading-relaxed text-gray-400 selection:bg-accent-green/30 px-2',
            },
        },
    });

    return (
        <div className="w-full">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
