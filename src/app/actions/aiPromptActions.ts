'use server';

import { revalidatePath } from 'next/cache';
import { updateSetting } from '@/app/actions/settingsActions';
import {
    AI_PROMPT_SETTING_KEYS,
    DEFAULT_AI_PROMPT_TEMPLATES,
    normalizePromptTemplates,
    type AIPromptTemplates,
} from '@/lib/ai/prompt-manager';
import { createClient } from '@/lib/supabase/server';
import type { CategoryRecord } from '@/types/content';

interface SettingRow {
    setting_key: string;
    setting_value: string | null;
}

export interface AIPromptManagerData {
    categories: CategoryRecord[];
    templates: AIPromptTemplates;
    managerConfigRaw: string | null;
}

export async function getAiPromptManagerData(): Promise<AIPromptManagerData> {
    const supabase = await createClient();
    const settingKeys = Object.values(AI_PROMPT_SETTING_KEYS);

    const [{ data: categories, error: categoriesError }, { data: settings, error: settingsError }] =
        await Promise.all([
            supabase.from('categories').select('id, name, slug').order('name'),
            supabase
                .from('site_settings')
                .select('setting_key, setting_value')
                .in('setting_key', settingKeys),
        ]);

    if (categoriesError) {
        throw categoriesError;
    }

    if (settingsError) {
        throw settingsError;
    }

    const settingMap = new Map<string, string | null>(
        ((settings ?? []) as SettingRow[]).map((row) => [row.setting_key, row.setting_value])
    );

    return {
        categories: ((categories ?? []) as CategoryRecord[]) || [],
        templates: normalizePromptTemplates({
            concept: settingMap.get(AI_PROMPT_SETTING_KEYS.concept) ?? DEFAULT_AI_PROMPT_TEMPLATES.concept,
            research: settingMap.get(AI_PROMPT_SETTING_KEYS.research) ?? DEFAULT_AI_PROMPT_TEMPLATES.research,
            write: settingMap.get(AI_PROMPT_SETTING_KEYS.write) ?? DEFAULT_AI_PROMPT_TEMPLATES.write,
            refine: settingMap.get(AI_PROMPT_SETTING_KEYS.refine) ?? DEFAULT_AI_PROMPT_TEMPLATES.refine,
            seo: settingMap.get(AI_PROMPT_SETTING_KEYS.seo) ?? DEFAULT_AI_PROMPT_TEMPLATES.seo,
        }),
        managerConfigRaw: settingMap.get(AI_PROMPT_SETTING_KEYS.matrix) ?? null,
    };
}

export async function saveAiPromptManagerData(input: {
    templates: AIPromptTemplates;
    managerConfigRaw: string;
}) {
    const normalizedTemplates = normalizePromptTemplates(input.templates);

    const results = await Promise.all([
        updateSetting(AI_PROMPT_SETTING_KEYS.concept, normalizedTemplates.concept),
        updateSetting(AI_PROMPT_SETTING_KEYS.research, normalizedTemplates.research),
        updateSetting(AI_PROMPT_SETTING_KEYS.write, normalizedTemplates.write),
        updateSetting(AI_PROMPT_SETTING_KEYS.refine, normalizedTemplates.refine),
        updateSetting(AI_PROMPT_SETTING_KEYS.seo, normalizedTemplates.seo),
        updateSetting(AI_PROMPT_SETTING_KEYS.matrix, input.managerConfigRaw),
    ]);

    revalidatePath('/admin/ai-prompts');
    revalidatePath('/admin/ai-desk');

    const failed = results.find((result) => !result.success);

    if (failed) {
        return {
            success: false,
            error: failed.error || 'Failed to save AI prompt settings.',
        };
    }

    return { success: true, templates: normalizedTemplates };
}
