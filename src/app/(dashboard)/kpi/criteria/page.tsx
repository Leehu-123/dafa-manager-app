import { KpiCriteriaManager } from "@/components/kpi/KpiCriteriaManager";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quản lý Tiêu chí KPI | DAFA Glass",
  description: "Thiết lập tiêu chí KPI cho các phòng ban",
};

export default async function KpiCriteriaPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Tiêu Chí KPI</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Quản lý thư viện tiêu chí đánh giá cho các phòng ban
        </p>
      </div>
      <KpiCriteriaManager />
    </div>
  );
}
