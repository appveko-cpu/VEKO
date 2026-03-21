"use client";
import { useOnboarding } from "@/context/OnboardingContext";
import ProfileQuestions from "./ProfileQuestions";
import ConfigurationScreen from "./ConfigurationScreen";

export default function OnboardingFlow() {
  const { isOnboardingDone, currentStep, loading } = useOnboarding();

  if (loading) return null;
  if (isOnboardingDone) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
      background: "#0a0a0f",
    }}>
      {(currentStep === "profile" || currentStep === "profile_followup") && <ProfileQuestions />}
      {currentStep === "config" && <ConfigurationScreen />}
    </div>
  );
}
