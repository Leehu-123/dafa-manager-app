import React from "react";
import { Card } from "@/components/ui/Card";
import { User, Mail, Phone, Briefcase, Building } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileTelegramSettings } from "@/components/profile/ProfileTelegramSettings";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: true,
      departmentMember: { include: { department: true } }
    }
  });

  if (!user) return <div className="p-8 text-center">Không tìm thấy thông tin người dùng</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold dafa-text">Hồ sơ cá nhân</h1>
        <p className="text-sm dafa-muted mt-1">Thông tin chi tiết tài khoản của bạn</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold dafa-text border-b dafa-border pb-2">Thông tin cơ bản</h2>
          
          <div className="flex items-center gap-4 py-2">
            <div className="w-10 h-10 rounded-full bg-dafa-primary text-white flex items-center justify-center font-bold text-lg">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="text-sm text-dafa-muted">Họ và tên</div>
              <div className="font-medium dafa-text">{user.fullName}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-dafa-muted">Email đăng nhập</div>
              <div className="font-medium dafa-text">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-dafa-muted">Số điện thoại</div>
              <div className="font-medium dafa-text">{user.phone || "Chưa cập nhật"}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold dafa-text border-b dafa-border pb-2">Thông tin công việc</h2>
          
          <div className="flex items-center gap-4 py-2">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-dafa-muted">Chức danh</div>
              <div className="font-medium dafa-text">{user.jobTitle || "Chưa cập nhật"}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-dafa-muted">Công ty</div>
              <div className="font-medium dafa-text">{user.company?.name || "DAFA Glass"}</div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <ProfileTelegramSettings initialChatId={user.telegramChatId || ""} />
      </div>
    </div>
  );
}
