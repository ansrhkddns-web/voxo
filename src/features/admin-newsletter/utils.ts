import type { NewsletterHistoryEntry } from '@/app/actions/newsletterActions';
import type {
    NewsletterLanguage,
    NewsletterTemplateOption,
} from './types';

export function formatNewsletterDate(value: string, locale: string) {
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

export function previewParagraphs(content: string) {
    return content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
}

export function getNewsletterHistoryTypeLabel(
    item: NewsletterHistoryEntry,
    language: NewsletterLanguage
) {
    if (item.deliveryType === 'test') {
        return language === 'ko' ? '테스트' : 'Test';
    }

    return language === 'ko' ? '전체 발송' : 'Broadcast';
}

export function getNewsletterTemplateOptions(
    language: NewsletterLanguage
): NewsletterTemplateOption[] {
    if (language === 'ko') {
        return [
            {
                id: 'weekly-roundup',
                label: '주간 큐레이션',
                subject: '이번 주 VOXO 큐레이션 업데이트',
                content:
                    '이번 주에 발행한 리뷰와 큐레이션을 한 번에 모아 전해드립니다.\n\n이번 주의 핵심 아티스트와 꼭 읽어볼 글 3편을 골라 소개합니다.\n\n사이트에서 최신 콘텐츠와 플레이리스트도 함께 확인해 보세요.',
            },
            {
                id: 'breaking',
                label: '긴급 업데이트',
                subject: '새 콘텐츠가 방금 공개되었습니다',
                content:
                    '방금 새로운 콘텐츠가 공개되었습니다.\n\n이번 글에서는 지금 주목받는 아티스트와 곡의 흐름을 빠르게 정리했습니다.\n\n지금 바로 확인하고 공유해 보세요.',
            },
            {
                id: 'event',
                label: '이벤트 안내',
                subject: 'VOXO 특별 이벤트 안내',
                content:
                    '이번 주 VOXO에서 특별 이벤트를 진행합니다.\n\n참여 방법과 혜택은 아래 안내에서 확인해 주세요.\n\n많은 참여 부탁드립니다.',
            },
        ];
    }

    return [
        {
            id: 'weekly-roundup',
            label: 'Weekly Roundup',
            subject: 'This week on VOXO',
            content:
                'Here is your weekly roundup from VOXO.\n\nWe selected the most important reviews and curated picks published this week.\n\nVisit the site to catch the latest stories and playlist updates.',
        },
        {
            id: 'breaking',
            label: 'Breaking Update',
            subject: 'A new story just went live',
            content:
                'A new story has just been published on VOXO.\n\nThis issue highlights the artist, track, and context you should not miss right now.\n\nOpen the site and read the full piece.',
        },
        {
            id: 'event',
            label: 'Event Notice',
            subject: 'A special VOXO event is now open',
            content:
                'We have launched a special event for our readers.\n\nCheck the details below to see how to participate and what you can receive.\n\nWe would love to have you join.',
        },
    ];
}
