// src/middleware/requireEntitlement.ts
import crypto from "crypto";
import { hasActivePass } from "../services/entitlements";
import { spendCreditsAtomic } from "../services/credits";

type Feature = "resume" | "regen";

export function requireEntitlement(opts: {
  feature: Feature;
  creditCost: number;
  opKeyFromReq: (req: any) => string;
  preferPassFirst?: boolean;          // default true
  debugLogs?: boolean;                // optional
}) {
  const preferPassFirst = opts.preferPassFirst ?? true;

  return async (req: any, res: any, next: any) => {
    const userId = req.user.id as string;
    const opKey = opts.opKeyFromReq(req) || crypto.randomUUID();

    const log = (...args: any[]) => opts.debugLogs && console.log("[ENT]", ...args);

    // OPTION A: Pass-first (default)
    if (preferPassFirst) {
      const pass = await hasActivePass(userId);
      log("user:", userId, "feature:", opts.feature, "passActive:", pass, "opKey:", opKey);
      if (pass) return next();

      const charged = await spendCreditsAtomic(userId, opts.creditCost, opKey, opts.feature);
      log("charged (credits):", charged, "opKey:", opKey);
      if (!charged) {
        return res.status(402).json({
          error: "insufficient_credits",
          message: "You don't have enough credits. Buy a pack or get the 3-month pass.",
        });
      }
      return next();
    }

    // OPTION B: Credits-first (if you prefer to always spend credits when available)
    const charged = await spendCreditsAtomic(userId, opts.creditCost, opKey, opts.feature);
    log("charged (credits-first):", charged);
    if (charged) return next();

    const pass = await hasActivePass(userId);
    log("fallback passActive:", pass);
    if (pass) return next();

    return res.status(402).json({
      error: "insufficient_credits",
      message: "You don’t have enough credits. Buy a pack or get the 3-month pass.",
    });
  };
}
