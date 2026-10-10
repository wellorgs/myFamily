import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CaretUpDown, CheckCircle, Plus } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { useParents } from "@/lib/queries/use-parents";
import { useSelectedParent } from "@/lib/selected-parent";
import { NotificationBell } from "@/components/mobile/NotificationBell";

export type SwitchParent = { id: string; name: string; status: string; lastSeen: string; age?: number | string; device?: string };

const initial = (name: string) => name.trim()[0]?.toUpperCase() ?? "?";
const firstName = (name: string) => name.split(" ")[0];

/** Top bar for every family screen: parent switcher on the left, actions on the right. */
export function FamilyTopBar({ right, everyone = false }: { right?: React.ReactNode; everyone?: boolean }) {
  const { familyId } = useAppState();
  const { data: parents } = useParents(familyId);
  const { selected, select } = useSelectedParent(parents as SwitchParent[] | undefined);
  const [open, setOpen] = useState(false);
  const list = (parents ?? []) as SwitchParent[];
  const label = everyone ? "Everyone" : selected ? firstName(selected.name) : "Add parent";

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-3">
        <button
          onClick={() => setOpen(true)}
          className="glass flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-full text-[15px] font-semibold active:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          aria-label="Switch parent"
        >
          <span className="w-8 h-8 rounded-full bg-primary/12 grid place-items-center text-[13px] font-bold text-primary">
            {everyone ? "All" : selected ? initial(selected.name) : "+"}
          </span>
          {label}
          <CaretUpDown size={16} weight="light" className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">{right ?? <NotificationBell />}</div>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-[430px] mx-auto rounded-t-[34px] bg-background px-6 pb-8 pt-4">
          <DrawerTitle className="text-[22px] font-bold">Whose day?</DrawerTitle>
          <DrawerDescription className="sr-only">Choose which parent to show</DrawerDescription>
          <ul className="card-bz !mx-0 rounded-3xl p-4 mt-3 divide-y divide-border">
            {list.map((p) => {
              const ok = p.status === "safe";
              const on = selected?.id === p.id;
              return (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <button
                    onClick={() => { select(p.id); setOpen(false); }}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <span className={cn("w-10 h-10 rounded-full grid place-items-center text-sm font-bold", ok ? "bg-primary/12 text-primary" : "bg-warning/25 text-foreground")}>
                      {initial(p.name)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15.5px] font-semibold truncate">{firstName(p.name)}{p.age ? ` · ${p.age}` : ""}</span>
                      <span className="block text-[12.5px] text-muted-foreground truncate">{ok ? "Safe" : "Needs attention"} · {p.lastSeen}</span>
                    </span>
                    {on ? <CheckCircle size={22} weight="fill" className="text-primary" /> : !ok && <span className="text-[11.5px] font-semibold rounded-full bg-warning/25 px-2.5 py-1">Needs you</span>}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="text-sm text-muted-foreground py-2">No parents linked yet.</li>}
          </ul>
          <Link
            to="/onboarding/family"
            onClick={() => setOpen(false)}
            className="mt-4 h-[54px] rounded-full bg-secondary text-secondary-foreground font-semibold flex items-center justify-between pl-6 pr-1.5"
          >
            Add a parent
            <span className="w-[42px] h-[42px] rounded-full bg-white/60 grid place-items-center"><Plus size={20} weight="light" /></span>
          </Link>
        </DrawerContent>
      </Drawer>
    </>
  );
}
