"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signInSchema } from "@/schemas/signinSchema";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const { toast } = useToast();
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        console.error("Sign-in error:", result.error);
        toast({
          title: "Login Failed",
          description:
            result.error === "CredentialsSignin"
              ? "Invalid credentials"
              : result.error,
          variant: "destructive",
        });
        return;
      }

      if (result?.ok) {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Sign-in exception:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false, // Don't automatically redirect
      });

      if (result?.error) {
        console.error("Social login failed:", result.error);
        toast({
          title: "Login Failed",
          description: `Failed to sign in with ${provider}`,
          variant: "destructive",
        });
      } else if (result?.ok && result.url) {
        // Successful login, manually redirect
        router.push(result.url);
      }
    } catch (error) {
      console.error("Social login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="relative flex justify-center items-center min-h-screen py-20 bg-[#E3F2FD]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-20 h-56 w-56 rounded-full bg-[#BBDEFB]/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#90CAF9]/60 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md p-8 space-y-8 rounded-3xl bg-[#BBDEFB]/80 dark:bg-[#1A237E]/80 backdrop-blur-xl shadow-2xl ring-1 ring-[#64B5F6]/30 dark:ring-[#42A5F5]/30">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#64B5F6] to-[#42A5F5] dark:from-[#90CAF9] dark:to-[#42A5F5]">
            Welcome Back to HB Apparel
          </h1>
          <p className="mb-4 text-[#1565C0] dark:text-[#E3F2FD]">
            Sign in to continue shopping with us
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sign In with Username or Email</FormLabel>
                  <Input {...field} placeholder="Username or Email" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} placeholder="Password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{" "}
            <Link
              href="/sign-up"
              className="text-[#42A5F5] hover:bg-cool-2 px-1 py-0.5 rounded transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#90CAF9] dark:border-[#1565C0]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button
            aria-label="Sign in with Google"
            onClick={() => handleSocialLogin("google")}
            className="flex justify-center items-center px-4 py-2 border border-[#90CAF9] rounded-md shadow-sm text-sm font-medium text-[#1565C0] bg-[#E3F2FD] hover:bg-cool-2"
          >
            Sign in with{""}
            <FcGoogle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
