'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
    Save,
    Send,
    CirclePlus,
    ArrowLeft,
    Music,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import TiptapEditor from "@/components/admin/TiptapEditor";
import { getCategories } from '@/app/actions/categoryActions';
import { createPost, getPostById, updatePost } from '@/app/actions/postActions';
import { uploadImage } from '@/app/actions/uploadActions';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [spotifyUri, setSpotifyUri] = useState('');
    const [rating, setRating] = useState('8.0');
    const [artistName, setArtistName] = useState('');
    const [tags, setTags] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(!!postId);

    useEffect(() => {
        const fetch = async () => {
            const data = await getCategories();
            setCategories(data);

            if (postId) {
                try {
                    const post = await getPostById(postId);
                    setTitle(post.title);
                    setContent(post.content);
                    setCategory(post.category_id);
                    setSpotifyUri(post.spotify_uri || '');
                    setRating(post.rating?.toString() || '8.0');
                    setArtistName(post.artist_name || '');
                    setTags(post.tags?.join(', ') || '');
                    setCoverUrl(post.cover_image || '');
                } catch (error) {
                    toast.error('Failed to load archive sequence');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetch();
    }, [postId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            setCoverUrl(url);
            toast.success('Cover image uploaded');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePublish = async (isDraft: boolean = false) => {
        if (!title || !content || !category) {
            toast.error('Required fields missing');
            return;
        }

        setIsPublishing(true);
        try {
            const generateSlug = (text: string) => {
                const sanitized = text
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-English/Numbers
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/-+/g, '-'); // Replace multiple hyphens with single one

                // Always append an 8-digit random suffix for unique indexing
                const randomIndex = Math.floor(10000000 + Math.random() * 90000000);
                return sanitized ? `${sanitized}-${randomIndex}` : `${randomIndex}`;
            };

            const slug = generateSlug(title);
            const postData = {
                title,
                content,
                category_id: category,
                spotify_uri: spotifyUri,
                cover_image: coverUrl,
                rating: parseFloat(rating),
                artist_name: artistName,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                is_published: !isDraft,
                slug
            };

            if (postId) {
                await updatePost(postId, postData);
                toast.success(isDraft ? 'Archive updated' : 'Unit recalibrated successfully');
            } else {
                await createPost(postData);
                toast.success(isDraft ? 'Draft sequence saved' : 'Unit published successfully');
            }
            router.push('/admin');
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setIsPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-black items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-accent-green" size={32} strokeWidth={1} />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-display">Decryption in progress...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-white selection:bg-accent-green/30">
            <Toaster position="top-center" />
            <AdminSidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
                            <ArrowLeft size={18} strokeWidth={1} />
                        </Link>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-display">Article Deployment</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handlePublish(true)}
                            className="text-[10px] uppercase tracking-[0.2em] font-display text-gray-500 hover:text-white px-6 py-2 border border-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                        >
                            <Save size={14} />
                            Save Draft
                        </button>
                        <button
                            onClick={() => handlePublish(false)}
                            disabled={isPublishing}
                            className="text-[10px] uppercase tracking-[0.2em] font-display bg-white text-black px-8 py-2.5 hover:bg-accent-green transition-all flex items-center gap-2 font-bold"
                        >
                            {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                            {isPublishing ? 'Transmitting...' : 'Execute Publish'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20">
                        <div className="space-y-12">
                            {/* Cover Image Upload Area */}
                            <label className="relative aspect-[21/9] w-full bg-gray-950 border border-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-accent-green/30 transition-all overflow-hidden group">
                                {coverUrl ? (
                                    <div className="relative w-full h-full">
                                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-[10px] uppercase tracking-widest bg-black/80 px-4 py-2 border border-white/10">Replace Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="relative inline-block">
                                            {isUploading ? <Loader2 className="animate-spin text-accent-green" size={24} /> : <CirclePlus size={24} className="text-gray-700 group-hover:text-accent-green transition-colors" strokeWidth={1} />}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-display">Inject Visual Component</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>

                            <textarea
                                placeholder="THE HEADLINE OF TOMORROW..."
                                className="w-full bg-transparent text-4xl md:text-6xl font-display font-light uppercase tracking-tighter text-white placeholder:text-gray-900 focus:outline-none resize-none overflow-hidden h-auto py-2 leading-[0.9] border-none focus:ring-0"
                                rows={2}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="border-t border-white/5 pt-12">
                                <TiptapEditor
                                    content={content}
                                    onChange={setContent}
                                />
                            </div>
                        </div>

                        <aside className="space-y-12">
                            <div className="space-y-10 border-l border-white/5 pl-10">
                                <div>
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-6 font-display">Review Rating (0.0 - 10.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        placeholder="8.0"
                                        className="w-full bg-transparent border-b border-white/10 rounded-none py-3 px-0 text-white text-3xl font-display tracking-widest focus:outline-none focus:border-accent-green transition-all"
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-6 font-display">Artist / Track Name</label>
                                    <input
                                        placeholder="IDENTITY_STRING"
                                        className="w-full bg-transparent border-b border-white/10 rounded-none py-3 px-0 text-white text-[10px] uppercase tracking-widest focus:outline-none focus:border-accent-green transition-all"
                                        value={artistName}
                                        onChange={(e) => setArtistName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-6 font-display">Meta Classification</label>
                                    <select
                                        className="w-full bg-transparent border-b border-white/10 rounded-none py-3 px-0 text-white text-[10px] uppercase tracking-widest focus:outline-none focus:border-accent-green transition-all appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="" className="bg-black">SELECT ARCHIVE</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-black">{cat.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-6 font-display">Tags (Comma Separated)</label>
                                    <input
                                        placeholder="TAG_SEQUENCE_1, TAG_SEQUENCE_2"
                                        className="w-full bg-transparent border-b border-white/10 rounded-none py-3 px-0 text-white text-[10px] uppercase tracking-widest focus:outline-none focus:border-accent-green transition-all"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] uppercase tracking-[0.3em] text-gray-600 block mb-6 font-display">Audio Integration (Spotify)</label>
                                    <div className="relative">
                                        <Music className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-700" size={14} strokeWidth={1} />
                                        <input
                                            placeholder="URI_SEQUENCE"
                                            className="w-full bg-transparent border-b border-white/10 rounded-none py-3 pl-8 pr-0 text-white text-[10px] tracking-widest focus:outline-none focus:border-accent-green transition-all font-mono uppercase"
                                            value={spotifyUri}
                                            onChange={(e) => setSpotifyUri(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[8px] text-gray-700 mt-4 uppercase tracking-widest leading-relaxed">System supports Track / Album / Artist schemas.</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Grainy Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
}
