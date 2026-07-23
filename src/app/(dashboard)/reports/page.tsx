import { ReportListPage } from "@/components/reports/ReportListPage";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Báo cáo công việc | DAFA Glass",
  description: "Quản lý báo cáo công việc",
};

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Báo Cáo Công Việc</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Quản lý và xét duyệt báo cáo công việc hàng ngày/tuần/tháng
        </p>
      </div>
      <ReportListPage currentUser={session.user} />
    </div>
  );
}
