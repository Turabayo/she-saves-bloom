import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LanguageSelector = ({ open, onOpenChange }: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const languages = [
    { code: 'en' as const, name: t('english'), flag: '🇺🇸' },
    { code: 'fr' as const, name: t('french'), flag: '🇫🇷' },
  ];

  const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
    setLanguage(newLanguage);
    toast({
      title: t('languageChanged'),
      description: `Language changed to ${newLanguage === 'en' ? 'English' : 'Français'}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>{t('selectLanguage')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="mr-2">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {language === lang.code && <Check size={16} />}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};