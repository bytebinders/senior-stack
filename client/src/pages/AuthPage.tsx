import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  useRequestPasswordReset,
  useResetPassword,
} from "@/hooks/use-password-reset";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/routes";

// Login Schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Register Schema
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function AuthPage() {
  const { user, login, register, isLoggingIn, isRegistering } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  if (user) {
    return <Redirect to="/" />;
  }

  if (showPasswordReset) {
    return <PasswordResetFlow onBack={() => setShowPasswordReset(false)} />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 0 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="flex items-center gap-3 z-10">
          <ShieldAlert className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">CrimeWatch</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Secure Reporting for <br />
            Safer Communities.
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            A comprehensive platform for reporting incidents, tracking status,
            and maintaining public safety records with transparency and
            efficiency.
          </p>
        </div>

        <div className="z-10 text-sm text-primary-foreground/60">
          © 2025 CrimeWatch System. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold tracking-tight">CrimeWatch</h2>
                <p className="text-xs text-muted-foreground">
                  Crime Tracking System
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                onSubmit={(data) => login(data)}
                isLoading={isLoggingIn}
                onForgotPassword={() => setShowPasswordReset(true)}
              />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm
                onSubmit={(data) => register(data)}
                isLoading={isRegistering}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  onSubmit,
  isLoading,
  onForgotPassword,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Card className="border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="p-0 h-auto text-xs"
              onClick={onForgotPassword}
            >
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

function RegisterForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "reporter",
    },
  });

  return (
    <Card className="border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repeat password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

// Password Reset Schemas
const requestResetSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function PasswordResetFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [resetToken, setResetToken] = useState("");
  const { mutate: requestReset, isPending: isRequestingReset } =
    useRequestPasswordReset();
  const { mutate: resetPassword, isPending: isResettingPassword } =
    useResetPassword();

  const handleRequestReset = (data: z.infer<typeof requestResetSchema>) => {
    requestReset(data.username, {
      onSuccess: (response: any) => {
        if (response.token) {
          setResetToken(response.token);
          setStep("reset");
        }
      },
    });
  };

  const handleResetPassword = (data: z.infer<typeof resetPasswordSchema>) => {
    resetPassword(
      { token: resetToken, newPassword: data.newPassword },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 0 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="flex items-center gap-3 z-10">
          <ShieldAlert className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">CrimeWatch</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Secure Reporting for <br />
            Safer Communities.
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            A comprehensive platform for reporting incidents, tracking status,
            and maintaining public safety records with transparency and
            efficiency.
          </p>
        </div>

        <div className="z-10 text-sm text-primary-foreground/60">
          © 2024 CrimeWatch System. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Reset Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full justify-start -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>

          {step === "request" ? (
            <RequestResetForm
              onSubmit={handleRequestReset}
              isLoading={isRequestingReset}
            />
          ) : (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              isLoading={isResettingPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RequestResetForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: z.infer<typeof requestResetSchema>) => void;
  isLoading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { username: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your username to request a password reset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Request Reset"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ResetPasswordForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: z.infer<typeof resetPasswordSchema>) => void;
  isLoading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Password</CardTitle>
        <CardDescription>
          Enter your reset token and new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset Token</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paste your reset token here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
