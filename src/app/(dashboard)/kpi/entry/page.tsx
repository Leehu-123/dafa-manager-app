import { KpiEntryForm } from "@/components/kpi/KpiEntryForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cập nhật KPI | DAFA Glass",
  description: "Nhập dữ liệu KPI thực tế",
};

export default async function KpiEntryPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role === "EMPLOYEE") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Cập Nhật Dữ Liệu KPI</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Đánh giá và nhập kết quả thực hiện KPI cho nhân viên
        </p>
      </div>
      <KpiEntryForm currentUser={session.user} />
    </div>
  );
}
