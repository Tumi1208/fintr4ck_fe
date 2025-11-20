import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLanguage();
  const toggle = () => setLang(lang === "vi" ? "en" : "vi");

  return (
    <button
      onClick={toggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "6px 10px" : "8px 12px",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.25)",
        background: "rgba(226,232,240,0.08)",
        color: "var(--text-strong)",
        cursor: "pointer",
        fontSize: 12,
        letterSpacing: 0.3,
      }}
      aria-label="toggle language"
    >
      🌐 {lang === "vi" ? "VI / EN" : "EN / VI"}
    </button>
  );
}
