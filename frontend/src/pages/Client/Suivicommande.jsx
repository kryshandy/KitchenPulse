// ─────────────────────────────────────────────────────
//  KitchenPulse — pages/client/SuiviCommande.jsx
//  Branche : feat/client-ui
//
//  Props :
//    orderId {number}   ID de la commande à suivre (mock : 1042)
//    setPage {Function} navigation
//
//  TODO (après merge feat/setup-auth) :
//    - Remplacer le polling mock par :
//        useEffect(() => {
//          const id = setInterval(() =>
//            api.get(`/api/orders/${orderId}`).then(r => setStatut(r.data.statut)), 3000);
//          return () => clearInterval(id);
//        }, [orderId]);
//    - Phase 5 (feat/socket) : remplacer le polling par useSocket
// ─────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { G, Card, Btn, LiveDot } from "../../theme.jsx";;

// Progression linéaire des statuts
const STEPS = [
  {
    statut: "RECUE",
    label: "Commande reçue",
    icon: "📋",
    desc: "Votre commande a bien été enregistrée",
  },
  {
    statut: "EN_PREPARATION",
    label: "En préparation",
    icon: "👨‍🍳",
    desc: "Les cuisiniers préparent vos plats avec soin",
  },
  {
    statut: "PRETE",
    label: "Prête !",
    icon: "✅",
    desc: "Votre commande est prête et attend le serveur",
  },
  {
    statut: "SERVIE",
    label: "En cours de livraison",
    icon: "🛎️",
    desc: "Le serveur apporte votre commande à la table",
  },
];

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.statut, i]));

// Temps estimé par étape (en minutes, mock)
const ETA = { RECUE: 15, EN_PREPARATION: 10, PRETE: 3, SERVIE: 1 };

export default function SuiviCommande({ orderId = 1042, setPage }) {
  // Mock : simule l'avancement automatique (supprimé quand l'API est prête)
  const [statutKey, setStatutKey] = useState("RECUE");
  const stepIdx = STEP_INDEX[statutKey] ?? 0;

  // Simulation du polling (remplacer par vrai polling sur l'API)
  useEffect(() => {
    const ORDER = ["RECUE", "EN_PREPARATION", "PRETE", "SERVIE"];
    if (statutKey === "SERVIE") return;
    const t = setTimeout(() => {
      const next = ORDER[ORDER.indexOf(statutKey) + 1];
      if (next) setStatutKey(next);
    }, 6000); // avance toutes les 6 s en démo
    return () => clearTimeout(t);
  }, [statutKey]);

  const isFinished = statutKey === "SERVIE";
  const etaMinutes = ETA[statutKey] ?? 0;

  return (
    <div className="fadeUp" style={{ padding: "16px 16px 100px" }}>
      {/* En-tête */}
      <h1
        style={{ fontFamily: G.fontDisplay, fontSize: 26, fontWeight: 800, marginBottom: 4 }}
      >
        Suivi Commande
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ color: G.muted, fontSize: 13 }}>Commande</span>
        <span style={{ color: G.accent, fontWeight: 700, fontSize: 14 }}>#{orderId}</span>
        <LiveDot />
      </div>

      {/* Barre de progression */}
      <div
        style={{
          height: 4, background: G.border, borderRadius: 2,
          marginBottom: 24, overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((stepIdx + 1) / STEPS.length) * 100}%`,
            background: isFinished
              ? G.green
              : `linear-gradient(90deg, ${G.accent}, ${G.accent2})`,
            borderRadius: 2,
            transition: "width 1s ease",
          }}
        />
      </div>

      {/* ETA */}
      {!isFinished && (
        <Card
          style={{
            marginBottom: 16, padding: "12px 16px",
            background: `${G.accent}10`, border: `1px solid ${G.accent}30`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: G.muted }}>Temps estimé restant</span>
          <span style={{ fontWeight: 700, color: G.accent, fontSize: 16 }}>
            ~{etaMinutes} min
          </span>
        </Card>
      )}

      {/* Timeline */}
      <Card style={{ marginBottom: 16 }}>
        {STEPS.map((step, i) => {
          const isDone    = i < stepIdx;
          const isCurrent = i === stepIdx;
          const isPending = i > stepIdx;

          return (
            <div
              key={step.statut}
              style={{
                display: "flex",
                gap: 14,
                paddingBottom: i < STEPS.length - 1 ? 22 : 0,
                position: "relative",
              }}
            >
              {/* Trait vertical */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 17, top: 36, bottom: 0, width: 2,
                    background: isDone ? G.accent : G.border,
                    transition: "background .6s",
                  }}
                />
              )}

              {/* Cercle */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  flexShrink: 0,
                  background: isDone || isCurrent ? `${G.accent}25` : G.card,
                  border: `2px solid ${isDone || isCurrent ? G.accent : G.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  transition: "all .4s",
                  animation: isCurrent ? "pulse 2s infinite" : "none",
                }}
              >
                {isDone ? "✓" : isPending ? "○" : step.icon}
              </div>

              {/* Texte */}
              <div style={{ paddingTop: 6 }}>
                <div
                  style={{
                    fontWeight: isCurrent ? 700 : 500,
                    fontSize: 14,
                    color: isPending ? G.muted : G.text,
                  }}
                >
                  {step.label}
                </div>
                {(isDone || isCurrent) && (
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                    {step.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Commande livrée */}
      {isFinished && (
        <Card
          className="fadeUp"
          style={{
            background: `${G.green}10`,
            border: `1px solid ${G.green}30`,
            textAlign: "center",
            padding: 28,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3
            style={{
              fontFamily: G.fontDisplay,
              fontSize: 22,
              marginBottom: 8,
              color: G.green,
            }}
          >
            Bon appétit !
          </h3>
          <p style={{ color: G.muted, fontSize: 13, marginBottom: 20 }}>
            Votre commande a été livrée. Merci de votre visite.
          </p>
          <Btn
            onClick={() => setPage("paiement")}
            variant="success"
            style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}
          >
            💳 Procéder au paiement
          </Btn>
          <Btn
            onClick={() => setPage("avis")}
            variant="ghost"
            style={{ width: "100%", justifyContent: "center" }}
          >
            ⭐ Laisser un avis
          </Btn>
        </Card>
      )}

      {/* Détails commande */}
      <Card style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 11, color: G.muted, marginBottom: 12,
            fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6,
          }}
        >
          Détails
        </p>
        {[
          ["Commande",  `#${orderId}`],
          ["Table",     "4"],
          ["Articles",  "Ndolé Royal, Jus de Gingembre"],
          ["Total",     "5 565 FCFA"],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 13, padding: "7px 0",
              borderBottom: `1px solid ${G.border}`,
            }}
          >
            <span style={{ color: G.muted }}>{k}</span>
            <span style={{ fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* Démo : avancer manuellement */}
      {!isFinished && (
        <div style={{ marginTop: 16, opacity: 0.5 }}>
          <p style={{ fontSize: 11, color: G.muted, textAlign: "center", marginBottom: 8 }}>
            ↓ Démo — avancer manuellement ↓
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STEPS.map((s, i) => (
              <Btn
                key={s.statut}
                variant={statutKey === s.statut ? "primary" : "ghost"}
                onClick={() => setStatutKey(s.statut)}
                style={{ fontSize: 11, padding: "7px 12px" }}
              >
                {i + 1}. {s.label}
              </Btn>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}