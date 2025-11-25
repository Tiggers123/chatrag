"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { authAction } from "@/features/auths/actions/auths";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 rounded-md transition-colors" disabled={pending}>
            {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </Button>
    );
}

export default function SignupPage() {
    const [state, action] = useActionState(authAction, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/auth/signin");
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sarabun">
            <Card className="w-full max-w-md border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="space-y-1 text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">สมัครสมาชิก</CardTitle>
                    <p className="text-sm text-gray-500">กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</p>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">ชื่อผู้ใช้</label>
                            <Input
                                name="name"
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">อีเมล <span className="text-red-500">*</span></label>
                            <Input
                                name="email"
                                type="email"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">รหัสผ่าน <span className="text-red-500">*</span></label>
                            <Input
                                name="password"
                                type="password"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                            <p className="text-xs text-red-500 mt-1 hidden">รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                        {/* Role selection removed as requested */}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>

                        <div className="text-center text-sm text-gray-600 mt-4">
                            มีบัญชีผู้ใช้แล้ว? <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">เข้าสู่ระบบ</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
