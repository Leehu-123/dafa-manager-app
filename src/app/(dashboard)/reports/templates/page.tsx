import { ReportTemplateManager } from "@/components/reports/ReportTemplateManager";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Mẫu báo cáo | DAFA Glass",
  description: "Quản lý mẫu báo cáo",
};

export default async function ReportTemplatesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Quản Lý Mẫu Báo Cáo</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Tạo và cấu hình các biểu mẫu báo cáo động cho từng phòng ban
        </p>
      </div>
      <ReportTemplateManager />
    </div>
  );
}
