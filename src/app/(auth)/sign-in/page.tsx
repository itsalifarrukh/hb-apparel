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
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { SocialAccountAlert } from "@/components/ui/social-account-alert";
import { useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const [socialAccountAlert, setSocialAccountAlert] = useState<{
    show: boolean;
    message: string;
    providers: string[];
  }>({ show: false, message: "", providers: [] });

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

  const handleSocialSignIn = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign In Failed",
          description: `Failed to sign in with ${provider}`,
          variant: "destructive",
        });
      } else if (result?.ok && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCloseSocialAlert = () => {
    setSocialAccountAlert({ show: false, message: "", providers: [] });
  };

  return (
    <section className="relative flex justify-center items-center min-h-screen py-20 bg-[#F7F7F7] dark:bg-[#263238]">

      <div className="relative w-full max-w-md p-8 space-y-8 rounded-lg bg-white dark:bg-[#455A64] backdrop-blur-xl shadow-lg ring-1 ring-[#B0BEC5]/30 dark:ring-[#263238]/30">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-6 text-[#263238] dark:text-white">
            Welcome Back
          </h1>
          <p className="mb-4 text-[#455A64] dark:text-[#B0BEC5]">
            Sign in to continue shopping with HB Apparel
          </p>
        </div>
        
        {socialAccountAlert.show && (
          <SocialAccountAlert
            message={socialAccountAlert.message}
            socialProviders={socialAccountAlert.providers}
            onSignInWithProvider={handleSocialSignIn}
            onClose={handleCloseSocialAlert}
          />
        )}
        
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
                  <PasswordInput
                    {...field}
                    placeholder="Password"
                    className="w-full"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full h-12 text-base font-medium bg-[#263238] text-white hover:bg-[#455A64] dark:bg-white dark:text-[#263238] dark:hover:bg-[#F7F7F7]"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-6">
          <p className="text-[#455A64] dark:text-[#B0BEC5]">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-[#263238] dark:text-white font-medium hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#455A64] dark:border-[#B0BEC5]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#455A64] text-[#455A64] dark:text-[#B0BEC5]">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Sign in with Google"
            onClick={() => handleSocialLogin("google")}
            className="h-12 border-[#455A64] text-[#263238] dark:text-white dark:border-[#B0BEC5] hover:bg-[#F7F7F7] dark:hover:bg-[#263238]"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </div>
      </div>
    </section>
  );
}
