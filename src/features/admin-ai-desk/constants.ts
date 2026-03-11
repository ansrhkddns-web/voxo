import { Database, Music, Sparkles, Tag, Type } from 'lucide-react';
import type { AIDeskAgentDefinition, AIDeskFormState } from './types';
import {
    defaultArticleLengthId,
    defaultCurationProfileId,
} from './curation-profiles';

export const DEFAULT_AI_DESK_FORM: AIDeskFormState = {
    artistName: '',
    songTitle: '',
    language: 'English',
    categoryId: '',
    curationProfileId: defaultCurationProfileId,
    articleLengthId: defaultArticleLengthId,
    concept: '',
    tone: 'Editorial',
    imageStyle: 'Cinematic',
    linkPriority: 'Listening',
};

export const aiDeskAgents: AIDeskAgentDefinition[] = [
    { id: 'research', name: 'Research Agent', model: 'Gemini 2.5 Flash', icon: Database },
    { id: 'write', name: 'Writing Agent', model: 'Gemini 2.5 Flash', icon: Type },
    { id: 'refine', name: 'Refine Agent', model: 'Gemini 2.5 Flash', icon: Sparkles },
    { id: 'seo', name: 'SEO Agent', model: 'Gemini 2.5 Flash', icon: Tag },
    { id: 'media', name: 'Media Agent', model: 'Spotify / YouTube', icon: Music },
];

export const aiDeskLanguageOptions = ['English', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French'];

export const aiDeskToneOptions = ['Editorial', 'Analytical', 'Conversational', 'Cultural'];
export const aiDeskImageStyleOptions = ['Cinematic', 'Minimal', 'Texture-driven', 'Portrait'];
export const aiDeskLinkPriorityOptions = ['Listening', 'Performance', 'Reference'];
