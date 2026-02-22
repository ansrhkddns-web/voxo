'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, namespace?: string) => string;
}

const defaultContext: LanguageContextType = {
    language: 'en',
    setLanguage: () => { },
    t: (key: string) => key,
};

export const AdminLanguageContext = createContext<LanguageContextType>(defaultContext);

export const useAdminLanguage = () => useContext(AdminLanguageContext);

// Simplified translation dictionary for global components
export const GLOBAL_TRANSLATIONS: Record<Language, Record<string, Record<string, string>>> = {
    en: {
        sidebar: {
            newPost: 'NEW POST',
            dashboard: 'DASHBOARD',
            categories: 'CATEGORIES',
            allPosts: 'ALL POSTS',
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
            transmit: 'Transmitting...',
            publish: 'Execute Publish',
            injectVisual: 'Inject Visual Component',
            replaceImage: 'Replace Image',
            headlinePlaceholder: 'THE HEADLINE OF TOMORROW...',
            reviewRating: 'Review Rating (0.0 - 10.0)',
            artistName: 'Artist / Track Name',
            artistPlaceholder: 'IDENTITY_STRING',
            metaClass: 'Meta Classification',
            selectArchive: 'SELECT ARCHIVE',
            tags: 'Tags (Comma Separated)',
            tagsPlaceholder: 'TAG_SEQUENCE_1, TAG_SEQUENCE_2',
            audioInt: 'Audio Integration (Spotify)',
            audioPlaceholder: 'URI_SEQUENCE',
            audioSupport: 'System supports Track / Album / Artist schemas.',
            decrypting: 'Decryption in progress...'
        },
        dashboard: {
            status: 'System Status: Online',
            title: 'Content Control',
            search: 'SEARCH ARTICLES...',
            statArchives: 'Total Archives',
            statPublished: 'Published Units',
            statCategories: 'Category Layers',
            statReadTime: 'Avg Read Time',
            dirTitle: 'Article Directory',
            syncing: 'Syncing Database...',
            colTitle: 'Archived Title',
            colClass: 'Classification',
            colStatus: 'Integrity Status',
            colOps: 'Operations',
            emptyState: 'No Data Sequences Found',
            statusVerified: 'Verified / Published',
            statusPending: 'Pending / Draft',
            generic: 'GENERIC'
        },
        categories: {
            infra: 'Meta Infrastructure',
            title: 'Category Archives',
            unitLabel: 'UNIT LABEL',
            init: 'INITIALIZE',
            executing: 'EXECUTING...',
            syncing: 'Syncing Database...',
            applying: 'Applying Changes...',
            refid: 'REF_ID:'
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
            generic: 'GENERIC'
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
            active: 'Active'
        },
        newsletter: {
            infra: 'Communication Infrastructure',
            title: 'Broadcast Center',
            transmitting: 'TRANSMITTING...',
            execBroadcast: 'EXECUTIVE BROADCAST',
            composeBtn: 'Compose Sequence',
            subjectLine: 'Subject Line',
            subjectPlaceholder: 'INPUT_TRANSMISSION_SUBJECT',
            content: 'Transmission Content',
            contentPlaceholder: 'START_BROADCAST_BODY_DATA...',
            safetyTitle: 'Safety Protocol',
            safetyText: 'By initiating the broadcast sequence, you agree to transmit this data to all registered units within the network. Data deconstruction after transmission is currently technically restricted.',
            errMissing: 'Required metadata missing',
            successInitiated: 'Broadcast sequence successfully initiated',
            errInterrupt: 'Connection interrupt during transmission'
        }
    },
    ko: {
        sidebar: {
            newPost: '새 포스트 작성',
            dashboard: '대시보드',
            categories: '카테고리 관리',
            allPosts: '모든 포스트',
            subscribers: '구독자 관리',
            newsletter: '뉴스레터 발송',
            settings: '시스템 설정',
            logout: '로그아웃',
            navigation: '내비게이션 메뉴',
        },
        common: {
            loading: '로딩 중...',
            save: '저장',
            cancel: '취소',
            delete: '삭제',
            edit: '수정',
            search: '검색...',
        },
        editor: {
            title: '아티클 배포',
            saveDraft: '임시 저장',
            transmit: '전송 중...',
            publish: '아티클 발행',
            injectVisual: '시각적 컴포넌트 추가',
            replaceImage: '이미지 변경',
            headlinePlaceholder: '내일을 밝힐 헤드라인...',
            reviewRating: '리뷰 평점 (0.0 - 10.0)',
            artistName: '아티스트 / 트랙 이름',
            artistPlaceholder: '식별_문자열 (IDENTITY_STRING)',
            metaClass: '메타 분류 (카테고리)',
            selectArchive: '아카이브 선택',
            tags: '태그 (쉼표로 구분)',
            tagsPlaceholder: '태그_시퀀스_1, 태그_시퀀스_2',
            audioInt: '오디오 연동 (스포티파이)',
            audioPlaceholder: 'URI_시퀀스 (URL)',
            audioSupport: '시스템은 트랙, 앨범, 아티스트 스키마를 모두 지원합니다.',
            decrypting: '복호화 진행 중 (로딩)...'
        },
        dashboard: {
            status: '시스템 상태: 온라인',
            title: '콘텐츠 제어 센터',
            search: '아티클 검색...',
            statArchives: '전체 아카이브',
            statPublished: '발행된 유닛',
            statCategories: '카테고리 계층',
            statReadTime: '평균 예상 읽기 시간',
            dirTitle: '아티클 디렉토리',
            syncing: '데이터베이스 동기화 중...',
            colTitle: '보관된 타이틀',
            colClass: '분류 (카테고리)',
            colStatus: '무결성 상태',
            colOps: '관리 작업',
            emptyState: '데이터 시퀀스를 찾을 수 없습니다.',
            statusVerified: '검증 완료 / 발행됨',
            statusPending: '대기 중 / 임시 보관',
            generic: '제네릭 (기본)'
        },
        categories: {
            infra: '메타 인프라스트럭처',
            title: '카테고리 아카이브',
            unitLabel: '카테고리명 입력',
            init: '초기화 (생성)',
            executing: '실행 중...',
            syncing: '데이터베이스 동기화 중...',
            applying: '변경 사항 적용 중...',
            refid: '참조_ID:'
        },
        posts: {
            repo: '데이터베이스 저장소',
            title: '모든 아카이브 목록',
            all: '전체',
            published: '발행됨',
            drafts: '임시 보관',
            search: '저장소 검색...',
            querying: '데이터베이스 조회 중...',
            colIdentify: '아카이브 식별자',
            colCat: '카테고리',
            colCreated: '생성일',
            colStatus: '상태 플래그',
            colOps: '관리 작업',
            emptyState: '일치하는 시퀀스가 없습니다.',
            generic: '제네릭 (기본)'
        },
        subscribers: {
            infra: '커뮤니케이션 인프라스트럭처',
            title: '구독자 디렉토리',
            units: '활성 유닛',
            syncing: '디렉토리 동기화 중...',
            colIdentity: '식별자 (이메일)',
            colStatus: '상태',
            colReg: '등록일',
            colActions: '작업',
            active: '활성'
        },
        newsletter: {
            infra: '커뮤니케이션 인프라스트럭처',
            title: '브로드캐스트 센터',
            transmitting: '전송 중...',
            execBroadcast: '브로드캐스트 실행',
            composeBtn: '새 시퀀스 작성',
            subjectLine: '제목 라인',
            subjectPlaceholder: '전송_제목_입력',
            content: '전송 콘텐츠',
            contentPlaceholder: '브로드캐스트_본문_데이터_입력...',
            safetyTitle: '안전 프로토콜',
            safetyText: '브로드캐스트 시퀀스를 시작하면 이 데이터를 네트워크 내의 모든 등록된 유닛에 전송하는 데 동의하게 됩니다. 전송 후 데이터 해체(발송 취소)는 현재 기술적으로 제한되어 있습니다.',
            errMissing: '필수 메타데이터가 누락되었습니다',
            successInitiated: '브로드캐스트 시퀀스가 성공적으로 시작되었습니다',
            errInterrupt: '전송 중 연결이 끊겼습니다'
        }
    }
};

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Attempt to load settings from local storage
        const savedSettingsStr = localStorage.getItem('voxoAdminSettings');
        if (savedSettingsStr) {
            try {
                const savedSettings = JSON.parse(savedSettingsStr);
                if (savedSettings.language === 'en' || savedSettings.language === 'ko') {
                    // eslint-disable-next-line
                    setLanguageState(savedSettings.language);
                }
            } catch (e) {
                console.error("Failed to parse language settings", e);
            }
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // Also update the local storage settings object so Settings page stays in sync
        try {
            const savedSettingsStr = localStorage.getItem('voxoAdminSettings');
            const settings = savedSettingsStr ? JSON.parse(savedSettingsStr) : {};
            settings.language = lang;
            localStorage.setItem('voxoAdminSettings', JSON.stringify(settings));
        } catch { }
    };

    const t = (key: string, namespace: string = 'common'): string => {
        const defaultDict = GLOBAL_TRANSLATIONS['en'];
        const currentDict = GLOBAL_TRANSLATIONS[language];

        // Safely retrieve the nested translation
        if (currentDict && currentDict[namespace] && currentDict[namespace][key]) {
            return currentDict[namespace][key];
        }

        // Fallback to English
        if (defaultDict && defaultDict[namespace] && defaultDict[namespace][key]) {
            return defaultDict[namespace][key];
        }

        return key;
    };

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </AdminLanguageContext.Provider>
    );
}
