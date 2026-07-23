import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import KanbanBoard from "@/components/tasks/KanbanBoard";

export default async function KanbanPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <KanbanBoard />
    </div>
  );
}
