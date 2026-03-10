import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import {
    getAdminSessionTokenForCurrentConfig,
    verifyAdminCredentials,
} from '@/lib/admin-auth-server';

export async function POST(request: Request) {
    const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = body?.email?.trim() || '';
    const password = body?.password || '';

    if (!email || !password) {
        return NextResponse.json(
            { success: false, message: '아이디와 비밀번호를 모두 입력해 주세요.' },
            { status: 400 }
        );
    }

    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
        return NextResponse.json(
            { success: false, message: '관리자 계정 정보가 일치하지 않습니다.' },
            { status: 401 }
        );
    }

    const token = await getAdminSessionTokenForCurrentConfig();
    const response = NextResponse.json({
        success: true,
        message: '관리자 계정으로 로그인했습니다.',
    });

    response.cookies.set({
        name: ADMIN_SESSION_COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}
