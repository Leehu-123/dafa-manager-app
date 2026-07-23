import { ReportSubmitForm } from "@/components/reports/ReportSubmitForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Nộp báo cáo | DAFA Glass",
  description: "Nộp báo cáo công việc mới",
};

export default async function ReportSubmitPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Nộp Báo Cáo</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Điền thông tin và nộp báo cáo công việc
        </p>
      </div>
      <ReportSubmitForm currentUser={session.user} />
    </div>
  );
}
