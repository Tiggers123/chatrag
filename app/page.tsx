"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Plus, Send, Paperclip, Settings, RefreshCw, LogOut, BookOpen, Plane, Shirt, GraduationCap, Bot, Search, MessageSquare, Library, MoreVertical, Trash2, Moon, Sun, Monitor } from "lucide-react";
import Link from "next/link";
import { signoutAction } from "@/features/auths/actions/auths";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: "assistant", content: "สวัสดีครับ! CPE AI พร้อมตอบคำถาม\n\nผมได้อ่าน คู่มือนักศึกษา เรียบร้อยแล้ว\nคุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา, หรือการลงทะเบียนได้เลยครับ" }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ name: string, role: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { theme, setTheme } = useTheme();

  const [history, setHistory] = useState<{ id: string, title: string }[]>([]);
  const filteredHistory = history.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const fetchHistory = () => {
    fetch('/api/chat/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          fetchHistory();
        }
        else window.location.href = '/auth/signin'; // Redirect if not logged in
      });
  }, []);

  const handleLogout = async () => {
    await signoutAction();
    window.location.href = '/auth/signin';
  };

  const startNewChat = async () => {
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessionId(newSession.id);
        setMessages([{ role: "assistant", content: "สวัสดีครับ! CPE AI พร้อมตอบคำถาม\n\nผมได้อ่าน คู่มือนักศึกษา เรียบร้อยแล้ว\nคุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา, หรือการลงทะเบียนได้เลยครับ" }]);
        fetchHistory(); // Refresh list to show "New Chat"
      }
    } catch (error) {
      console.error("Failed to create new chat", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/chat/sessions/clear', {
        method: 'DELETE',
      });

      if (res.ok) {
        setHistory([]);
        setSessionId(null);
        setMessages([{ role: "assistant", content: "สวัสดีครับ! CPE AI พร้อมตอบคำถาม\n\nผมได้อ่าน คู่มือนักศึกษา เรียบร้อยแล้ว\nคุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา, หรือการลงทะเบียนได้เลยครับ" }]);
        setShowClearDialog(false);
      } else {
        alert("เกิดข้อผิดพลาดในการลบประวัติ");
      }
    } catch (error) {
      console.error("Failed to clear history", error);
      alert("เกิดข้อผิดพลาดในการลบประวัติ");
    }
  };

  const handleDeleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const res = await fetch(`/api/chat/sessions/${sessionIdToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== sessionIdToDelete));
        if (sessionId === sessionIdToDelete) {
          setSessionId(null);
          setMessages([{ role: "assistant", content: "สวัสดีครับ! CPE AI พร้อมตอบคำถาม\n\nผมได้อ่าน คู่มือนักศึกษา เรียบร้อยแล้ว\nคุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา, หรือการลงทะเบียนได้เลยครับ" }]);
        }
      }
    } catch (error) {
      console.error("Failed to delete session", error);
    }
  };

  const loadSession = async (id: string) => {
    setSessionId(id);
    try {
      const res = await fetch(`/api/chat?sessionId=${id}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error("Failed to load session", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        // Refresh history to show new chat
        fetchHistory();
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, sessionId }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        fetchHistory();
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-2 rounded-xl shadow-lg dark:shadow-purple-900/50">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground leading-none">CPE <span className="text-purple-600">CHATBOT</span></h1>
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-1">COMPUTER ENGINEERING</p>
          </div>
        </div>

        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-center gap-2 h-12 text-base font-medium shadow-md dark:shadow-purple-900/50 rounded-xl transition-all hover:scale-[1.02]"
          onClick={startNewChat}
        >
          <Plus className="w-5 h-5" /> บทสนทนาใหม่
        </Button>
      </div>

      {/* History Section */}
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">History</div>
        <button onClick={() => setShowClearDialog(true)} className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">Clear</button>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search history..."
            className="pl-10 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 mt-2">
        <div className="space-y-1 pb-4">
          {filteredHistory.map((chat, i) => (
            <div key={chat.id} className="relative group/item">
              <Button
                variant="ghost"
                onClick={() => loadSession(chat.id)}
                className={`w-full justify-start text-left font-normal h-auto py-3 px-4 pr-10 rounded-xl mb-1 transition-all group ${sessionId === chat.id ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 border border-purple-100 dark:border-purple-900' : 'text-muted-foreground hover:bg-accent'}`}
              >
                <MessageSquare className={`w-4 h-4 mr-3 flex-shrink-0 ${sessionId === chat.id ? 'text-purple-600' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="truncate text-sm">{chat.title}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-gray-200 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={(e) => handleDeleteSession(chat.id, e)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No history found
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-1">
        {user?.role === 'admin' && (
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent hover:text-purple-600 rounded-xl h-10">
              <RefreshCw className="w-4 h-4" /> ไปยังหน้าแอดมิน
            </Button>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent hover:text-purple-600 rounded-xl h-10">
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
              <Monitor className="w-4 h-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-3 mt-3 p-3 bg-accent rounded-xl border border-border">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold">{user?.name?.substring(0, 2).toUpperCase() || 'SU'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Student User'}</p>
            <p className="text-xs text-muted-foreground truncate">CPE STUDENT</p>
          </div>
          <LogOut onClick={handleLogout} className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-red-500 transition-colors" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-80 flex-col h-full">
        <SidebarContent />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative bg-background">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg text-foreground">CPE <span className="text-purple-600">CHATBOT</span></h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl inline-flex">
                    <Bot className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground">สวัสดีครับ! CPE AI พร้อมตอบคำถาม</h2>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  ผมได้อ่าน <span className="text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md">คู่มือนักศึกษา </span> เรียบร้อยแล้ว
                  คุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา , หรือการลงทะเบียนได้เลยครับ
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl shadow-sm ${msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                      }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Welcome Screen / Empty State Suggestions */}
            {messages.length === 1 && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-12">
                  <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl inline-flex">
                      <Bot className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">สวัสดีครับ! CPE AI พร้อมตอบคำถาม</h2>
                  <p className="text-muted-foreground max-w-lg">
                    ผมได้อ่าน <span className="text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md">คู่มือนักศึกษา </span> เรียบร้อยแล้ว
                    คุณสามารถถามเกี่ยวกับ กฎระเบียบ, คำอธิบายวิชา, หรือการลงทะเบียนได้เลยครับ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-5 bg-card border-border hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-foreground hover:text-purple-700 rounded-xl gap-2 shadow-sm transition-all"
                    onClick={() => handleQuickQuestion("รหัสวิชา 261499 คืออะไร?")}
                  >
                    <BookOpen className="w-4 h-4 text-green-600" /> รหัสวิชา 261499 คืออะไร?
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-5 bg-card border-border hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-foreground hover:text-purple-700 rounded-xl gap-2 shadow-sm transition-all"
                    onClick={() => handleQuickQuestion("คำอธิบายวิชา Fundamental English 1")}
                  >
                    <GraduationCap className="w-4 h-4 text-red-500" /> คำอธิบายวิชา Fundamental English 1
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-5 bg-card border-border hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-foreground hover:text-purple-700 rounded-xl gap-2 shadow-sm transition-all sm:col-span-2 sm:max-w-md sm:mx-auto"
                    onClick={() => handleQuickQuestion("แผนการเรียน CPE 2563")}
                  >
                    <Library className="w-4 h-4 text-blue-500" /> แผนการเรียน CPE 2563
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder="พิมพ์ข้อความ..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="pr-10 h-12 rounded-xl bg-background border-border focus-visible:ring-purple-500 text-base placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-lg">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>
              <Button
                onClick={handleSend}
                size="icon"
                className={`rounded-xl w-10 h-10 transition-all ${input.trim() ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">AI can make mistakes. Please check important info.</p>
          </div>
        </div>
      </main>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-card border-border max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground">ลบประวัติการสนทนา</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-base pt-2">
              คุณต้องการลบประวัติการสนทนาทั้งหมดใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="bg-background hover:bg-accent text-foreground border-border">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              ลบทั้งหมด
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
