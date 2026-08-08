import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/mobile/Screen";
import { SoftCard } from "@/components/mobile/Card";
import { useAppState } from "@/lib/app-state";
import { useInsights } from "@/lib/queries/use-insights";
import { useParents } from "@/lib/queries/use-parents";
import { useRecommendations } from "@/lib/queries/use-recommendations";
import { useWeeklyChart } from "@/lib/queries/use-weekly-chart";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/family/insights")({
  head: () => ({ meta: [{ title: "AI insights — myFamily" }] }),
  component: Insights,
});

const toneClass: Record<string, string> = {
  green: "text-success",
  amber: "text-warning",
  red: "text-destructive",
};

function Insights() {
  const { parentId, familyId } = useAppState();
  // A family member has no parentId of their own, so fall back to the first parent
  // in the family — insights are always about a specific parent's data.
  const { data: parents } = useParents(familyId);
  const focusParentId = parentId || parents?.[0]?.id || "";
  const { data: insights } = useInsights(focusParentId);
  const { data: recommendations } = useRecommendations(familyId);
  const { data: weeklyChart } = useWeeklyChart(focusParentId);

  if (parents && parents.length === 0) {
    return (
      <Screen title="AI Insights" subtitle="Trends, patterns, gentle nudges.">
        <SoftCard className="text-center py-10 space-y-3">
          <div className="text-lg font-semibold">No insights yet</div>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Link a parent to start seeing trends in their medicine, activity, and wellbeing here.
          </p>
        </SoftCard>
      </Screen>
    );
  }

  if (!insights || !recommendations || !weeklyChart) return null;

  return (
    <Screen title="AI Insights" subtitle="Trends, patterns, gentle nudges.">
      <SoftCard className="mb-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Weekly adherence</div>
        <div className="h-28 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChart}>
              <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Bar dataKey="adh" fill="var(--primary)" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SoftCard>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {insights.map((i) => (
          <SoftCard key={i.key} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{i.label}</div>
            <div className={`text-2xl font-bold mt-1 ${toneClass[i.tone] ?? ""}`}>{i.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{i.trend}</div>
          </SoftCard>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2 px-1">Recommendations</h2>
      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <SoftCard key={i} tone="purple">
            <div className="flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{r}</p>
            </div>
          </SoftCard>
        ))}
      </div>
    </Screen>
  );
}
