import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sessions = await prisma.chatSession.findMany({
            where: { userId: userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    console.log("POST /api/chat/sessions called");
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    console.log("User ID from header:", userId);

    if (!userId) {
        console.log("Unauthorized: No User ID");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const session = await prisma.chatSession.create({
            data: {
                title: "New Chat",
                userId: userId,
            }
        });
        console.log("Session created:", session);
        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to create session", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
