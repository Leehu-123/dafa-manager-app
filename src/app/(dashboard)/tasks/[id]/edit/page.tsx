import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskForm from "@/components/tasks/TaskForm";
import { prisma } from "@/lib/prisma";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignees: true,
    }
  });

  if (!task) {
    return <div className="p-6 text-center text-red-500">Không tìm thấy công việc!</div>;
  }

  // Convert Date objects to strings for the frontend
  const serializedTask = {
    ...task,
    deadline: task.deadline ? task.deadline.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold dafa-text mb-6">Sửa công việc</h1>
      <TaskForm initialData={serializedTask} />
    </div>
  );
}
