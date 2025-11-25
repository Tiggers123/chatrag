"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { resetPasswordAction } from "@/features/auths/actions/auths";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 rounded-md transition-colors" disabled={pending}>
            {pending ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน"}
        </Button>
    );
}

export default function ResetPasswordPage() {
    const [state, action] = useActionState(resetPasswordAction, null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push("/auth/signin");
        } else if (state?.message) {
            toast.error(state.message);
        }
    }, [state, router]);

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sarabun">
                <Card className="w-full max-w-md p-6 text-center">
                    <p className="text-red-500">Invalid Token</p>
                    <Link href="/auth/signin" className="text-purple-600 hover:underline mt-4 block">Back to Signin</Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sarabun">
            <Card className="w-full max-w-md border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardHeader className="space-y-1 text-center pb-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่</CardTitle>
                    <p className="text-sm text-gray-500">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <input type="hidden" name="token" value={token} />
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">รหัสผ่านใหม่ <span className="text-red-500">*</span></label>
                            <Input
                                name="password"
                                type="password"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span></label>
                            <Input
                                name="confirmPassword"
                                type="password"
                                required
                                className="h-10 rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
