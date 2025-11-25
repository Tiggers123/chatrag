"use server";

import { InitialFormState } from "@/types/action";
import {
    signup,
    signin,
    signout,
    sendResetPasswordEmail,
    resetPassword,
} from "@/features/auths/db/auths";

export const authAction = async (
    _prevState: InitialFormState,
    formData: FormData,
) => {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // If confirmPassword is present, it's a signup attempt
    // Otherwise, it's a signin attempt (signin form shouldn't have confirmPassword field)
    const result = rawData.confirmPassword
        ? await signup(rawData)
        : await signin({ email: rawData.email, password: rawData.password });

    // Check if result has error or message indicating failure
    // The db functions return { message, error? }
    // If success, they might return { message: "Success" } or similar, but usually we check for error

    if (result?.error || (result?.message && !result.message.includes("สำเร็จ"))) {
        return {
            success: false,
            message: result.message,
            errors: result.error as Record<string, string[]> | undefined,
        };
    }

    return {
        success: true,
        message: rawData.confirmPassword
            ? "สมัครสมาชิกสำเร็จ"
            : "เข้าสู่ระบบสำเร็จ",
    };
};

export const signoutAction = async () => {
    const result = await signout();
    return result && result.message && !result.message.includes("สำเร็จ")
        ? { success: false, message: result.message }
        : { success: true, message: "ออกจากระบบสำเร็จ" };
};

export const forgotPasswordAction = async (
    _prevState: InitialFormState,
    formData: FormData,
) => {
    const email = formData.get("email") as string;

    const result = await sendResetPasswordEmail(email);

    return result && result.message && !result.message.includes("ส่งอีเมล")
        ? { success: false, message: result.message }
        : {
            success: true,
            message: "เราได้ส่งอีเมลเพื่อขอกู้คืนรหัสผ่านเรียบร้อยแล้ว",
        };
};

export const resetPasswordAction = async (
    _prevState: InitialFormState,
    formData: FormData,
) => {
    const data = {
        token: formData.get("token") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = await resetPassword(data);
    return result && result.message && !result.message.includes("สำเร็จ")
        ? {
            success: false,
            message: result.message,
        }
        : {
            success: true,
            message: "กู้คืนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        };
};
