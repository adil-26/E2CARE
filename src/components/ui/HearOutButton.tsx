import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface HearOutButtonProps {
    text: string;
    className?: string;
    variant?: "ghost" | "outline" | "secondary" | "default";
    size?: "icon" | "sm" | "default";
}

export function HearOutButton({ text, className, variant = "ghost", size = "icon" }: HearOutButtonProps) {
    const { language } = useLanguage();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        if (!window.speechSynthesis) {
            setIsSupported(false);
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = () => {
        if (!isSupported) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Attempt to find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        let voice;

        if (language === "hi") {
            voice = voices.find(v => v.lang.includes("hi-IN"));
        } else {
            voice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
        }

        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    if (!isSupported) return null;

    return (
        <Button
            variant={variant}
            size={size}
            onClick={speak}
            className={cn(
                "transition-all duration-200",
                isSpeaking && "text-primary animate-pulse",
                className
            )}
            title={language === "hi" ? "सुनें" : "Hear out"}
        >
            {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
            ) : (
                <Volume2 className="h-4 w-4" />
            )}
        </Button>
    );
}
