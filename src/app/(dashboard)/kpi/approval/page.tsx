import { KpiPendingApprovalList } from "@/components/kpi/KpiPendingApprovalList";
import { KpiTabs } from "@/components/kpi/KpiTabs";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Duyệt Phiếu KPI | DAFA Glass",
  description: "Danh sách phiếu KPI chờ phê duyệt",
};

export default async function KpiApprovalPage() {
  const session = await auth();

  if (!session?.user || session.user.role === "EMPLOYEE") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Duyệt Phiếu KPI</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Danh sách phiếu đánh giá KPI của nhân viên chờ Quản lý & Quản trị viên phê duyệt
        </p>
      </div>
      <KpiTabs userRole={session.user.role} />
      <KpiPendingApprovalList currentUser={session.user} />
    </div>
  );
}
