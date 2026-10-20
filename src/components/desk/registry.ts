import type { ComponentType } from "react";

/** One loader per rebuilt industry so each page only ships its own desk. */
export const deskLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  textile: () => import("./industries/textile"),
  "print-shop": () => import("./industries/print-shop"),
  "industrial-supply": () => import("./industries/industrial-supply"),
  "interiors": () => import("./industries/interiors"),
  "fleet": () => import("./industries/fleet"),
  "tours": () => import("./industries/tours"),
  "courier": () => import("./industries/courier"),
  "jewellery": () => import("./industries/jewellery"),
  "d2c": () => import("./industries/d2c"),
  "advisory": () => import("./industries/advisory"),
  "spice-export": () => import("./industries/spice-export"),
  "electronics-retail": () => import("./industries/electronics-retail"),
  "learning-kits": () => import("./industries/learning-kits"),
  "realty": () => import("./industries/realty"),
  "design-studio": () => import("./industries/design-studio"),
  "auto-parts": () => import("./industries/auto-parts"),
  "dairy-fpo": () => import("./industries/dairy-fpo"),
  "agency": () => import("./industries/agency"),
  "job-shop": () => import("./industries/job-shop"),
  "dental": () => import("./industries/dental"),
  "lab-supply": () => import("./industries/lab-supply"),
  "fmcg-route": () => import("./industries/fmcg-route"),
  "stone-yard": () => import("./industries/stone-yard"),
  "solar-epc": () => import("./industries/solar-epc"),
  "restaurant": () => import("./industries/restaurant"),
  "pharma-distribution": () => import("./industries/pharma-distribution"),
  // @desks-end (add one line above this marker per industry)
};
