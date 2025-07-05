import React, { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Progress } from "components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import zxcvbn from "zxcvbn";
import { cn } from "@/lib/utils";

interface PasswordStepProps {
  onNext: (password: string) => void;
}

const getStrengthColor = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getStrengthText = (score: number) => {
  switch (score) {
    case 0:
      return "Very Weak";
    case 1:
      return "Weak";
    case 2:
      return "Acceptable";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Unknown";
  }
};

const getStrengthDescription = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return "Password is very weak.";
    case 2:
      return "Password is weak.";
    case 3:
      return "Password is acceptable.";
    case 4:
      return "This is a strong password.";
    default:
      return "";
  }
};

export const PasswordStep: React.FC<PasswordStepProps> = ({ onNext }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] =
    useState<zxcvbn.ZXCVBNResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength && passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      return;
    }

    console.log("PasswordStep: calling onNext with password");
    onNext(password);
  };

  const progressValue = passwordStrength
    ? ((passwordStrength.score + 1) / 5) * 100
    : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700">
                <span className="text-yellow-400 text-2xl">🔒</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Set Your Password
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Create a strong password to secure your wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                  />
                </div>

                {passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Password Strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength.score >= 3
                            ? "text-green-400"
                            : passwordStrength.score >= 2
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {getStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <Progress
                      value={progressValue}
                      className={cn(
                        "h-2",
                        getStrengthColor(passwordStrength.score)
                      )}
                    />
                    <p className="text-xs text-gray-400">
                      {getStrengthDescription(passwordStrength.score)}
                    </p>
                    {passwordStrength.feedback.warning && (
                      <p className="text-xs text-yellow-400">
                        ⚠️ {passwordStrength.feedback.warning}
                      </p>
                    )}
                    {passwordStrength.feedback.suggestions.length > 0 && (
                      <div className="text-xs text-gray-400">
                        <p className="font-medium mb-1">Suggestions:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordStrength.feedback.suggestions.map(
                            (suggestion: string, index: number) => (
                              <li key={index}>{suggestion}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-gray-800 text-white placeholder-gray-400 border-gray-600"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-center text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full text-lg py-4"
                  disabled={
                    !password ||
                    !confirmPassword ||
                    (passwordStrength ? passwordStrength.score < 3 : false)
                  }
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
