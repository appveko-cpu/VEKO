"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useData, GoalType } from "@/context/DataContext";
import { useDevise } from "@/context/DeviseContext";
import { useToast } from "@/context/ToastContext";

const GOAL_TYPES: { value: GoalType; label: string; icon: string; color: string }[] = [
  { value: "net_profit", label: "Benefice Net", icon: "fas fa-coins", color: "#10b981" },
  { value: "revenue", label: "Chiffre d'Affaires (CA)", icon: "fas fa-chart-line", color: "#3b82f6" },
  { value: "products_sold", label: "Nombre de Ventes", icon: "fas fa-shopping-bag", color: "#8b5cf6" },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function ObjectifModal() {
  const { activeGoal, showObjectifModal, setShowObjectifModal, createGoal, updateGoal, deleteGoal } = useData();
  const { deviseActuelle } = useDevise();
  const { showToast } = useToast();

  const [goalType, setGoalType] = useState<GoalType>("net_profit");
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (showObjectifModal) {
      if (activeGoal) {
        setGoalType(activeGoal.type);
        setTargetValue(String(activeGoal.target_value));
        setStartDate(activeGoal.start_date);
        setEndDate(activeGoal.end_date);
        setIsEditing(true);
      } else {
        const today = new Date();
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setGoalType("net_profit");
        setTargetValue("");
        setStartDate(formatDate(today));
        setEndDate(formatDate(endOfMonth));
        setIsEditing(false);
      }
    }
  }, [showObjectifModal, activeGoal]);

  const handleClose = () => {
    setShowObjectifModal(false);
  };

  const handleSave = async () => {
    if (!targetValue || parseFloat(targetValue) <= 0) {
      showToast("Veuillez entrer un objectif valide", "error");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Veuillez selectionner les dates", "error");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      showToast("La date de fin doit etre apres la date de debut", "error");
      return;
    }

    setSaving(true);
    
    const goalData = {
      type: goalType,
      target_value: parseFloat(targetValue),
      start_date: startDate,
      end_date: endDate,
    };

    let success = false;
    if (isEditing && activeGoal) {
      success = await updateGoal(activeGoal.id, goalData);
    } else {
      success = await createGoal(goalData);
    }

    setSaving(false);

    if (success) {
      showToast(isEditing ? "Objectif mis a jour !" : "Objectif enregistre !", "success");
      handleClose();
    } else {
      showToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const handleDelete = async () => {
    if (!activeGoal) return;
    if (!confirm("Supprimer cet objectif ?")) return;
    
    await deleteGoal(activeGoal.id);
    showToast("Objectif supprime", "success");
    handleClose();
  };

  const selectedType = GOAL_TYPES.find(t => t.value === goalType);
  const isVentes = goalType === "products_sold";

  return (
    <AnimatePresence>
      {showObjectifModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "var(--dark-card)",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid var(--diamond-border)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "var(--gradient-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <i className="fas fa-bullseye" style={{ fontSize: "20px", color: "white" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                    {isEditing ? "Modifier l'objectif" : "Definir un objectif"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Fixez-vous un cap a atteindre
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}>
                Type d&apos;objectif
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {GOAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setGoalType(type.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: goalType === type.value 
                        ? `2px solid ${type.color}` 
                        : "1px solid var(--diamond-border)",
                      background: goalType === type.value 
                        ? `${type.color}15` 
                        : "var(--dark-elevated)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${type.color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <i className={type.icon} style={{ fontSize: "16px", color: type.color }}></i>
                    </div>
                    <span style={{ 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      color: goalType === type.value ? type.color : "var(--text-primary)" 
                    }}>
                      {type.label}
                    </span>
                    {goalType === type.value && (
                      <i className="fas fa-check-circle" style={{ marginLeft: "auto", color: type.color }}></i>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "10px",
              }}>
                Objectif a atteindre {!isVentes && `(${deviseActuelle})`}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={isVentes ? "Ex: 50 ventes" : "Ex: 500000"}
                  min="1"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    paddingRight: isVentes ? "70px" : "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--diamond-border)",
                    background: "var(--dark-elevated)",
                    color: "var(--text-primary)",
                    fontSize: "16px",
                    fontWeight: 700,
                    outline: "none",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                />
                {isVentes && (
                  <span style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}>
                    ventes
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}>
                  Date de debut
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 12px",
                    borderRadius: "12px",
                    border: "1px solid var(--diamond-border)",
                    background: "var(--dark-elevated)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "10px",
                }}>
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  style={{
                    width: "100%",
                    padding: "14px 12px",
                    borderRadius: "12px",
                    border: "1px solid var(--diamond-border)",
                    background: "var(--dark-elevated)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: 600,
                    outline: "none",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                />
              </div>
            </div>

            {startDate && endDate && new Date(endDate) > new Date(startDate) && targetValue && (
              <div style={{
                background: `${selectedType?.color}15`,
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                border: `1px solid ${selectedType?.color}30`,
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Objectif quotidien estime
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: selectedType?.color }}>
                  {(() => {
                    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
                    const daily = parseFloat(targetValue) / Math.max(1, days);
                    return isVentes 
                      ? `${daily.toFixed(1)} ventes/jour`
                      : `${Math.round(daily).toLocaleString("fr-FR")} ${deviseActuelle}/jour`;
                  })()}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  sur {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "14px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "var(--gradient-secondary)",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  fontFamily: "var(--font-inter), sans-serif",
                  boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
                }}
              >
                {saving ? (
                  <><i className="fas fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>Enregistrement...</>
                ) : (
                  <><i className="fas fa-check" style={{ marginRight: "8px" }}></i>{isEditing ? "Mettre a jour" : "Enregistrer"}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
