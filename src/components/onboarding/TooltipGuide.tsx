"use client";
import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

type TooltipPosition = "top" | "bottom" | "left" | "right";

type TooltipGuideProps = {
  id: string;
  children: ReactNode;
  title: string;
  message: string;
  icon?: string;
  position?: TooltipPosition;
  primaryAction?: string;
  secondaryAction?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  delay?: number;
  condition?: boolean;
};

export default function TooltipGuide({
  id,
  children,
  title,
  message,
  icon = "fas fa-lightbulb",
  position = "bottom",
  primaryAction = "OK compris",
  secondaryAction,
  onPrimaryClick,
  onSecondaryClick,
  delay = 0,
  condition = true,
}: TooltipGuideProps) {
  const { isTooltipSeen, markTooltipSeen } = useOnboarding();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipWidth = 300;
    const tooltipHeight = 150;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - tooltipHeight - 12;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 12;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 12;
        break;
    }

    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

    setTooltipPosition({ top, left });
  }, [position]);

  useEffect(() => {
    if (!condition) return;
    if (isTooltipSeen(id)) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
      updatePosition();
    }, delay);

    return () => clearTimeout(timer);
  }, [id, condition, delay, isTooltipSeen, updatePosition]);

  useEffect(() => {
    if (showTooltip) {
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [showTooltip, updatePosition]);

  const handleClose = () => {
    markTooltipSeen(id);
    setShowTooltip(false);
    onPrimaryClick?.();
  };

  const handleSecondary = () => {
    markTooltipSeen(id);
    setShowTooltip(false);
    onSecondaryClick?.();
  };

  return (
    <>
      <div ref={targetRef} style={{ display: "contents" }}>
        {children}
      </div>

      <AnimatePresence>
        {showTooltip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 9998,
              }}
              onClick={handleClose}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: targetRef.current?.getBoundingClientRect().top ?? 0,
                  left: targetRef.current?.getBoundingClientRect().left ?? 0,
                  width: targetRef.current?.getBoundingClientRect().width ?? 0,
                  height: targetRef.current?.getBoundingClientRect().height ?? 0,
                  borderRadius: "12px",
                  boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 0 9999px rgba(0,0,0,0.6)",
                  pointerEvents: "auto",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: position === "top" ? 10 : -10 }}
              style={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                width: "300px",
                background: "var(--dark-card)",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid var(--diamond-border)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                zIndex: 10000,
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "12px",
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <i className={icon} style={{ color: "#8b5cf6", fontSize: "16px" }}></i>
                </div>
                <div>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}>
                    {message}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                {secondaryAction && (
                  <button
                    onClick={handleSecondary}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--diamond-border)",
                      background: "transparent",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {secondaryAction}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {primaryAction}
                </button>
              </div>

              <div
                style={{
                  position: "absolute",
                  width: "12px",
                  height: "12px",
                  background: "var(--dark-card)",
                  border: "1px solid var(--diamond-border)",
                  borderRight: "none",
                  borderBottom: "none",
                  transform: position === "bottom" ? "rotate(45deg)" : 
                            position === "top" ? "rotate(-135deg)" :
                            position === "left" ? "rotate(135deg)" : "rotate(-45deg)",
                  ...(position === "bottom" && { top: "-7px", left: "50%", marginLeft: "-6px" }),
                  ...(position === "top" && { bottom: "-7px", left: "50%", marginLeft: "-6px" }),
                  ...(position === "left" && { right: "-7px", top: "50%", marginTop: "-6px" }),
                  ...(position === "right" && { left: "-7px", top: "50%", marginTop: "-6px" }),
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
