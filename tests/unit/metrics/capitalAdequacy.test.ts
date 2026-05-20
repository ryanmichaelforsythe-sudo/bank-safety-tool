/**
 * Tests for categorizeCapital() — core business logic.
 * Properties 1 and 2 from the design spec.
 *
 * Property 1: Returns correct FDIC-defined category for any ratio triple.
 * Property 2: Monotonically non-decreasing (higher ratios never produce worse category).
 */

import { describe, it, expect } from "vitest";
import { categorizeCapital, CAPITAL_THRESHOLDS } from "@/lib/metrics/capitalAdequacy";

describe("categorizeCapital", () => {
  // --- Well Capitalized: all ratios exceed their "well" floors ---

  it("returns well_capitalized when all ratios exceed well thresholds", () => {
    expect(categorizeCapital(10, 12, 7)).toBe("well_capitalized");
  });

  it("returns well_capitalized at exact well threshold boundaries", () => {
    expect(categorizeCapital(8, 10, 5)).toBe("well_capitalized");
  });

  it("returns well_capitalized with very high ratios", () => {
    expect(categorizeCapital(20, 25, 15)).toBe("well_capitalized");
  });

  // --- Adequately Capitalized: meets adequate floors but not all well floors ---

  it("returns adequately_capitalized when tier1 is below well but above adequate", () => {
    expect(categorizeCapital(7, 10, 5)).toBe("adequately_capitalized");
  });

  it("returns adequately_capitalized when total is below well but above adequate", () => {
    expect(categorizeCapital(8, 9, 5)).toBe("adequately_capitalized");
  });

  it("returns adequately_capitalized when leverage is below well but above adequate", () => {
    expect(categorizeCapital(8, 10, 4.5)).toBe("adequately_capitalized");
  });

  it("returns adequately_capitalized at exact adequate boundaries", () => {
    expect(categorizeCapital(6, 8, 4)).toBe("adequately_capitalized");
  });

  // --- Undercapitalized: meets under floors but not adequate floors ---

  it("returns undercapitalized when tier1 is below adequate but above under", () => {
    expect(categorizeCapital(5, 8, 4)).toBe("undercapitalized");
  });

  it("returns undercapitalized when total is below adequate but above under", () => {
    expect(categorizeCapital(6, 7, 4)).toBe("undercapitalized");
  });

  it("returns undercapitalized when leverage is below adequate but above under", () => {
    expect(categorizeCapital(6, 8, 3.5)).toBe("undercapitalized");
  });

  it("returns undercapitalized at exact under boundaries", () => {
    expect(categorizeCapital(4, 6, 3)).toBe("undercapitalized");
  });

  // --- Significantly Undercapitalized: below under floors but above critical ---

  it("returns significantly_undercapitalized when tier1 is below under floor", () => {
    expect(categorizeCapital(3, 6, 3)).toBe("significantly_undercapitalized");
  });

  it("returns significantly_undercapitalized when total is below under floor", () => {
    expect(categorizeCapital(4, 5, 3)).toBe("significantly_undercapitalized");
  });

  it("returns significantly_undercapitalized when leverage is below under but above critical", () => {
    expect(categorizeCapital(4, 6, 2.5)).toBe("significantly_undercapitalized");
  });

  // --- Critically Undercapitalized: leverage ≤ 2% ---

  it("returns critically_undercapitalized when leverage is at 2%", () => {
    expect(categorizeCapital(8, 10, 2)).toBe("critically_undercapitalized");
  });

  it("returns critically_undercapitalized when leverage is below 2%", () => {
    expect(categorizeCapital(8, 10, 1.5)).toBe("critically_undercapitalized");
  });

  it("returns critically_undercapitalized when leverage is 0%", () => {
    expect(categorizeCapital(10, 12, 0)).toBe("critically_undercapitalized");
  });

  // --- Property 2: Monotonicity ---
  // Higher ratios should never produce a worse category

  it("monotonicity: increasing all ratios never worsens the category", () => {
    const categories = [
      "critically_undercapitalized",
      "significantly_undercapitalized",
      "undercapitalized",
      "adequately_capitalized",
      "well_capitalized",
    ];
    const rank = (cat: string) => categories.indexOf(cat);

    // Walk from low to high ratios — category should never decrease
    const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
    let prevRank = -1;
    for (const r of steps) {
      const cat = categorizeCapital(r, r + 2, r - 1 > 0 ? r - 1 : 0.5);
      const currentRank = rank(cat);
      expect(currentRank).toBeGreaterThanOrEqual(prevRank);
      prevRank = currentRank;
    }
  });

  // --- Threshold constants are correct ---

  it("exports CAPITAL_THRESHOLDS matching FDIC 12 CFR Part 325", () => {
    expect(CAPITAL_THRESHOLDS.tier1RiskBased).toEqual({ well: 8, adequate: 6, under: 4 });
    expect(CAPITAL_THRESHOLDS.totalRiskBased).toEqual({ well: 10, adequate: 8, under: 6 });
    expect(CAPITAL_THRESHOLDS.leverage).toEqual({ well: 5, adequate: 4, under: 3 });
    expect(CAPITAL_THRESHOLDS.criticallyUnder).toBe(2);
  });
});
