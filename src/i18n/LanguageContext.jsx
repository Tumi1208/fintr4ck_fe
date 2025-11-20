import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext({
  lang: "vi",
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "fintr4ck_lang";

function getNested(obj, path) {
  return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("vi");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "vi" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo(() => {
    const t = (key) => {
      const found = getNested(translations[lang], key);
      if (found !== undefined) return found;
      const fallback = getNested(translations.vi, key);
      return fallback !== undefined ? fallback : key;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
