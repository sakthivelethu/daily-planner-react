import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { GymLog, Task } from "@shared/schema";
import { CheckCircle2, Dumbbell, LayoutDashboard, History, Trophy, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { data: gymHistory } = useQuery<GymLog[]>({
    queryKey: ["/api/gym/history"],
  });

  // For MVP, we'll assume current tasks list reflects the items tracked historically
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const getLogForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return gymHistory?.find(l => l.date === dateStr);
  };

  const getGymProgress = (log: GymLog) => {
    const bSets = (log.bicepsSets as any[]) || [];
    const sSets = (log.shoulderSets as any[]) || [];
    const total = bSets.length + sSets.length;
    if (total === 0) return 0;
    const completed = [...bSets, ...sSets].filter(s => s.completed).length;
    return (completed / total) * 100;
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
          <p className="mt-1 text-slate-500">Reflect on your past productivity and gains.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Calendar */}
          <div className="lg:col-span-5">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 py-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <History className="h-4 w-4 text-primary" />
                  Activity Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-none"
                  modifiers={{
                    completed: (date) => {
                      const log = getLogForDate(date);
                      return log ? getGymProgress(log) >= 100 : false;
                    },
                    partial: (date) => {
                      const log = getLogForDate(date);
                      const progress = log ? getGymProgress(log) : 0;
                      return progress > 0 && progress < 100;
                    }
                  }}
                  modifiersClassNames={{
                    completed: "bg-emerald-100 text-emerald-900 font-bold rounded-full",
                    partial: "bg-blue-100 text-blue-900 font-bold rounded-full"
                  }}
                />
                <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Workout Complete</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>In Progress</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Daily Details */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div
                  key={selectedDate.toISOString()}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {format(selectedDate, 'EEEE, MMMM do')}
                        </CardTitle>
                        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          Daily Snapshot
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-4">
                      {/* Tasks Summary */}
                      <section className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard Progress
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {tasks?.map(task => (
                            <div key={task.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                task.completed ? "bg-emerald-500" : "bg-slate-200"
                              )} />
                              <span className={cn(
                                "text-sm font-medium",
                                task.completed ? "text-slate-900" : "text-slate-400"
                              )}>
                                {task.title}
                              </span>
                              {task.completed && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Gym Summary */}
                      <section className="space-y-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
                          <Dumbbell className="h-4 w-4" />
                          Gym Summary
                        </h3>
                        {(() => {
                          const log = getLogForDate(selectedDate);
                          if (!log) return <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">No workout recorded for this day</div>;
                          
                          const progress = getGymProgress(log);
                          return (
                            <div className="space-y-6">
                              <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-lg">
                                  <div className="text-xs font-medium text-slate-400">Pushups</div>
                                  <div className="mt-1 text-2xl font-bold text-yellow-400">{log.pushupsCount}</div>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                                  <div className="text-xs font-medium text-slate-400">Biceps</div>
                                  <div className="mt-1 text-2xl font-bold text-emerald-500">
                                    {(log.bicepsSets as any[])?.filter(s => s.completed).length} / 3
                                  </div>
                                </div>
                                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                                  <div className="text-xs font-medium text-slate-400">Shoulders</div>
                                  <div className="mt-1 text-2xl font-bold text-blue-500">
                                    {(log.shoulderSets as any[])?.filter(s => s.completed).length} / 3
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-slate-700">Workout Completion</span>
                                  <span className="font-bold text-primary">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </div>
                          );
                        })()}
                      </section>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  Select a date to view details
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}