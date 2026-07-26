import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskForm from "@/components/tasks/TaskForm";
import { fetchFromCoreAPI } from '@/lib/api';

export default async function EditTaskPage({ params }: { params: any }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const task = await fetchFromCoreAPI('/dafa-tasks/' + id);

  if (!task) {
    return <div className="p-6 text-center text-red-500">Không tìm thấy công việc!</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold dafa-text mb-6">Sửa công việc</h1>
      <TaskForm initialData={task} />
    </div>
  );
}
