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

export default function SignUpForm() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    try {
      // Call your API to create the user
      const response = await axios.post("/api/user/auth/sign-up", data);

      // Axios automatically throws an error for non-2xx status codes
      // and automatically parses JSON responses

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to create account",
        variant: "destructive",
      });
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
  return (
    <section className="relative flex justify-center items-center min-h-screen py-20 bg-[#E3F2FD]">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-20 h-56 w-56 rounded-full bg-[#BBDEFB]/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#90CAF9]/60 blur-2xl" />
      </div>

      <div className="relative w-full max-w-md p-8 space-y-8 rounded-3xl bg-[#BBDEFB]/80 dark:bg-[#1A237E]/80 backdrop-blur-xl shadow-2xl ring-1 ring-[#64B5F6]/30 dark:ring-[#42A5F5]/30">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-[#1565C0] dark:text-[#E3F2FD]">
            Create Your HB Apparel Account
          </h1>
          <p className="mb-4 text-[#1565C0] dark:text-[#E3F2FD]">
            Join today for exclusive offers and style inspiration
          </p>
        </div>
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
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "Username is unique"
                          ? "text-green-500"
                          : "text-red-500"
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
                  <p className="text-muted-foreground text-sm">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link
              href="/sign-in"
              className="text-[#42A5F5] hover:bg-cool-2 px-1 py-0.5 rounded transition-colors"
            >
              Sign in
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
            onClick={() => handleGoogleSignUp()}
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
