"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiResponse from "@/types/ApiResponse";
import { verifySchema } from "@/schemas/verifyCodeSchema";
import { Loader2 } from "lucide-react"; // Loader icon from Lucide React

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // State to manage loading
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.post<ApiResponse>(
        `/api/user/auth/verify-code`,
        {
          username: params.username,
          code: data.code,
        }
      );

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace("/sign-in");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Verification Failed",
        description:
          axiosError.response?.data.message ??
          "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <section className="relative flex justify-center items-center min-h-screen py-20 bg-[#F7F7F7] dark:bg-[#263238]">
      <div className="relative w-full max-w-md p-8 space-y-8 rounded-lg bg-white dark:bg-[#455A64] backdrop-blur-xl shadow-lg ring-1 ring-[#B0BEC5]/30 dark:ring-[#263238]/30">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-6 text-[#263238] dark:text-white">
            Verify Your Account
          </h1>
          <p className="text-[#455A64] dark:text-[#B0BEC5] mb-6">
            Enter the 6-digit verification code sent to your email address
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="mb-4 text-[#263238] dark:text-white font-medium">
                    Verification Code
                  </FormLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    className="flex gap-8 justify-center"
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={0}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-[#455A64] dark:text-[#B0BEC5]">-</InputOTPSeparator>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot
                        index={3}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-14 w-14 text-center text-xl border-[#B0BEC5] dark:border-[#455A64] bg-white dark:bg-[#263238] text-[#263238] dark:text-white rounded-lg font-semibold focus:border-[#263238] dark:focus:border-white"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center mt-8">
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-[#263238] text-white hover:bg-[#455A64] dark:bg-white dark:text-[#263238] dark:hover:bg-[#F7F7F7]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
