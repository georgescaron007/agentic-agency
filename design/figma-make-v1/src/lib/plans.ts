import type { PlanKey } from "@/contrat-donnees"

export const planDetails: Record<
  PlanKey,
  {
    monthlyPriceEur: number
    maxUsers: number
    creditsIncluded: number
  }
> = {
  small_team: {
    monthlyPriceEur: 149,
    maxUsers: 10,
    creditsIncluded: 15_000_000,
  },
  business: {
    monthlyPriceEur: 349,
    maxUsers: 25,
    creditsIncluded: 40_000_000,
  },
}
