"use client";

import * as React from "react";
import { site } from "@/content/site";
import { ReserveDialog } from "@/components/funnel/reserve-dialog";

type FunnelContextValue = {
  seatsLeft: number;
  takeSeat: () => void;
  openReserve: (source?: string) => void;
};

const FunnelContext = React.createContext<FunnelContextValue | null>(null);

export function FunnelProvider({ children }: { children: React.ReactNode }) {
  const [seatsLeft, setSeatsLeft] = React.useState<number>(site.event.seatsInitial);
  const [open, setOpen] = React.useState(false);
  const [source, setSource] = React.useState<string | undefined>();

  const takeSeat = React.useCallback(() => {
    setSeatsLeft((s) => Math.max(3, s - 1));
  }, []);

  const openReserve = React.useCallback((src?: string) => {
    setSource(src);
    setOpen(true);
  }, []);

  const value = React.useMemo(() => ({ seatsLeft, takeSeat, openReserve }), [seatsLeft, takeSeat, openReserve]);

  return (
    <FunnelContext.Provider value={value}>
      {children}
      <ReserveDialog open={open} onOpenChange={setOpen} source={source} />
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  const ctx = React.useContext(FunnelContext);
  if (!ctx) throw new Error("useFunnel must be used inside <FunnelProvider>");
  return ctx;
}
