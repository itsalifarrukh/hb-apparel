"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signupSchema";
import axios, { AxiosError } from "axios";
import ApiResponse from "@/types/ApiResponse";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { SocialAccountAlert } from "@/components/ui/social-account-alert";

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialAccountAlert, setSocialAccountAlert] = useState<{
    show: boolean;
    message: string;
    providers: string[];
  }>({ show: false, message: "", providers: [] });
  const debounced = useDebounceCallback(setUsername, 500);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(
            `/api/user/auth/check-username-unique?username=${username}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ??
              "Error while Checking the Username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true); // Set the submitting state to true when the form is submitted
    setSocialAccountAlert({ show: false, message: "", providers: [] }); // Reset alert
    
    try {
      // Call your API to create the user
      await axios.post("/api/user/auth/sign-up", data);

      // Show success message and redirect to verify page
      toast({
        title: "Success!",
        description: "We've sent an OTP to your email address. Please verify it to complete your registration.",
        variant: "default",
      });

      // Redirect to verify page with username
      router.push(`/verify/${data.username}`);
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse & {
        socialProviders?: string[];
        redirectToSignIn?: boolean;
      }>;
      
      // Check if it's a social account conflict
      if (axiosError.response?.status === 409 && axiosError.response.data.socialProviders) {
        setSocialAccountAlert({
          show: true,
          message: axiosError.response.data.message || "You already have an account with social login.",
          providers: axiosError.response.data.socialProviders
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description:
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false); // Set the submitting state to false once the process is done
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign Up Failed",
          description: `Failed to sign up with Google`,
          variant: "destructive",
        });
      } else if (result?.ok && result.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
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
    } catch {
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
            Create Your Account
          </h1>
          <p className="mb-4 text-[#455A64] dark:text-[#B0BEC5]">
            Join HB Apparel for exclusive offers and style inspiration
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
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {isCheckingUsername && (
                    <div className="flex items-center gap-2 text-sm text-[#455A64] dark:text-[#B0BEC5]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking availability...
                    </div>
                  )}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm font-medium ${
                        usernameMessage === "Username is unique"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className="text-[#455A64] dark:text-[#B0BEC5] text-sm">
                    We will send you a verification code
                  </p>
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
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-[#263238] text-white hover:bg-[#455A64] dark:bg-white dark:text-[#263238] dark:hover:bg-[#F7F7F7]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-6">
          <p className="text-[#455A64] dark:text-[#B0BEC5]">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-[#263238] dark:text-white font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#B0BEC5] dark:border-[#455A64]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[#455A64] text-[#455A64] dark:text-[#B0BEC5]">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Sign up with Google"
            onClick={() => handleGoogleSignUp()}
            className="h-12 border-[#B0BEC5] text-[#263238] dark:text-white dark:border-[#455A64] hover:bg-[#F7F7F7] dark:hover:bg-[#263238]"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
        </div>
      </div>
    </section>
  );
}
