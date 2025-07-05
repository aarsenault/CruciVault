import React, { useState } from "react";
import { WarningStep } from "components/onboarding/WarningStep";
import { GenerateStep } from "components/onboarding/GenerateStep";
import { ValidateStep } from "components/onboarding/ValidateStep";
import { PasswordStep } from "components/onboarding/PasswordStep";
import { OnboardingHome } from "components/OnboardingHome";
import { Stepper } from "components/ui/stepper";
import { generateWallet } from "lib/bittensor";
import { encryptMnemonic } from "lib/crypto";
import { useSecurity } from "contexts/SecurityContext";

type OnboardingStep = "home" | "warning" | "generate" | "validate" | "password";

interface OnboardingState {
  mnemonic?: string;
  address?: string;
  validateIndex?: number;
  password?: string;
}

export const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("home");
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { unlockApp } = useSecurity();

  const goToStep = async (
    step: OnboardingStep,
    state?: Partial<OnboardingState>
  ) => {
    if (
      step === "generate" &&
      (!onboardingState.mnemonic || !onboardingState.address)
    ) {
      setIsGenerating(true);
      setError(null);
      try {
        const wallet = await generateWallet();
        setOnboardingState((prev) => ({
          ...prev,
          mnemonic: wallet.mnemonic,
          address: wallet.address,
        }));
      } catch {
        setError("Failed to generate wallet. Please try again.");
        setIsGenerating(false);
        return;
      }
      setIsGenerating(false);
    }
    if (state) {
      setOnboardingState((prev) => ({ ...prev, ...state }));
    }
    setCurrentStep(step);
  };

  const completeOnboarding = async (password?: string) => {
    console.log("completeOnboarding: starting");
    setIsCompleting(true);
    try {
      // Use provided password or fall back to state
      const finalPassword = password || onboardingState.password;

      // Encrypt and store the mnemonic
      if (onboardingState.mnemonic && finalPassword) {
        console.log("completeOnboarding: encrypting mnemonic");
        const encryptedMnemonic = await encryptMnemonic(
          onboardingState.mnemonic,
          finalPassword!
        );

        console.log("completeOnboarding: storing encrypted mnemonic");
        // Store in Chrome extension storage or localStorage
        if (window.chrome?.storage?.sync) {
          await new Promise<void>((resolve) => {
            window.chrome!.storage!.sync!.set({ encryptedMnemonic }, resolve);
          });
        } else {
          // TODO - change this to chrome storage, not sync. Don't use localStorage.
          localStorage.setItem(
            "encryptedMnemonic",
            JSON.stringify(encryptedMnemonic)
          );
        }
        console.log("completeOnboarding: mnemonic stored successfully");

        // Wait a moment for storage to be fully written
        await new Promise((resolve) => setTimeout(resolve, 200));

        console.log("completeOnboarding: unlocking app");
        unlockApp(onboardingState.mnemonic);

        console.log("completeOnboarding: triggering wallet detection");
        // Dispatch a custom event to notify AppRouter that wallet was created
        window.dispatchEvent(new CustomEvent("walletCreated"));
        console.log("completeOnboarding: wallet creation event dispatched");

        // Additional retry to ensure AppRouter picks up the change
        setTimeout(() => {
          console.log(
            "completeOnboarding: dispatching second walletCreated event"
          );
          window.dispatchEvent(new CustomEvent("walletCreated"));
        }, 500);
      } else {
        console.log("completeOnboarding: missing mnemonic or password", {
          hasMnemonic: !!onboardingState.mnemonic,
          hasPassword: !!onboardingState.password,
        });
        throw new Error("Missing mnemonic or password");
      }

      // Let AppRouter handle navigation after it detects the wallet
      // Don't navigate here - let the AppRouter re-render with the main app routes
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setError("Failed to save wallet. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const getStepperSteps = () => {
    const steps = [
      { title: "Welcome", description: "Get started" },
      { title: "Warning", description: "Security notice" },
      { title: "Generate", description: "Create wallet" },
      { title: "Verify", description: "Verify mnemonic" },
      { title: "Password", description: "Set up security" },
    ];

    const stepIndex = {
      home: 0,
      warning: 1,
      generate: 2,
      validate: 3,
      password: 4,
    };

    return steps.map((step, index) => {
      const currentIndex = stepIndex[currentStep];
      let status: "pending" | "current" | "completed" | "error" = "pending";

      if (index < currentIndex) {
        status = "completed";
      } else if (index === currentIndex) {
        status = "current";
      }

      return {
        ...step,
        status,
      };
    });
  };

  const renderCurrentStep = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col gap-6 items-center">
          <div className="text-white text-center text-xl">
            Generating your wallet...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }
    if (isCompleting) {
      return (
        <div className="flex flex-col gap-6 items-center">
          <div className="text-white text-center text-xl">
            Setting up your wallet...
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col gap-4 items-center">
          <div className="text-red-400 text-center text-lg">{error}</div>
          <button
            className="w-full border-2 border-white !border-white text-lg bg-transparent text-white py-2 rounded"
            onClick={() => goToStep("generate")}
          >
            Try Again
          </button>
        </div>
      );
    }
    switch (currentStep) {
      case "home":
        return (
          <OnboardingHome
            onGenerateWallet={() => goToStep("warning")}
            onImportWallet={() => goToStep("warning")}
          />
        );

      case "warning":
        return (
          <WarningStep
            onContinue={() => goToStep("generate")}
            onBack={() => goToStep("home")}
          />
        );

      case "generate":
        return (
          <GenerateStep
            mnemonic={onboardingState.mnemonic!}
            address={onboardingState.address!}
            onComplete={(mnemonic, address) =>
              goToStep("validate", { mnemonic, address })
            }
            onBack={() => goToStep("warning")}
          />
        );

      case "validate":
        return (
          <ValidateStep
            mnemonic={onboardingState.mnemonic!}
            address={onboardingState.address!}
            validateIndex={onboardingState.validateIndex}
            onComplete={() => goToStep("password")}
            onBack={() => goToStep("generate")}
          />
        );

      case "password":
        return (
          <PasswordStep
            onNext={async (password) => {
              console.log("PasswordStep: onNext called with password");
              setOnboardingState((prev) => {
                const newState = { ...prev, password };
                console.log(
                  "PasswordStep: Updated onboarding state:",
                  newState
                );
                return newState;
              });

              // Pass password directly to completeOnboarding
              console.log(
                "PasswordStep: calling completeOnboarding with password"
              );
              await completeOnboarding(password);
            }}
          />
        );

      default:
        return (
          <OnboardingHome
            onGenerateWallet={() => goToStep("warning")}
            onImportWallet={() => goToStep("warning")}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative z-10">{renderCurrentStep()}</div>
      {/* Show stepper at bottom for all steps except home */}
      {currentStep !== "home" && (
        <div className="p-4 relative z-10">
          <Stepper steps={getStepperSteps()} />
        </div>
      )}
    </div>
  );
};
