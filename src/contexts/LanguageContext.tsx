import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "../i18n/en";
import { hi } from "../i18n/hi";

type Language = "en" | "hi";
type Translations = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    t: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        return (localStorage.getItem("e2care_language") as Language) || "en";
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("e2care_language", lang);
    };

    const t = language === "hi" ? hi : en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
