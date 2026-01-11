import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import { Loader } from "@/components/loading";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, Flame, Trophy, Code, Gamepad2, Cloud, Terminal, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to map task titles to icons and colors
const getTaskVisuals = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("gcp")) return { icon: Cloud, color: "text-blue-500", bg: "bg-blue-50" };
  if (lower.includes("devops")) return { icon: Terminal, color: "text-purple-500", bg: "bg-purple-50" };
  if (lower.includes("c#")) return { icon: Code, color: "text-violet-500", bg: "bg-violet-50" };
  if (lower.includes("unity") || lower.includes("unreal")) return { icon: Gamepad2, color: "text-slate-600", bg: "bg-slate-100" };
  if (lower.includes("gym")) return { icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-50" };
  return { icon: Trophy, color: "text-orange-500", bg: "bg-orange-50" };
};

export default function Dashboard() {
  const { data: tasks, isLoading } = useTasks();
  const { mutate: toggleTask } = useToggleTask();

  if (isLoading) return <Loader />;

  // Calculate stats
  const completedToday = tasks?.filter(t => t.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Today's Focus</h1>
            <p className="mt-1 text-slate-500">Keep up the momentum. You've completed {completedToday} tasks today.</p>
          </div>
          
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-100">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary transition-all duration-500 ease-out"
              />
            </div>
            <span className="text-sm font-bold text-slate-700">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks?.map((task, index) => {
            const visuals = getTaskVisuals(task.title);
            const Icon = visuals.icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5",
                    task.completed ? "bg-slate-50/50" : "bg-white"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={cn("rounded-xl p-3 transition-colors", visuals.bg)}>
                        <Icon className={cn("h-6 w-6", visuals.color)} />
                      </div>
                      
                      {task.completed ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/25">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-slate-100 bg-white group-hover:border-slate-300" />
                      )}
                    </div>

                    <div className="mt-6">
                      <h3 className={cn(
                        "text-lg font-bold transition-colors",
                        task.completed ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {task.title}
                      </h3>
                      
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <Flame className={cn("h-4 w-4", task.streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300")} />
                        <span className="font-medium">{task.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar at bottom of card */}
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-50">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: task.completed ? "100%" : "0%" }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
