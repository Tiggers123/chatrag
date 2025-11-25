import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function DELETE() {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Delete all chat sessions for this user (messages will be deleted via cascade)
        await prisma.chatSession.deleteMany({
            where: { userId: userId }
        });

        return NextResponse.json({ success: true, message: "All chat history cleared" });
    } catch (error) {
        console.error("Failed to clear chat history", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
