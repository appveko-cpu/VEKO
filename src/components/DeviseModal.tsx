"use client";
import { useState, useEffect, useRef } from "react";
import { useDevise } from "@/context/DeviseContext";

const DEVISES = [
  { code: "FCFA", label: "FCFA – Franc CFA (Afrique de l'Ouest)" },
  { code: "XAF", label: "XAF – Franc CFA (Afrique Centrale)" },
  { code: "XOF", label: "XOF – Franc CFA UEMOA" },
  { code: "EUR", label: "EUR – Euro" },
  { code: "USD", label: "USD – Dollar américain" },
  { code: "GBP", label: "GBP – Livre sterling" },
  { code: "CAD", label: "CAD – Dollar canadien" },
  { code: "AUD", label: "AUD – Dollar australien" },
  { code: "NZD", label: "NZD – Dollar néo-zélandais" },
  { code: "CHF", label: "CHF – Franc suisse" },
  { code: "SEK", label: "SEK – Couronne suédoise" },
  { code: "NOK", label: "NOK – Couronne norvégienne" },
  { code: "DKK", label: "DKK – Couronne danoise" },
  { code: "PLN", label: "PLN – Zloty polonais" },
  { code: "CZK", label: "CZK – Couronne tchèque" },
  { code: "HUF", label: "HUF – Forint hongrois" },
  { code: "RON", label: "RON – Leu roumain" },
  { code: "MAD", label: "MAD – Dirham marocain" },
  { code: "DZD", label: "DZD – Dinar algérien" },
  { code: "TND", label: "TND – Dinar tunisien" },
  { code: "LYD", label: "LYD – Dinar libyen" },
  { code: "EGP", label: "EGP – Livre égyptienne" },
  { code: "NGN", label: "NGN – Naira nigérian" },
  { code: "GHS", label: "GHS – Cedi ghanéen" },
  { code: "KES", label: "KES – Shilling kényan" },
  { code: "UGX", label: "UGX – Shilling ougandais" },
  { code: "TZS", label: "TZS – Shilling tanzanien" },
  { code: "ETB", label: "ETB – Birr éthiopien" },
  { code: "ZAR", label: "ZAR – Rand sud-africain" },
  { code: "ZMW", label: "ZMW – Kwacha zambien" },
  { code: "MZN", label: "MZN – Metical mozambicain" },
  { code: "RWF", label: "RWF – Franc rwandais" },
  { code: "BIF", label: "BIF – Franc burundais" },
  { code: "CDF", label: "CDF – Franc congolais" },
  { code: "MGA", label: "MGA – Ariary malgache" },
  { code: "MUR", label: "MUR – Roupie mauricienne" },
  { code: "SCR", label: "SCR – Roupie seychelloise" },
  { code: "CVE", label: "CVE – Escudo cap-verdien" },
  { code: "STN", label: "STN – Dobra santoméen" },
  { code: "GMD", label: "GMD – Dalasi gambien" },
  { code: "GNF", label: "GNF – Franc guinéen" },
  { code: "SLL", label: "SLL – Leone sierra-léonais" },
  { code: "LRD", label: "LRD – Dollar libérien" },
  { code: "AED", label: "AED – Dirham émirati" },
  { code: "SAR", label: "SAR – Riyal saoudien" },
  { code: "QAR", label: "QAR – Riyal qatarien" },
  { code: "KWD", label: "KWD – Dinar koweïtien" },
  { code: "BHD", label: "BHD – Dinar bahreïni" },
  { code: "OMR", label: "OMR – Rial omanais" },
  { code: "JOD", label: "JOD – Dinar jordanien" },
  { code: "ILS", label: "ILS – Shekel israélien" },
  { code: "TRY", label: "TRY – Livre turque" },
  { code: "IRR", label: "IRR – Rial iranien" },
  { code: "PKR", label: "PKR – Roupie pakistanaise" },
  { code: "INR", label: "INR – Roupie indienne" },
  { code: "BDT", label: "BDT – Taka bangladais" },
  { code: "LKR", label: "LKR – Roupie srilankaise" },
  { code: "NPR", label: "NPR – Roupie népalaise" },
  { code: "CNY", label: "CNY – Yuan chinois" },
  { code: "JPY", label: "JPY – Yen japonais" },
  { code: "KRW", label: "KRW – Won sud-coréen" },
  { code: "HKD", label: "HKD – Dollar de Hong Kong" },
  { code: "TWD", label: "TWD – Dollar taïwanais" },
  { code: "SGD", label: "SGD – Dollar singapourien" },
  { code: "MYR", label: "MYR – Ringgit malaisien" },
  { code: "THB", label: "THB – Baht thaïlandais" },
  { code: "IDR", label: "IDR – Roupie indonésienne" },
  { code: "PHP", label: "PHP – Peso philippin" },
  { code: "VND", label: "VND – Dong vietnamien" },
  { code: "KHR", label: "KHR – Riel cambodgien" },
  { code: "MMK", label: "MMK – Kyat birman" },
  { code: "BRL", label: "BRL – Réal brésilien" },
  { code: "MXN", label: "MXN – Peso mexicain" },
  { code: "ARS", label: "ARS – Peso argentin" },
  { code: "CLP", label: "CLP – Peso chilien" },
  { code: "COP", label: "COP – Peso colombien" },
  { code: "PEN", label: "PEN – Sol péruvien" },
  { code: "UYU", label: "UYU – Peso uruguayen" },
  { code: "BOB", label: "BOB – Boliviano" },
  { code: "PYG", label: "PYG – Guaraní paraguayen" },
  { code: "RUB", label: "RUB – Rouble russe" },
  { code: "UAH", label: "UAH – Hryvnia ukrainienne" },
  { code: "KZT", label: "KZT – Tenge kazakh" },
  { code: "UZS", label: "UZS – Sum ouzbek" },
  { code: "GEL", label: "GEL – Lari géorgien" },
  { code: "AMD", label: "AMD – Dram arménien" },
  { code: "AZN", label: "AZN – Manat azerbaïdjanais" },
];

interface DeviseModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DeviseModal({ open, onClose }: DeviseModalProps) {
  const { deviseActuelle, setDevise } = useDevise();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(deviseActuelle);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSelected(deviseActuelle);
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, deviseActuelle]);

  if (!open) return null;

  const filtered = search.trim() === ""
    ? DEVISES
    : DEVISES.filter((d) =>
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        d.label.toLowerCase().includes(search.toLowerCase())
      );

  const handleSelect = (code: string) => {
    setSelected(code);
  };

  const handleConfirm = () => {
    setDevise(selected);
    onClose();
  };

  const selectedDevise = DEVISES.find((d) => d.code === selected);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--dark-card)",
          border: "1px solid var(--diamond-border)",
          borderRadius: "20px",
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "26px", marginBottom: "6px" }}>
            <i className="fas fa-coins" style={{ color: "#f59e0b" }}></i>
          </div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--text-primary, #fff)", letterSpacing: "1px" }}>
            Choisir la devise
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted, #888)", marginTop: "3px" }}>
            Tapez pour rechercher dans la liste
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "8px" }}>
          <i
            className="fas fa-search"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted, #888)",
              fontSize: "13px",
              pointerEvents: "none",
            }}
          ></i>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher : XAF, FCFA, Euro, Dollar..."
            style={{
              width: "100%",
              padding: "11px 14px 11px 38px",
              background: "var(--input-bg)",
              border: "1px solid var(--diamond-border)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted, #888)",
                cursor: "pointer",
                fontSize: "14px",
                padding: 0,
                lineHeight: 1,
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            borderRadius: "12px",
            border: "1px solid var(--diamond-border)",
            marginBottom: "16px",
            background: "var(--dark-card)",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted, #888)", fontSize: "13px" }}>
              <i className="fas fa-search" style={{ marginRight: "6px", opacity: 0.5 }}></i>
              Aucune devise trouvée
            </div>
          ) : (
            filtered.map((d) => {
              const isSelected = d.code === selected;
              return (
                <div
                  key={d.code}
                  onClick={() => handleSelect(d.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: isSelected
                      ? "rgba(102, 126, 234, 0.18)"
                      : "transparent",
                    borderLeft: isSelected ? "3px solid #667eea" : "3px solid transparent",
                    borderBottom: "1px solid var(--diamond-border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--dark-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: isSelected ? "#a78bfa" : "var(--text-primary)" }}>
                      {d.code}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted, #888)", marginLeft: "8px" }}>
                      {d.label.split("–")[1]?.trim()}
                    </span>
                  </div>
                  {isSelected && (
                    <i className="fas fa-check" style={{ color: "#667eea", fontSize: "12px" }}></i>
                  )}
                </div>
              );
            })
          )}
        </div>

        {selectedDevise && (
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(102, 126, 234, 0.1)",
              borderRadius: "10px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <i className="fas fa-check-circle" style={{ color: "#667eea", fontSize: "13px" }}></i>
            <span style={{ fontSize: "12px", color: "var(--text-secondary, #ccc)", fontWeight: 600 }}>
              Sélectionné : <span style={{ color: "#a78bfa" }}>{selectedDevise.label}</span>
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid var(--diamond-border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "var(--gradient-primary, linear-gradient(135deg, #667eea, #764ba2))",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}
          >
            <i className="fas fa-check" style={{ marginRight: "6px" }}></i>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
