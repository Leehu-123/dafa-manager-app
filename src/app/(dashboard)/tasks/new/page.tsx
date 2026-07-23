import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskForm from "@/components/tasks/TaskForm";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold dafa-text mb-6">Tạo công việc mới</h1>
      <TaskForm />
    </div>
  );
}
