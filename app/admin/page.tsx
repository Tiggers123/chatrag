"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, RefreshCw, Settings, LogOut, FileText, Trash2, CloudUpload, LayoutDashboard, Users, Bot, Calendar, Zap, ThumbsUp, MoreVertical, Clock, ArrowUpRight, Moon, Sun, Monitor } from "lucide-react";
import Link from "next/link";
import { signoutAction } from "@/features/auths/actions/auths";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminPage() {
    const [documents, setDocuments] = useState<{ id: string, name: string, createdAt: string, status: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<{ name: string, role: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'users'>('dashboard');
    const { theme, setTheme } = useTheme();

    // Check auth and fetch documents
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.user || data.user.role !== 'admin') {
                    window.location.href = '/'; // Redirect if not admin
                } else {
                    setUser(data.user);
                    // Fetch documents only if admin
                    fetch('/api/documents')
                        .then(res => res.json())
                        .then(docs => {
                            if (Array.isArray(docs)) setDocuments(docs);
                        });
                }
            });
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDocuments(documents.filter(doc => doc.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleUpload = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/documents', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const newDoc = await res.json();
                    setDocuments(prev => [newDoc, ...prev]);
                }
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setUploading(false);
            }
        };
        input.click();
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
        <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 text-base font-medium transition-all rounded-xl ${active ? 'bg-purple-50 text-purple-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            onClick={onClick}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
            {label}
        </Button>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex w-72 flex-col bg-card border-r border-border">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-200">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-foreground leading-none">CPE <span className="text-purple-600">CHATBOT</span></h1>
                            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mt-1">COMPUTER ENGINEERING</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4">Management</div>
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <SidebarItem icon={FileText} label="Documents" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                        <SidebarItem icon={Users} label="User Management" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-border space-y-2">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent hover:text-purple-600 rounded-xl h-12">
                            <RefreshCw className="w-5 h-5" /> กลับไปหน้าหลัก
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground hover:bg-accent hover:text-purple-600 rounded-xl h-12">
                                <Settings className="w-5 h-5" /> Settings
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

                    <div className="flex items-center gap-3 mt-4 p-3 bg-accent rounded-2xl border border-border">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-purple-600 text-white font-bold">AD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">Admin CPE</p>
                            <p className="text-[10px] font-semibold text-muted-foreground truncate uppercase tracking-wide">System Administrator</p>
                        </div>
                        <MoreVertical className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                {activeTab === 'dashboard' && (
                    <ScrollArea className="flex-1">
                        <div className="p-8 max-w-7xl mx-auto space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
                                    <p className="text-muted-foreground mt-1">ควบคุมสถานะผู้ใช้งานระบบ</p>
                                </div>
                                <div className="bg-card px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground flex items-center gap-2 shadow-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" /> Today, 25 Nov
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Total Users", value: "2,543", change: "+12%", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                                    { label: "Queries Today", value: "482", change: "+5%", icon: Bot, color: "text-blue-600", bg: "bg-blue-50" },
                                    { label: "Active Now", value: "18", change: null, icon: Zap, color: "text-green-600", bg: "bg-green-50" },
                                    { label: "Satisfaction", value: "98.5%", change: null, icon: ThumbsUp, color: "text-orange-600", bg: "bg-orange-50" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`${stat.bg} p-3 rounded-2xl`}>
                                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            {stat.change && (
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                                    {stat.change}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-foreground mt-1">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Chart Section */}
                                <div className="lg:col-span-2 bg-card p-8 rounded-3xl border border-border shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                            <div className="w-1 h-6 bg-foreground rounded-full"></div>
                                            User Activity (Last 7 Days)
                                        </h3>
                                    </div>
                                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                                        {[40, 65, 45, 85, 70, 30, 100].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                                <div
                                                    className={`w-full rounded-t-2xl transition-all duration-300 ${i === 6 ? 'bg-purple-600 shadow-lg shadow-purple-200' : 'bg-purple-100 group-hover:bg-purple-200'}`}
                                                    style={{ height: `${h}%` }}
                                                ></div>
                                                <span className={`text-xs font-medium ${i === 6 ? 'text-purple-600' : 'text-gray-400'}`}>
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Queries */}
                                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            Live Queries
                                        </h3>
                                    </div>
                                    <div className="space-y-6">
                                        {[
                                            { user: "Student_6601", query: "ลงทะเบียนเรียนล่าช้า...", time: "Just now" },
                                            { user: "Student_6502", query: "ยื่นฝึกงานสหกิจที่ไหน", time: "1m ago" },
                                            { user: "Guest", query: "ค่าเทอมวิศวะคอม", time: "3m ago" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.user === 'Guest' ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
                                                    {item.user.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="text-sm font-bold text-foreground">{item.user}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">"{item.query}"</p>
                                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" /> {item.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium">
                                            View All Activity <ArrowUpRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sessions Table */}
                            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-border flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-foreground">Recent User Sessions</h3>
                                    <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium">View All</Button>
                                </div>
                                <Table>
                                    <TableHeader className="bg-accent/50">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="pl-8 py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider">User</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Last Topic</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Time</TableHead>
                                            <TableHead className="pr-8 font-bold text-muted-foreground uppercase text-xs tracking-wider text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { user: "Student_882", topic: "Scholarship Rules", time: "2 min ago", status: "Online" },
                                            { user: "Student_401", topic: "Exam Schedule", time: "15 min ago", status: "Offline" },
                                            { user: "Guest_User", topic: "Registration", time: "1 hour ago", status: "Offline" },
                                        ].map((session, i) => (
                                            <TableRow key={i} className="hover:bg-accent/50 border-border">
                                                <TableCell className="pl-8 py-5 font-bold text-foreground">{session.user}</TableCell>
                                                <TableCell className="text-muted-foreground">{session.topic}</TableCell>
                                                <TableCell className="text-muted-foreground">{session.time}</TableCell>
                                                <TableCell className="pr-8 text-right">
                                                    <Badge variant="secondary" className={`${session.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} border-0 font-bold`}>
                                                        {session.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </ScrollArea>
                )}

                {activeTab === 'documents' && (
                    <div className="flex flex-col h-full">
                        <header className="bg-card border-b border-border px-8 py-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">อัพโหลดเอกสาร</h2>
                                <p className="text-muted-foreground mt-1">จัดการเอกสาร PDF สำหรับ chatbot</p>
                            </div>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg shadow-purple-200 rounded-xl px-6 h-12 font-medium transition-all hover:scale-105"
                            >
                                <CloudUpload className="w-5 h-5" /> {uploading ? "Uploading..." : "Upload New PDF"}
                            </Button>
                        </header>

                        <ScrollArea className="flex-1 p-8">
                            <div className="max-w-5xl mx-auto space-y-8">
                                <div className="bg-card p-8 rounded-3xl border border-border shadow-sm flex items-center gap-6">
                                    <div className="bg-blue-50 p-4 rounded-2xl">
                                        <FileText className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                                        <h3 className="text-4xl font-bold text-foreground mt-1">{documents.length}</h3>
                                    </div>
                                </div>

                                <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-accent/50">
                                            <TableRow className="hover:bg-transparent border-border">
                                                <TableHead className="w-[400px] py-5 pl-8 font-bold text-muted-foreground uppercase text-xs tracking-wider">File Name</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Upload Date</TableHead>
                                                <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Status</TableHead>
                                                <TableHead className="text-right pr-8 font-bold text-muted-foreground uppercase text-xs tracking-wider">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {documents.map((doc) => (
                                                <TableRow key={doc.id} className="hover:bg-accent/50 border-border">
                                                    <TableCell className="font-bold text-foreground pl-8 flex items-center gap-4 py-5">
                                                        <div className="bg-red-50 p-2.5 rounded-xl">
                                                            <FileText className="w-5 h-5 text-red-500" />
                                                        </div>
                                                        {doc.name}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0 px-3 py-1 font-bold rounded-lg">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                                            {doc.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                                            onClick={() => handleDelete(doc.id)}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {documents.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="bg-gray-100 p-4 rounded-full">
                                                                <CloudUpload className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <p>No documents found. Upload a PDF to get started.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="flex flex-col h-full items-center justify-center text-gray-400">
                        <Users className="w-16 h-16 mb-4 opacity-20" />
                        <p>User Management Module</p>
                        <p className="text-sm mt-2">Coming Soon</p>
                    </div>
                )}
            </main>
        </div>
    );
}
