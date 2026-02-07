import React from "react";
import { IconBrain, IconZap, IconRefresh } from "./icons";

export default function ActiveModelBadge({ selectedModelKey, hasCustomModel, customModelDetails, onToggle }) {
  const isCustom = Boolean(selectedModelKey);
  const canSwitch = isCustom || hasCustomModel;

  // Funzione helper per formattare la data e l'algoritmo
  const getDisplayText = () => {
    if (!isCustom) return "Producer Default";
    
    if (customModelDetails) {
        const algo = (customModelDetails.algo || "Custom").toUpperCase();
        
        let dateStr = "";
        if (customModelDetails.date) {
            try {
                const d = new Date(customModelDetails.date);
                dateStr = d.toLocaleString("it-IT", { 
                    day: "2-digit", 
                    month: "2-digit", 
                    hour: "2-digit", 
                    minute: "2-digit" 
                });
            } catch (e) {
                dateStr = "";
            }
        }
        
        return `${algo} • ${dateStr}`;
    }
    
    return "Modello Utente"; 
  };

  return (
    <div 
      className={`model-badge ${isCustom ? "custom" : "default"} ${canSwitch ? "clickable" : ""}`}
      onClick={canSwitch ? onToggle : undefined}
      title={canSwitch ? (isCustom ? "Clicca per tornare al Default" : "Clicca per usare il tuo Modello Custom") : "Nessun modello custom disponibile"}
    >
      
      {/* Icona Principale */}
      <div className="badge-main-icon">
        {isCustom ? <IconZap width={28} height={28} /> : <IconBrain width={28} height={28} />}
      </div>

      {/* Testo Informativo */}
      <div className="badge-info">
        <span className="badge-label">
          {isCustom ? "MODELLO UTENTE ATTIVO" : "MODELLO DEFAULT ATTIVO"}
        </span>
        <span className="badge-value" style={{ fontSize: isCustom ? "0.85rem" : "0.95rem" }}>
          {getDisplayText()}
        </span>
      </div>

      {/* Bottone Azione (Switch) */}
      {canSwitch && (
        <div className="badge-action-icon">
           <IconRefresh />
        </div>
      )}
    </div>
  );
}