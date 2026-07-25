import { KpiDashboard } from "@/components/kpi/KpiDashboard";
import { KpiTabs } from "@/components/kpi/KpiTabs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quản lý KPI | DAFA Glass",
  description: "Bảng điều khiển KPI",
};

export default async function KpiPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Quản Lý KPI</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Theo dõi và đánh giá hiệu suất làm việc
        </p>
      </div>
      <KpiTabs userRole={session.user.role} />
      <KpiDashboard user={session.user} />
    </div>
  );
}
