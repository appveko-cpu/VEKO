"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding, BusinessType } from "@/context/OnboardingContext";

type QuestionStep = "business_type" | "followup" | "manual";

const businessTypes = [
  {
    id: "boutique" as BusinessType,
    icon: "fas fa-store",
    title: "Boutique Physique",
    desc: "Je vends en face a face, au comptoir ou sur le terrain",
    color: "#3b82f6",
    hoverBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "social" as BusinessType,
    icon: "fas fa-comments",
    title: "Vente Sociale",
    desc: "Je vends sur WhatsApp, Facebook, Instagram, TikTok",
    color: "#10b981",
    hoverBg: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "shopify" as BusinessType,
    icon: "fas fa-shopping-cart",
    title: "E-commerce Shopify",
    desc: "J'ai une boutique en ligne a synchroniser",
    color: "#95bf47",
    hoverBg: "rgba(149, 191, 71, 0.15)",
  },
];

export default function ProfileQuestions() {
  const { setCurrentStep, updateProfile, setShowShopifyModal } = useOnboarding();
  const [step, setStep] = useState<QuestionStep>("business_type");
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [manualConfig, setManualConfig] = useState({
    pub: true,
    livraison: true,
    loyer: false,
    shopify: false,
  });

  const handleSelectType = async (type: BusinessType) => {
    setSelectedType(type);
    
    setTimeout(() => {
      setStep("followup");
    }, 400);
  };

  const handleFollowupAnswer = async (answer: boolean) => {
    if (!selectedType) return;

    let config: Parameters<typeof updateProfile>[0] = {
      businessType: selectedType,
    };

    if (selectedType === "boutique") {
      config = {
        ...config,
        pubEnabled: false,
        livraisonEnabled: false,
        loyerEnabled: answer,
      };
    } else if (selectedType === "social") {
      config = {
        ...config,
        pubEnabled: answer,
        livraisonEnabled: true,
        loyerEnabled: false,
      };
    } else if (selectedType === "shopify") {
      config = {
        ...config,
        pubEnabled: true,
        livraisonEnabled: true,
        loyerEnabled: false,
      };
      if (answer) {
        setShowShopifyModal(true);
      }
    }

    await updateProfile(config);
    setCurrentStep("config");
  };

  const handleManualSubmit = async () => {
    await updateProfile({
      businessType: "manual",
      pubEnabled: manualConfig.pub,
      livraisonEnabled: manualConfig.livraison,
      loyerEnabled: manualConfig.loyer,
      shopifyConnected: manualConfig.shopify,
    });
    
    if (manualConfig.shopify) {
      setShowShopifyModal(true);
    }
    
    setCurrentStep("config");
  };

  const getFollowupQuestion = () => {
    if (selectedType === "boutique") {
      return {
        question: "Payez-vous un loyer ou des charges fixes ?",
        hint: "Loyer, electricite, eau... On inclura ca dans vos calculs",
        yesLabel: "Oui",
        noLabel: "Non",
      };
    }
    if (selectedType === "social") {
      return {
        question: "Faites-vous de la pub payante ?",
        hint: "Facebook Ads, TikTok Ads... On activera le champ pub",
        yesLabel: "Oui",
        noLabel: "Non",
      };
    }
    if (selectedType === "shopify") {
      return {
        question: "Votre boutique est-elle active en ce moment ?",
        hint: "Si elle tourne deja, on pourra importer vos commandes",
        yesLabel: "Oui, elle tourne",
        noLabel: "Je la lance bientot",
      };
    }
    return null;
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "40px 20px",
    }}>
      <AnimatePresence mode="wait">
        {step === "business_type" && (
          <motion.div
            key="business_type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ flex: 1 }}
          >
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                Question 1 sur 2
              </span>
            </div>
            <div style={{
              height: "4px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              marginBottom: "32px",
            }}>
              <div style={{
                width: "50%",
                height: "100%",
                background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                borderRadius: "2px",
              }} />
            </div>

            <h2 style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "white",
              marginBottom: "8px",
            }}>
              Comment vendez-vous ?
            </h2>
            <p style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "28px",
            }}>
              VEKO va s&apos;adapter a votre facon de travailler.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {businessTypes.map(type => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectType(type.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    padding: "18px",
                    borderRadius: "16px",
                    border: selectedType === type.id 
                      ? `2px solid ${type.color}` 
                      : "1px solid rgba(255,255,255,0.1)",
                    background: selectedType === type.id ? type.hoverBg : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `${type.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <i className={type.icon} style={{ color: type.color, fontSize: "18px" }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "white",
                      marginBottom: "4px",
                    }}>
                      {type.title}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.4,
                    }}>
                      {type.desc}
                    </div>
                  </div>
                  {selectedType === type.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: type.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fas fa-check" style={{ color: "white", fontSize: "12px" }}></i>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStep("manual")}
              style={{
                marginTop: "24px",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Je fais plusieurs de ces choses → Configurer manuellement
            </button>
          </motion.div>
        )}

        {step === "followup" && (
          <motion.div
            key="followup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ flex: 1 }}
          >
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                Question 2 sur 2
              </span>
            </div>
            <div style={{
              height: "4px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              marginBottom: "32px",
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                borderRadius: "2px",
              }} />
            </div>

            {getFollowupQuestion() && (
              <>
                <h2 style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "white",
                  marginBottom: "12px",
                }}>
                  {getFollowupQuestion()!.question}
                </h2>
                <p style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "32px",
                }}>
                  {getFollowupQuestion()!.hint}
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFollowupAnswer(true)}
                    style={{
                      flex: 1,
                      padding: "18px",
                      borderRadius: "14px",
                      border: "none",
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {getFollowupQuestion()!.yesLabel}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFollowupAnswer(false)}
                    style={{
                      flex: 1,
                      padding: "18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {getFollowupQuestion()!.noLabel}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === "manual" && (
          <motion.div
            key="manual"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ flex: 1 }}
          >
            <h2 style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "white",
              marginBottom: "8px",
            }}>
              Parlons de votre business
            </h2>
            <p style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "28px",
            }}>
              Repondez par Oui ou Non pour configurer VEKO.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { key: "pub", label: "Vous faites de la pub payante ?" },
                { key: "livraison", label: "Vous avez des frais de livraison client ?" },
                { key: "loyer", label: "Vous payez un loyer ou charges fixes ?" },
                { key: "shopify", label: "Vous avez une boutique Shopify ?" },
              ].map(item => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ color: "white", fontSize: "14px" }}>{item.label}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setManualConfig(prev => ({ ...prev, [item.key]: true }))}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: manualConfig[item.key as keyof typeof manualConfig]
                          ? "#8b5cf6"
                          : "rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-inter), sans-serif",
                      }}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setManualConfig(prev => ({ ...prev, [item.key]: false }))}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: !manualConfig[item.key as keyof typeof manualConfig]
                          ? "#8b5cf6"
                          : "rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--font-inter), sans-serif",
                      }}
                    >
                      Non
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualSubmit}
              style={{
                width: "100%",
                marginTop: "32px",
                padding: "18px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              Configurer mon VEKO
              <i className="fas fa-arrow-right" style={{ marginLeft: "10px" }}></i>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
