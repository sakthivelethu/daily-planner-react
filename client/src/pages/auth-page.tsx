import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { login, isLoggingIn, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  if (isLoading) return <Loader />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl shadow-black/5 ring-1 ring-slate-900/5">
          <CardHeader className="space-y-1 pb-8 text-center">
            {/* ✅ LOGO — D ONLY */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-white shadow-lg shadow-primary/25 font-display">
              D
            </div>

            <CardTitle className="text-2xl font-bold text-slate-900">
              Daily Planner
            </CardTitle>
            <CardDescription className="text-slate-500">
              Your peaceful space for consistent productivity
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => login(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sakthi"
                          {...field}
                          className="h-11 rounded-lg border-slate-200 bg-slate-50 px-4 transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="h-11 rounded-lg border-slate-200 bg-slate-50 px-4 transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-2 h-11 w-full rounded-lg bg-slate-900 text-base font-medium text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
                >
                  {isLoggingIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-400">
          Tip: Use <strong>Sakthi</strong> /{" "}
          <strong>Sakthi@123</strong>
        </p>
      </motion.div>
    </div>
  );
}
