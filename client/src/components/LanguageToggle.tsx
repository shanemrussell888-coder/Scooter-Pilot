import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapStore, LANGUAGES } from "@/lib/mapStore";

export function LanguageToggle() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { language, setLanguage } = useMapStore();
  
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="secondary"
        className="h-8 px-2 gap-1 text-xs font-medium bg-card/90 backdrop-blur-sm shadow-lg"
        onClick={() => setShowDropdown(!showDropdown)}
        data-testid="button-language-toggle"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.flag}</span>
      </Button>
      
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border rounded-md shadow-lg min-w-[120px] py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover-elevate ${
                  language === lang.code ? "bg-muted font-medium" : ""
                }`}
                onClick={() => {
                  setLanguage(lang.code);
                  setShowDropdown(false);
                }}
                data-testid={`lang-option-${lang.code}`}
              >
                <span className="text-xs font-mono w-5">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
