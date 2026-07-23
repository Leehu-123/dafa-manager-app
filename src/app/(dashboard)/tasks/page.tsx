import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TaskListPage from "@/components/tasks/TaskListPage";

export default async function TasksPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-6">
      <TaskListPage />
    </div>
  );
}
