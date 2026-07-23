import { EmployeeList } from "@/components/organization/EmployeeList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Danh sách nhân sự | DAFA Glass",
  description: "Quản lý danh sách nhân sự",
};

export default async function EmployeesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dafa-text font-montserrat">Quản Lý Nhân Sự</h1>
        <p className="text-sm dafa-muted font-montserrat">
          Thêm, sửa, xóa và quản lý thông tin nhân viên toàn công ty
        </p>
      </div>
      <EmployeeList />
    </div>
  );
}
