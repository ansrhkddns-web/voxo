import React from 'react';
import Link from 'next/link';
import {
    Activity,
    Database,
    Globe,
    Image as ImageIcon,
    Link2,
    Loader2,
    Mic2,
    Music,
    Tag,
    Type,
} from 'lucide-react';
import {
    aiDeskImageStyleOptions,
    aiDeskLanguageOptions,
    aiDeskLinkPriorityOptions,
    aiDeskToneOptions,
} from '../constants';
import {
    resolveManagedArticleLength,
    resolveManagedCategoryPrompt,
    resolveManagedCurationProfile,
} from '@/lib/ai/prompt-manager';
import type { AIDeskFormProps } from '../types';

function SectionTitle({ title, description }: { title: string; description: string }) {
    return (
        <div className="space-y-2">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                {title}
            </p>
            <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
    );
}

export function AIDeskForm({
    formData,
    categories,
    promptConfig,
    isLoading,
    onInputChange,
    onSubmit,
}: AIDeskFormProps) {
    const selectedProfile = resolveManagedCurationProfile(promptConfig, formData.curationProfileId);
    const selectedLength = resolveManagedArticleLength(promptConfig, formData.articleLengthId);
    const selectedCategory = categories.find((category) => category.id === formData.categoryId);
    const categoryProfile = resolveManagedCategoryPrompt(promptConfig, selectedCategory);

    return (
        <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-8 animate-fade-in-up">
            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionTitle
                    title="Target Setup"
                    description="Choose the artist and track first. The AI will use this as the base for research, Spotify matching, and article structure."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Mic2 size={12} /> Target Artist
                        </label>
                        <input
                            type="text"
                            name="artistName"
                            required
                            value={formData.artistName}
                            onChange={onInputChange}
                            placeholder="Lana Del Rey"
                            className="w-full border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Music size={12} /> Target Track
                        </label>
                        <input
                            type="text"
                            name="songTitle"
                            required
                            value={formData.songTitle}
                            onChange={onInputChange}
                            placeholder="Born To Die"
                            className="w-full border border-white/10 bg-black/40 px-4 py-4 text-sm text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionTitle
                    title="Output Setup"
                    description="Set the language and category so the generated draft lands closer to the tone and destination you want."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Globe size={12} /> Output Language
                        </label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {aiDeskLanguageOptions.map((option) => (
                                <option key={option} value={option} className="bg-black">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Database size={12} /> Category
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {categories.length === 0 ? <option value="">No categories</option> : null}
                            {categories.map((category) => (
                                <option key={category.id} value={category.id} className="bg-black">
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Tag size={12} /> Curation Profile
                        </label>
                        <select
                            name="curationProfileId"
                            value={formData.curationProfileId}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {promptConfig.curationProfiles.map((profile) => (
                                <option key={profile.id} value={profile.id} className="bg-black">
                                    {profile.label} - {profile.shortDescription}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Type size={12} /> Article Volume
                        </label>
                        <select
                            name="articleLengthId"
                            value={formData.articleLengthId}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {promptConfig.articleLengths.map((preset) => (
                                <option key={preset.id} value={preset.id} className="bg-black">
                                    {preset.label} - {preset.wordRangeLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 border border-accent-green/20 bg-accent-green/5 p-5 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-3">
                        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-accent-green">
                            Selected Curation Process
                        </p>
                        <p className="text-sm leading-relaxed text-gray-200">
                            {selectedProfile.longDescription}
                        </p>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Reader promise: {selectedProfile.readerPromise}
                        </p>
                        <Link
                            href="/admin/ai-prompts"
                            className="inline-flex items-center gap-2 border border-accent-green/30 px-3 py-2 font-display text-[10px] uppercase tracking-[0.24em] text-accent-green transition-colors hover:border-accent-green hover:bg-accent-green/10"
                        >
                            Manage Prompt Rules
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-accent-green">
                            Volume Guide
                        </p>
                        <p className="text-sm text-white">{selectedLength.wordRangeLabel}</p>
                        <p className="text-sm leading-relaxed text-gray-400">{selectedLength.guidance}</p>
                    </div>
                </div>

                <div className="border border-white/10 bg-black/20 p-5">
                    <div className="space-y-4">
                        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-accent-green">
                            Category Editorial Mode
                        </p>
                        <p className="text-sm leading-relaxed text-gray-200">
                            {categoryProfile.summary}
                        </p>
                        <p className="text-sm leading-relaxed text-gray-400">
                            {categoryProfile.editorialGoal}
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 border border-white/10 bg-white/[0.02] p-4">
                                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent-green">
                                    Title Rule
                                </p>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    {categoryProfile.titleDirective}
                                </p>
                            </div>
                            <div className="space-y-2 border border-white/10 bg-white/[0.02] p-4">
                                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent-green">
                                    Hero Excerpt Rule
                                </p>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    {categoryProfile.heroExcerptDirective}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2 border border-white/10 bg-white/[0.02] p-4">
                                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent-green">
                                    Opening Rule
                                </p>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    {categoryProfile.openingDirective}
                                </p>
                            </div>
                            <div className="space-y-2 border border-white/10 bg-white/[0.02] p-4">
                                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent-green">
                                    Ending Rule
                                </p>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    {categoryProfile.endingDirective}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 border border-white/10 bg-white/[0.02] p-4">
                            <p className="font-display text-[10px] uppercase tracking-[0.24em] text-accent-green">
                                Body Flow
                            </p>
                            <div className="space-y-2 text-sm leading-relaxed text-gray-300">
                                {categoryProfile.middleParagraphMoves.map((move) => (
                                    <p key={move}>{move}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-3 border border-white/10 bg-black/20 p-4">
                        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-accent-green">
                            Preferred Direction
                        </p>
                        <div className="space-y-2 text-sm leading-relaxed text-gray-300">
                            {selectedProfile.preferredPhrases.slice(0, 3).map((phrase) => (
                                <p key={phrase}>&ldquo;{phrase}&rdquo;</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 border border-white/10 bg-black/20 p-4">
                        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-accent-green">
                            Avoid Tone
                        </p>
                        <div className="space-y-2 text-sm leading-relaxed text-gray-400">
                            {selectedProfile.avoidPhrases.slice(0, 3).map((phrase) => (
                                <p key={phrase}>{phrase}</p>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 border border-white/10 bg-black/20 p-4">
                        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-accent-green">
                            Style Example
                        </p>
                        <p className="text-sm italic leading-relaxed text-gray-300">
                            {selectedProfile.styleExamples[0]}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                        <Tag size={12} /> Draft Direction Note
                    </label>
                    <textarea
                        name="concept"
                        rows={4}
                        value={formData.concept}
                        onChange={onInputChange}
                        placeholder={`Example: ${selectedProfile.defaultConcept}`}
                        className="w-full resize-none border border-white/10 bg-black/40 px-4 py-4 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-gray-700 focus:border-accent-green"
                    />
                </div>
            </section>

            <section className="space-y-6 border border-white/10 bg-white/[0.02] p-8">
                <SectionTitle
                    title="Style Controls"
                    description="Fine-tune how the draft sounds, what image references it suggests, and which external links it should prioritize."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Activity size={12} /> Writing Tone
                        </label>
                        <select
                            name="tone"
                            value={formData.tone}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {aiDeskToneOptions.map((option) => (
                                <option key={option} value={option} className="bg-black">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <ImageIcon size={12} /> Image Style
                        </label>
                        <select
                            name="imageStyle"
                            value={formData.imageStyle}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {aiDeskImageStyleOptions.map((option) => (
                                <option key={option} value={option} className="bg-black">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                            <Link2 size={12} /> Link Priority
                        </label>
                        <select
                            name="linkPriority"
                            value={formData.linkPriority}
                            onChange={onInputChange}
                            className="w-full appearance-none border border-white/10 bg-black/40 px-4 py-4 text-sm text-white transition-colors focus:border-accent-green focus:outline-none"
                        >
                            {aiDeskLinkPriorityOptions.map((option) => (
                                <option key={option} value={option} className="bg-black">
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-4 border border-accent-green/20 bg-accent-green/5 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent-green">
                        Draft Pipeline
                    </p>
                    <p className="text-sm text-gray-300">
                        The AI will research the target track, follow the selected curation process, generate a longer feature draft, match real genre tags, detect Spotify data, and pass everything into the editor.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex items-center justify-center gap-3 overflow-hidden bg-white px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-all hover:bg-accent-green hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="absolute inset-0 z-0 h-full w-full bg-white transition-colors group-hover:bg-accent-green"></span>
                    <span className="relative z-10 flex items-center gap-3">
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Generating Draft...</span>
                            </>
                        ) : (
                            <>
                                <Activity size={14} className="group-hover:animate-pulse" />
                                <span>Start Draft Generation</span>
                            </>
                        )}
                    </span>
                </button>
            </div>
        </form>
    );
}
