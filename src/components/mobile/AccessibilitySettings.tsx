import { Switch } from "@/components/ui/switch";
import { SoftCard } from "@/components/mobile/Card";
import { Type, Moon, Contrast, Accessibility, Languages, Sparkles } from "lucide-react";
import {
  cycleFontScale,
  FONT_SCALE_LABELS,
  setState,
  useAppState,
} from "@/lib/app-state";
import { LANGUAGES, useT, type Lang } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AccessibilitySettings() {
  const { fontScale, dark, highContrast, reducedMotion, lang } = useAppState();
  const t = useT();

  return (
    <SoftCard className="p-1">
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <Accessibility className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {t("l.accessibility")}
        </div>
      </div>
      <ul className="divide-y" role="list">
        <li className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center" aria-hidden="true">
            <Languages className="w-5 h-5" />
          </div>
          <label htmlFor="lang-select" className="flex-1">
            <div className="font-medium">{t("l.language")}</div>
            <div className="text-xs text-muted-foreground">
              {LANGUAGES.find((l) => l.code === lang)?.native}
            </div>
          </label>
          <Select value={lang} onValueChange={(v) => setState({ lang: v as Lang })}>
            <SelectTrigger id="lang-select" className="w-[140px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  <span className="flex items-center gap-2">
                    <span>{l.native}</span>
                    <span className="text-xs text-muted-foreground">{l.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </li>

        <li>
          <button
            type="button"
            onClick={() => setState({ fontScale: cycleFontScale(fontScale) })}
            aria-label={`Text size, currently ${FONT_SCALE_LABELS[fontScale]}. Tap to change.`}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-2xl hover:bg-muted focus-visible:bg-muted"
          >
            <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center" aria-hidden="true">
              <Type className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{t("l.textSize")}</div>
              <div className="text-xs text-muted-foreground">Cycle through readable sizes</div>
            </div>
            <span className="text-sm font-semibold text-primary" aria-hidden="true">
              {FONT_SCALE_LABELS[fontScale]}
            </span>
          </button>
        </li>

        <li className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center" aria-hidden="true">
            <Moon className="w-5 h-5" />
          </div>
          <label htmlFor="dark-toggle" className="flex-1">
            <div className="font-medium">{t("l.darkMode")}</div>
            <div className="text-xs text-muted-foreground">Easier on the eyes at night</div>
          </label>
          <Switch
            id="dark-toggle"
            checked={dark}
            onCheckedChange={(v) => setState({ dark: v })}
            aria-label="Toggle dark mode"
          />
        </li>

        <li className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center" aria-hidden="true">
            <Contrast className="w-5 h-5" />
          </div>
          <label htmlFor="contrast-toggle" className="flex-1">
            <div className="font-medium">{t("l.highContrast")}</div>
            <div className="text-xs text-muted-foreground">Stronger colors and borders</div>
          </label>
          <Switch
            id="contrast-toggle"
            checked={highContrast}
            onCheckedChange={(v) => setState({ highContrast: v })}
            aria-label="Toggle high contrast mode"
          />
        </li>

        <li className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center" aria-hidden="true">
            <Sparkles className="w-5 h-5" />
          </div>
          <label htmlFor="motion-toggle" className="flex-1">
            <div className="font-medium">Reduce motion</div>
            <div className="text-xs text-muted-foreground">Turn off non-essential animations</div>
          </label>
          <Switch
            id="motion-toggle"
            checked={reducedMotion}
            onCheckedChange={(v) => setState({ reducedMotion: v })}
            aria-label="Toggle reduced motion"
          />
        </li>
      </ul>
    </SoftCard>
  );
}
