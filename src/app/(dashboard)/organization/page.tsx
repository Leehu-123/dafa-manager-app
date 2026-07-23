import { OrgTreeView } from "@/components/organization/OrgTreeView";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sơ đồ tổ chức | DAFA Glass",
  description: "Cơ cấu tổ chức công ty",
};

export default async function OrganizationPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Sơ Đồ Tổ Chức</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Quản lý cơ cấu các chi nhánh và phòng ban
        </p>
      </div>
      <OrgTreeView />
    </div>
  );
}
