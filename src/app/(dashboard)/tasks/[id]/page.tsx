import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskDetail from "@/components/tasks/TaskDetail";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-6">
      <TaskDetail taskId={id} currentUserId={session.user.id} />
    </div>
  );
}
