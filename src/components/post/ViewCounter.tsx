'use client';

import { useEffect, useRef } from 'react';
import { incrementViewCount } from '@/app/actions/postActions';

export default function ViewCounter({ postId }: { postId: string }) {
    const hasViewed = useRef(false);

    useEffect(() => {
        if (!hasViewed.current) {
            hasViewed.current = true;
            incrementViewCount(postId).catch(console.error);
        }
    }, [postId]);

    return null;
}
