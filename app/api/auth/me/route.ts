import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true, email: true } // Select only needed fields
    });

    return NextResponse.json({ user });
}
