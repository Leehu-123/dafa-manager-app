import { ReportDetail } from "@/components/reports/ReportDetail";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Chi tiết báo cáo | DAFA Glass",
  description: "Chi tiết báo cáo công việc",
};

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Chi Tiết Báo Cáo</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Xem và đánh giá nội dung báo cáo
        </p>
      </div>
      <ReportDetail reportId={id} currentUser={session.user} />
    </div>
  );
}
