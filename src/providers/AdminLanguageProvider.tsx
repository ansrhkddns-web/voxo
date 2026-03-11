'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'ko';

type TranslationNamespaces =
    | 'sidebar'
    | 'common'
    | 'editor'
    | 'dashboard'
    | 'categories'
    | 'posts'
    | 'subscribers'
    | 'newsletter';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, namespace?: TranslationNamespaces) => string;
}

const defaultContext: LanguageContextType = {
    language: 'en',
    setLanguage: () => {},
    t: (key: string) => key,
};

const GLOBAL_TRANSLATIONS: Record<Language, Record<TranslationNamespaces, Record<string, string>>> = {
    en: {
        sidebar: {
            newPost: 'NEW POST',
            aiDesk: 'AI AUTO DESK',
            dashboard: 'DASHBOARD',
            categories: 'CATEGORIES',
            allPosts: 'ALL POSTS',
            tags: 'TAGS',
            subscribers: 'SUBSCRIBERS',
            newsletter: 'NEWSLETTER',
            settings: 'SETTINGS',
            logout: 'LOGOUT',
            navigation: 'NAVIGATION',
        },
        common: {
            loading: 'Loading...',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search...',
        },
        editor: {
            title: 'Article Deployment',
            saveDraft: 'Save Draft',
            transmit: 'Publishing...',
            publish: 'Publish Article',
            injectVisual: 'Upload Cover Image',
            replaceImage: 'Replace Image',
            headlinePlaceholder: 'THE HEADLINE OF TOMORROW...',
            reviewRating: 'Review Rating (0.0 - 10.0)',
            artistName: 'Artist Name',
            artistPlaceholder: 'Lana Del Rey',
            metaClass: 'Category',
            selectArchive: 'SELECT CATEGORY',
            tags: 'Tags',
            tagsPlaceholder: 'TAG_ONE, TAG_TWO',
            audioInt: 'Spotify Integration',
            audioPlaceholder: 'URI OR URL',
            audioSupport: 'Track, album, and artist links are all supported.',
            decrypting: 'Loading article data...',
        },
        dashboard: {
            status: 'System Status: Online',
            title: 'Content Control',
            search: 'SEARCH ARTICLES...',
            statArchives: 'Total Archives',
            statPublished: 'Published Units',
            statCategories: 'Category Layers',
            statReadTime: 'Avg Read Time',
            statDrafts: 'Draft Units',
            statViews: 'Total Exposure',
            trendNewThisWeek: 'new this week',
            trendPublishedRatio: 'published ratio',
            trendDraftCount: 'drafts pending',
            trendTotalViews: 'accumulated views',
            dirTitle: 'Article Directory',
            syncing: 'Syncing Database...',
            colTitle: 'Archived Title',
            colClass: 'Classification',
            colViews: 'Views',
            colStatus: 'Integrity Status',
            colOps: 'Operations',
            emptyState: 'No Data Sequences Found',
            emptySearch: 'No matching articles found',
            statusVerified: 'Verified / Published',
            statusPending: 'Pending / Draft',
            generic: 'GENERIC',
            activityTitle: 'Recent Activity',
            activityLoading: 'Loading dashboard activity...',
            activitySystemReady: 'Dashboard connection established successfully.',
            activityPublished: 'published',
            activityDraft: 'saved as draft',
            activityCreated: 'created',
            activityFallback: 'No recent activity yet. Create your first post to start the feed.',
            activityPrompt: 'Awaiting next update...',
            resultsLabel: 'results',
        },
        categories: {
            infra: 'Meta Infrastructure',
            title: 'Category Archives',
            unitLabel: 'CATEGORY NAME',
            init: 'INITIALIZE',
            executing: 'EXECUTING...',
            syncing: 'Syncing Database...',
            applying: 'Applying Changes...',
            refid: 'REF_ID:',
        },
        posts: {
            repo: 'Database Repository',
            title: 'All Archives',
            all: 'All',
            published: 'Published',
            drafts: 'Drafts',
            search: 'SEARCH REPOSITORY...',
            querying: 'Querying Database...',
            colIdentify: 'Archive Identify',
            colCat: 'Category',
            colCreated: 'Created At',
            colStatus: 'Status Flag',
            colOps: 'Operations',
            emptyState: 'No Matching Sequences',
            generic: 'GENERIC',
        },
        subscribers: {
            infra: 'Communication Infrastructure',
            title: 'Subscriber Directory',
            units: 'Units Active',
            syncing: 'Syncing Directory...',
            colIdentity: 'Identity (Email)',
            colStatus: 'Status',
            colReg: 'Registered',
            colActions: 'Actions',
            active: 'Active',
        },
        newsletter: {
            infra: 'Communication Infrastructure',
            title: 'Broadcast Center',
            transmitting: 'TRANSMITTING...',
            execBroadcast: 'SEND NEWSLETTER',
            composeBtn: 'Compose Sequence',
            subjectLine: 'Subject Line',
            subjectPlaceholder: 'INPUT_TRANSMISSION_SUBJECT',
            content: 'Transmission Content',
            contentPlaceholder: 'START_BROADCAST_BODY_DATA...',
            safetyTitle: 'Safety Protocol',
            safetyText: 'When you start the broadcast, the content will be sent to every active subscriber. Please review the copy before sending.',
            errMissing: 'Required metadata missing',
            successInitiated: 'Broadcast sequence completed successfully',
            errInterrupt: 'Connection interrupt during transmission',
        },
    },
    ko: {
        sidebar: {
            newPost: '새 글 작성',
            aiDesk: 'AI 자동 작성',
            dashboard: '대시보드',
            categories: '카테고리',
            allPosts: '전체 글',
            tags: '태그',
            subscribers: '구독자',
            newsletter: '뉴스레터',
            settings: '설정',
            logout: '로그아웃',
            navigation: '메뉴',
        },
        common: {
            loading: '불러오는 중...',
            save: '저장',
            cancel: '취소',
            delete: '삭제',
            edit: '수정',
            search: '검색...',
        },
        editor: {
            title: '글 편집',
            saveDraft: '임시 저장',
            transmit: '발행 중...',
            publish: '발행하기',
            injectVisual: '커버 이미지 업로드',
            replaceImage: '이미지 변경',
            headlinePlaceholder: '기사 제목을 입력해 주세요...',
            reviewRating: '평점 (0.0 - 10.0)',
            artistName: '아티스트 이름',
            artistPlaceholder: '아티스트 이름을 입력해 주세요.',
            metaClass: '카테고리',
            selectArchive: '카테고리 선택',
            tags: '태그',
            tagsPlaceholder: '예: synth-pop, live',
            audioInt: 'Spotify 연동',
            audioPlaceholder: 'Spotify URI 또는 URL',
            audioSupport: '트랙, 앨범, 아티스트 링크를 모두 지원합니다.',
            decrypting: '글 데이터를 불러오는 중...',
        },
        dashboard: {
            status: '시스템 상태: 정상',
            title: '콘텐츠 관리',
            search: '게시글 검색...',
            statArchives: '전체 게시글',
            statPublished: '발행 완료',
            statCategories: '카테고리 수',
            statReadTime: '평균 읽기 시간',
            statDrafts: '임시 저장',
            statViews: '총 조회수',
            trendNewThisWeek: '이번 주 신규',
            trendPublishedRatio: '발행 비율',
            trendDraftCount: '임시 저장 수',
            trendTotalViews: '누적 조회',
            dirTitle: '게시글 목록',
            syncing: '데이터를 불러오는 중...',
            colTitle: '제목',
            colClass: '카테고리',
            colViews: '조회수',
            colStatus: '상태',
            colOps: '작업',
            emptyState: '등록된 게시글이 없습니다.',
            emptySearch: '검색 조건에 맞는 게시글이 없습니다.',
            statusVerified: '발행 완료',
            statusPending: '임시 저장',
            generic: '기본',
            activityTitle: '최근 활동',
            activityLoading: '대시보드 활동 내역을 불러오는 중...',
            activitySystemReady: '대시보드 연결이 정상적으로 완료되었습니다.',
            activityPublished: '발행됨',
            activityDraft: '임시 저장됨',
            activityCreated: '생성됨',
            activityFallback: '아직 최근 활동이 없습니다. 첫 게시글을 만들어 보세요.',
            activityPrompt: '다음 업데이트 대기 중...',
            resultsLabel: '건',
        },
        categories: {
            infra: '분류 관리',
            title: '카테고리 관리',
            unitLabel: '카테고리 이름',
            init: '추가',
            executing: '처리 중...',
            syncing: '카테고리를 불러오는 중...',
            applying: '변경 사항 적용 중...',
            refid: '참조 ID:',
        },
        posts: {
            repo: '콘텐츠 저장소',
            title: '전체 게시글',
            all: '전체',
            published: '발행',
            drafts: '임시 저장',
            search: '게시글 검색...',
            querying: '게시글을 불러오는 중...',
            colIdentify: '게시글',
            colCat: '카테고리',
            colCreated: '생성일',
            colStatus: '상태',
            colOps: '작업',
            emptyState: '조건에 맞는 게시글이 없습니다.',
            generic: '기본',
        },
        subscribers: {
            infra: '구독 관리',
            title: '구독자 목록',
            units: '명',
            syncing: '구독자 목록을 불러오는 중...',
            colIdentity: '이메일',
            colStatus: '상태',
            colReg: '등록일',
            colActions: '작업',
            active: '활성',
        },
        newsletter: {
            infra: '메일 발송',
            title: '뉴스레터 발송',
            transmitting: '발송 중...',
            execBroadcast: '뉴스레터 보내기',
            composeBtn: '내용 작성',
            subjectLine: '제목',
            subjectPlaceholder: '메일 제목을 입력해 주세요.',
            content: '본문',
            contentPlaceholder: '발송할 내용을 입력해 주세요...',
            safetyTitle: '안내',
            safetyText: '발송을 시작하면 활성 구독자 전체에게 메일이 전송됩니다. 보내기 전에 제목과 본문을 다시 확인해 주세요.',
            errMissing: '제목과 본문을 모두 입력해 주세요.',
            successInitiated: '뉴스레터 발송이 완료되었습니다.',
            errInterrupt: '발송 중 오류가 발생했습니다.',
        },
    },
};

export const AdminLanguageContext = createContext<LanguageContextType>(defaultContext);

export const useAdminLanguage = () => useContext(AdminLanguageContext);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const savedSettingsStr = localStorage.getItem('voxoAdminSettings');
            if (savedSettingsStr) {
                const savedSettings = JSON.parse(savedSettingsStr) as { language?: Language };
                setLanguageState(savedSettings.language === 'ko' ? 'ko' : 'en');
            }
        } catch (error) {
            console.error('Failed to parse language settings', error);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);

        try {
            const savedSettingsStr = localStorage.getItem('voxoAdminSettings');
            const settings = savedSettingsStr ? (JSON.parse(savedSettingsStr) as Record<string, unknown>) : {};
            settings.language = lang;
            localStorage.setItem('voxoAdminSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to persist language settings', error);
        }
    };

    const resolvedLanguage = isHydrated ? language : 'en';

    const t = (key: string, namespace: TranslationNamespaces = 'common'): string => {
        const currentDict = GLOBAL_TRANSLATIONS[resolvedLanguage]?.[namespace];
        const fallbackDict = GLOBAL_TRANSLATIONS.en[namespace];

        return currentDict?.[key] || fallbackDict?.[key] || key;
    };

    return (
        <AdminLanguageContext.Provider value={{ language: resolvedLanguage, setLanguage, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
}
