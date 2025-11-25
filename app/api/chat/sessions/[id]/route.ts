import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: sessionId } = await params;
        console.log("DELETE session called for:", sessionId, "by user:", userId);

        // Verify the session belongs to the user before deleting
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true }
        });

        if (!session || session.userId !== userId) {
            console.log("Session not found or unauthorized");
            return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 404 });
        }

        // Delete the session (messages will be deleted via cascade)
        await prisma.chatSession.delete({
            where: { id: sessionId }
        });

        console.log("Session deleted successfully");
        return NextResponse.json({ success: true, message: "Session deleted" });
    } catch (error) {
        console.error("Failed to delete session", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
