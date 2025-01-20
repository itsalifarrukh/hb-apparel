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
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4 text-gray-800">
            Verify Your Account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="mb-4 text-gray-600">
                    Verification Code
                  </FormLabel>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    className="flex gap-8 justify-center"
                  >
                    <InputOTPGroup className="gap-4">
                      <InputOTPSlot
                        index={0}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator>-</InputOTPSeparator>
                    <InputOTPGroup className="gap-4">
                      <InputOTPSlot
                        index={3}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-12 w-12 text-center text-lg border rounded-md shadow-sm"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full py-2 text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
