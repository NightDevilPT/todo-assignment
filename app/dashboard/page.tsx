import { DashboardPage } from "@/components/pages/dashboard/page";
import { TaskProvider } from "@/components/context/task-context";

export default function Page() {
  return (
    <TaskProvider>
      <DashboardPage />
    </TaskProvider>
  );
}