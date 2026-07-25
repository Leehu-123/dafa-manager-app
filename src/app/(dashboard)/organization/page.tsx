import { OrgTreeView } from "@/components/organization/OrgTreeView";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import { OrganizationTabs } from "@/components/organization/OrganizationTabs";

export const metadata = {
  title: "Nhân sự & Tổ chức | DAFA Glass",
  description: "Quản lý cơ cấu tổ chức và nhân sự",
};

export default async function OrganizationPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Nhân sự & Tổ chức</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Quản lý cơ cấu tổ chức, chi nhánh, phòng ban và nhân viên
        </p>
      </div>
      <OrganizationTabs />
    </div>
  );
}
