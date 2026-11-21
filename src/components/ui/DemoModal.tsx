"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

/**
 * "Watch the Rite" — the product demo modal. Holds a scripted walkthrough
 * (no video asset shipped); keyboard operable via Modal's trap and Escape.
 */
export default function DemoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "I. Connect the Auguries",
      body: "Point Oraculum at your warehouse, event streams and SaaS tools. Forty sources, one afternoon, no schema interrogation.",
    },
    {
      title: "II. Define the Metrics",
      body: "Revenue, retention, churn — each metric is defined once and carries its lineage back to the source rows on every chart.",
    },
    {
      title: "III. Ask in Plain Language",
      body: "“Cohort retention by plan, last six months.” The oracle answers with governed SQL, a chart, and the decision it implies.",
    },
    {
      title: "IV. Hear the Alerts",
      body: "When a metric shifts against its forecast, the rite fires — to Slack, to email, to whoever owns the number.",
    },
  ];

  const current = steps[step] ?? steps[0];

  if (!current) return null;

  return (
    <Modal open={open} onClose={onClose} title="The Rite — a four-minute rite of passage">
      <div>
        <div
          className="mb-4 border border-stone/40 bg-ink rounded-sm p-4 font-mono text-xs text-oxidized leading-relaxed"
          role="img"
          aria-label="Animated walkthrough of the Oraculum product, step by step"
        >
          <div className="text-stone mb-2">oracle&gt; _</div>
          <div className="text-bone">
            {step === 0 && "$ oraculum connect --source warehouse,events,crm"}
            {step === 1 && "$ oraculum metric define revenue --lineage on"}
            {step === 2 && 'oracle> "cohort retention by plan, 6 months"'}
            {step === 3 && "▲ alert: churn shifted +2.1% (senator tier)"}
          </div>
        </div>
        <h4 className="font-display text-xl text-bone mb-2">{current.title}</h4>
        <p className="text-sm leading-relaxed text-travertine">{current.body}</p>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2" aria-hidden="true">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i === step ? "bg-oxidized" : "bg-stone/40"}`}
              />
            ))}
          </div>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="min-h-[44px] px-6 text-sm uppercase tracking-wide font-sans bg-terracotta text-bone rounded-sm hover:bg-terra-deep transition-colors"
            >
              Next rite
            </button>
          ) : (
            <a
              href="#access"
              onClick={onClose}
              className="min-h-[44px] px-6 inline-flex items-center text-sm uppercase tracking-wide font-sans bg-oxidized text-ink rounded-sm hover:bg-gold transition-colors"
            >
              Request Access
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
