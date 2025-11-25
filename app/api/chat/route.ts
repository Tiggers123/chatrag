import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    console.log("POST /api/chat called");
    try {
        const { message, sessionId } = await req.json();
        console.log("Payload:", { message, sessionId });

        let chatSessionId = sessionId;

        if (!chatSessionId) {
            console.log("No sessionId provided, creating new session...");
            const headersList = await headers();
            const userId = headersList.get('x-user-id');
            console.log("User ID:", userId);

            const session = await prisma.chatSession.create({
                data: {
                    title: message.substring(0, 50) + "...",
                    userId: userId,
                }
            });
            chatSessionId = session.id;
            console.log("New session created:", chatSessionId);
        } else {
            // Check if session exists
            const currentSession = await prisma.chatSession.findUnique({
                where: { id: chatSessionId },
                select: { title: true }
            });

            if (!currentSession) {
                console.log("Session not found, creating new session...");
                const headersList = await headers();
                const userId = headersList.get('x-user-id');

                const session = await prisma.chatSession.create({
                    data: {
                        title: message.substring(0, 50) + "...",
                        userId: userId,
                    }
                });
                chatSessionId = session.id;
            } else if (currentSession.title === "New Chat") {
                await prisma.chatSession.update({
                    where: { id: chatSessionId },
                    data: { title: message.substring(0, 50) + "..." }
                });
            }
        }

        // 2. Save User Message
        await prisma.message.create({
            data: {
                content: message,
                role: 'user',
                chatSessionId: chatSessionId,
            },
        });

        // 3. Mock AI Response (Replace with actual AI call later)
        const aiResponse = "This is a mock response from the backend. Database is connected!";

        // 4. Save Assistant Message
        await prisma.message.create({
            data: {
                content: aiResponse,
                role: 'assistant',
                chatSessionId: chatSessionId,
            },
        });

        return NextResponse.json({
            response: aiResponse,
            sessionId: chatSessionId
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Fetch chat history for a session
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    try {
        const messages = await prisma.message.findMany({
            where: { chatSessionId: sessionId },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
