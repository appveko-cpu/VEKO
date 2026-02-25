"use client";
import Navigation from "@/components/Navigation";
import { DeviseProvider } from "@/context/DeviseContext";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import { FelicitationProvider } from "@/context/FelicitationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { UserLevelProvider } from "@/context/UserLevelContext";
import { MorningBrief, EveningRecall, DailyDigest, SundayStrategy } from "@/components/DailyNotifications";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LevelUpModal from "@/components/onboarding/LevelUpModal";
import ShopifyConnectModal from "@/components/shopify/ShopifyConnectModal";
import ObjectifModal from "@/components/ObjectifModal";

export default function DashboardLayout({
  children,
}: {
  children: import("react").ReactNode;
}) {
  return (
    <DeviseProvider>
      <DataProvider>
        <ToastProvider>
          <FelicitationProvider>
            <OnboardingProvider>
              <UserLevelProvider>
                <Navigation />
                {children}
                <MorningBrief />
                <EveningRecall />
                <DailyDigest />
                <SundayStrategy />
                <OnboardingFlow />
                <LevelUpModal />
                <ShopifyConnectModal />
                <ObjectifModal />
              </UserLevelProvider>
            </OnboardingProvider>
          </FelicitationProvider>
        </ToastProvider>
      </DataProvider>
    </DeviseProvider>
  );
}
