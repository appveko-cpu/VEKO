"use client";
import Navigation from "@/components/Navigation";
import { DeviseProvider } from "@/context/DeviseContext";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import { FelicitationProvider } from "@/context/FelicitationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { UserLevelProvider } from "@/context/UserLevelContext";
import { AccessProvider } from "@/context/AccessContext";
import { MorningBrief, EveningRecall, DailyDigest, SundayStrategy } from "@/components/DailyNotifications";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LevelUpModal from "@/components/onboarding/LevelUpModal";
import ShopifyConnectModal from "@/components/shopify/ShopifyConnectModal";
import ObjectifModal from "@/components/ObjectifModal";
import DemoAuthBar from "@/components/access/DemoAuthBar";
import TrialBanner from "@/components/access/TrialBanner";
import AuthPromptModal from "@/components/access/AuthPromptModal";
import PricingModal from "@/components/access/PricingModal";
import UpgradeModal from "@/components/access/UpgradeModal";

export default function DashboardLayout({
  children,
}: {
  children: import("react").ReactNode;
}) {
  return (
    <AccessProvider>
      <DeviseProvider>
        <DataProvider>
          <ToastProvider>
            <FelicitationProvider>
              <OnboardingProvider>
                <UserLevelProvider>
                  <DemoAuthBar />
                  <TrialBanner />
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
                  <AuthPromptModal />
                  <PricingModal />
                  <UpgradeModal />
                </UserLevelProvider>
              </OnboardingProvider>
            </FelicitationProvider>
          </ToastProvider>
        </DataProvider>
      </DeviseProvider>
    </AccessProvider>
  );
}
