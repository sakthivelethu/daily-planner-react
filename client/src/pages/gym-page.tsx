import { useGymLog, useUpdateGymLog } from "@/hooks/use-gym";
import { Loader } from "@/components/loading";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import { Dumbbell, Trophy, CheckCircle2, Calendar as CalendarIcon, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GymLog } from "@shared/schema";
import { format, parseISO, isSameDay } from "date-fns";

type GymSet = { completed: boolean; reps: number };

export default function GymPage() {
  const { data: gymLog, isLoading } = useGymLog();
  const { mutate: updateGymLog } = useUpdateGymLog();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { data: history } = useQuery<GymLog[]>({
    queryKey: ["/api/gym/history"],
  });

  const [formData, setFormData] = useState({
    pushupsCount: 0,
    bicepsSets: [
      { completed: false, reps: 12 },
      { completed: false, reps: 10 },
      { completed: false, reps: 8 }
    ] as GymSet[],
    shoulderSets: [
      { completed: false, reps: 12 },
      { completed: false, reps: 10 },
      { completed: false, reps: 8 }
    ] as GymSet[]
  });

  useEffect(() => {
    if (gymLog) {
      setFormData({
        pushupsCount: gymLog.pushupsCount || 0,
        bicepsSets: (gymLog.bicepsSets as GymSet[]) || [
          { completed: false, reps: 12 },
          { completed: false, reps: 10 },
          { completed: false, reps: 8 }
        ],
        shoulderSets: (gymLog.shoulderSets as GymSet[]) || [
          { completed: false, reps: 12 },
          { completed: false, reps: 10 },
          { completed: false, reps: 8 }
        ]
      });
    }
  }, [gymLog]);

  if (isLoading) return <Loader />;

  const handlePushupsChange = (val: string) => {
    const num = parseInt(val) || 0;
    const newData = { ...formData, pushupsCount: num };
    setFormData(newData);
    updateGymLog(newData);
  };

  const toggleSet = (section: 'bicepsSets' | 'shoulderSets', index: number) => {
    const newSets = [...formData[section]];
    newSets[index] = { ...newSets[index], completed: !newSets[index].completed };
    const newData = { ...formData, [section]: newSets };
    setFormData(newData);
    updateGymLog(newData);
  };

  const pushupProgress = Math.min((formData.pushupsCount / 100) * 100, 100);
  
  const getProgressForLog = (log: Partial<GymLog>) => {
    const bSets = (log.bicepsSets as GymSet[]) || [];
    const sSets = (log.shoulderSets as GymSet[]) || [];
    const total = bSets.length + sSets.length;
    if (total === 0) return 0;
    const completed = [...bSets, ...sSets].filter(s => s.completed).length;
    return (completed / total) * 100;
  };

  const overallProgress = getProgressForLog({ bicepsSets: formData.bicepsSets, shoulderSets: formData.shoulderSets } as any);

  const getLogForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return history?.find(l => l.date === dateStr);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gym Tracker</h1>
            <p className="mt-1 text-slate-500">Track your daily sets and see your journey.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-bold text-slate-700">{Math.round(overallProgress)}% Done Today</span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                className="h-full bg-primary transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Tracker Area */}
          <div className="space-y-8 lg:col-span-7">
            {/* Push-up Challenge Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-none bg-slate-900 text-white shadow-xl shadow-slate-900/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Daily Push-ups</h2>
                      <p className="text-slate-400">Goal: 100 reps</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-4xl font-bold">{formData.pushupsCount}</span>
                      <span className="text-sm font-medium text-slate-400">
                        {Math.max(0, 100 - formData.pushupsCount)} to go
                      </span>
                    </div>
                    <Progress value={pushupProgress} className="h-3 bg-white/20" />
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Input 
                      type="number" 
                      value={formData.pushupsCount || ''}
                      onChange={(e) => handlePushupsChange(e.target.value)}
                      className="border-white/20 bg-white/5 text-lg font-bold text-white placeholder:text-white/20 focus:border-yellow-400 focus:bg-white/10"
                      placeholder="0"
                    />
                    <button 
                      onClick={() => handlePushupsChange(String(formData.pushupsCount + 10))}
                      className="rounded-lg bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Biceps Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                      <Dumbbell className="h-5 w-5 text-emerald-500" />
                      Biceps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.bicepsSets.map((set, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleSet('bicepsSets', i)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:border-emerald-200",
                          set.completed ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={set.completed} 
                            className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <span className={cn(
                            "text-sm font-medium",
                            set.completed ? "text-emerald-900 line-through opacity-50" : "text-slate-700"
                          )}>
                            Set {i + 1}: {set.reps} reps
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shoulders Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                      <Dumbbell className="h-5 w-5 text-blue-500" />
                      Shoulders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.shoulderSets.map((set, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleSet('shoulderSets', i)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:border-blue-200",
                          set.completed ? "bg-blue-50/50 border-blue-100" : "bg-white border-slate-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={set.completed} 
                            className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <span className={cn(
                            "text-sm font-medium",
                            set.completed ? "text-blue-900 line-through opacity-50" : "text-slate-700"
                          )}>
                            Set {i + 1}: {set.reps} reps
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Sidebar - History & Calendar */}
          <div className="space-y-8 lg:col-span-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 py-4">
                  <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                    <History className="h-4 w-4 text-primary" />
                    Gym Tracker Calendar
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
                        return log ? getProgressForLog(log) >= 100 : false;
                      },
                      partial: (date) => {
                        const log = getLogForDate(date);
                        const progress = log ? getProgressForLog(log) : 0;
                        return progress > 0 && progress < 100;
                      }
                    }}
                    modifiersClassNames={{
                      completed: "bg-emerald-100 text-emerald-900 font-bold rounded-full",
                      partial: "bg-blue-100 text-blue-900 font-bold rounded-full"
                    }}
                  />
                  
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Details for {selectedDate ? format(selectedDate, 'MMMM d') : 'selected date'}</h4>
                    {selectedDate && (
                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        {(() => {
                          const log = getLogForDate(selectedDate);
                          if (!log) return <p className="text-sm text-slate-500 italic">No entry for this date.</p>;
                          
                          const progress = getProgressForLog(log);
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Daily Completion</span>
                                <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {log?.pushupsCount || 0} pushups</span>
                                <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3 text-primary" /> {(log?.bicepsSets as any[])?.filter((s:any) => s.completed).length + (log?.shoulderSets as any[])?.filter((s:any) => s.completed).length} sets</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>100% Complete</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <span>Partial Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <span>No Activity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
