"use client";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import { DeviseProvider } from "@/context/DeviseContext";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import { FelicitationProvider } from "@/context/FelicitationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { UserLevelProvider } from "@/context/UserLevelContext";
import { PlanProvider } from "@/context/PlanContext";

const MorningBrief = dynamic(() => import("@/components/DailyNotifications").then(m => ({ default: m.MorningBrief })), { ssr: false });
const EveningRecall = dynamic(() => import("@/components/DailyNotifications").then(m => ({ default: m.EveningRecall })), { ssr: false });
const DailyDigest = dynamic(() => import("@/components/DailyNotifications").then(m => ({ default: m.DailyDigest })), { ssr: false });
const SundayStrategy = dynamic(() => import("@/components/DailyNotifications").then(m => ({ default: m.SundayStrategy })), { ssr: false });
const OnboardingFlow = dynamic(() => import("@/components/onboarding/OnboardingFlow"), { ssr: false });
const LevelUpModal = dynamic(() => import("@/components/onboarding/LevelUpModal"), { ssr: false });
const ShopifyConnectModal = dynamic(() => import("@/components/shopify/ShopifyConnectModal"), { ssr: false });
const ObjectifModal = dynamic(() => import("@/components/ObjectifModal"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: import("react").ReactNode;
}) {
  return (
    <DeviseProvider>
      <DataProvider>
        <PlanProvider>
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
        </PlanProvider>
      </DataProvider>
    </DeviseProvider>
  );
}
