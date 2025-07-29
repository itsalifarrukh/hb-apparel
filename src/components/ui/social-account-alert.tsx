import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { AlertTriangle, X } from "lucide-react";

interface SocialAccountAlertProps {
  message: string;
  socialProviders: string[];
  onSignInWithProvider: (provider: string) => void;
  onClose: () => void;
}

export const SocialAccountAlert: React.FC<SocialAccountAlertProps> = ({
  message,
  socialProviders,
  onSignInWithProvider,
  onClose,
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return <FcGoogle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return "Google";
      default:
        return provider;
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <AlertDescription className="text-amber-800 dark:text-amber-200 mb-4">
            {message}
          </AlertDescription>
          <div className="space-y-2">
            {socialProviders.map((provider) => (
              <Button
                key={provider}
                variant="outline"
                size="sm"
                onClick={() => onSignInWithProvider(provider)}
                className="w-full justify-start border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/30"
              >
                {getProviderIcon(provider)}
                <span className="ml-2">Continue with {getProviderDisplayName(provider)}</span>
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
