import * as React from 'react';

interface EmailTemplateProps {
    fname: string;
    resetLink: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    fname,
    resetLink,
}) => (
    <div>
        <h1>สวัสดี, {fname}!</h1>
        <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาคลิกที่ลิงก์ด้านล่างเพื่อทำการรีเซ็ตรหัสผ่านของคุณ:</p>
        <a href={resetLink}>รีเซ็ตรหัสผ่าน</a>
        <p>หากคุณไม่ได้เป็นผู้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
    </div>
);

export default EmailTemplate;
