"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { forgotPasswordAction } from "@/features/auths/actions/auths";
import { toast } from "sonner";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 rounded-md transition-colors" disabled={pending}>
            {pending ? "กำลังส่งอีเมล..." : "ส่งลิงก์กู้คืนรหัสผ่าน"}
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, action] = useActionState(forgotPasswordAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sarabun">
            <Card className="w-full max-w-md border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="space-y-1 text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">ลืมรหัสผ่าน</CardTitle>
                    <p className="text-sm text-gray-500">กรุณากรอกอีเมลเพื่อรับลิงก์กู้คืนรหัสผ่าน</p>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">อีเมล <span className="text-red-500">*</span></label>
                            <Input
                                name="email"
                                type="email"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>

                        <div className="pt-2">
                            <SubmitButton />
                        </div>

                        <div className="text-center text-sm text-gray-600 mt-4">
                            <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
