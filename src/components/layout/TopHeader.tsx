import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TopHeader() {
  const { photoUrl, fullName, initials } = useProfilePhoto();
  const { t } = useLanguage();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.goodMorning;
    if (hour < 17) return t.dashboard.goodAfternoon;
    return t.dashboard.goodEvening;
  };

  const firstName = fullName?.split(" ")[0] || t.dashboard.there;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="lg:hidden" />
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs text-muted-foreground">{t.dashboard.howAreYouFeeling}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`${t.common.search}...`}
              className="w-64 pl-10 bg-muted/50 border-none"
            />
          </div>
        </div>
        <NotificationBell />
        <Avatar className="h-9 w-9 rounded-full lg:hidden">
          <AvatarImage src={photoUrl || undefined} className="rounded-full object-cover" />
          <AvatarFallback className="rounded-full bg-primary/10 text-sm font-medium text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
