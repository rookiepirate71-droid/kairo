"use client";

import { useState } from "react";
import { FAQ, numeralFor } from "@/lib/constants";
import { Faq } from "@/components/ui/faq";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const FAQ_ITEMS = FAQ.map((f, i) => ({
  id: `faq-${i}`,
  question: f.q,
  answer: f.a,
}));

export default function Senate() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  return (
    <section id="senate" className="travertine-bg text-ink py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-terra-deep mb-4">
          {numeralFor("senate")} — The Senate
        </p>
        <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-12">
          Questions, answered by the Senate in no particular hurry.
        </h2>

        <Faq items={FAQ_ITEMS} accent="#b5532f" className="max-w-2xl" />

        <div className="mt-16 border border-purple/30 bg-ink p-6 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Badge tone="terra">Request Access</Badge>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-marble">
              one working session · live within the week
            </span>
          </div>
          <form
            className="flex flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setStatus("sent");
            }}
          >
            <label className="flex-1">
              <span className="sr-only">Work email</span>
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("idle");
                }}
                placeholder="you@company.com"
                className="w-full min-h-[44px] bg-charcoal border border-stone/50 rounded-sm px-4 text-bone placeholder:text-stone focus:border-oxidized focus:outline-none"
              />
            </label>
            <Button type="submit" disabled={!email.includes("@")}>
              Request access
            </Button>
          </form>
          <p
            role="status"
            className={`mt-4 font-mono text-[11px] uppercase tracking-[0.2em] ${
              status === "sent" ? "text-oxidized" : "text-stone"
            }`}
          >
            {status === "sent"
              ? `Received. An augur will contact ${email} within one business day.`
              : "One working session. No credit card. No ceremony (much)."}
          </p>
        </div>
      </div>
    </section>
  );
}
