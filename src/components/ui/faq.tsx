"use client";

import { Fragment, useId, useState } from "react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

const SEND: Transition = { type: "spring", visualDuration: 0.42, bounce: 0.28 };
const SHIFT: Transition = { type: "spring", visualDuration: 0.4, bounce: 0.1 };
const LEAVE: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] };
const INSTANT: Transition = { duration: 0 };

const QUESTION = '[data-slot="faq-question"]';
const KEY_STEPS: Record<string, (index: number, last: number) => number> = {
  ArrowDown: (index) => index + 1,
  ArrowUp: (index) => index - 1,
  Home: () => 0,
  End: (_, last) => last,
};

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

function RareMark() {
  return (
    <span aria-hidden className="text-base leading-none">
      ✦
    </span>
  );
}

type BubbleProps = {
  item: FaqItem;
  ids: { question: string; answer: string };
  open: boolean;
  openId: string | null;
  reduced: boolean;
};

function Question({
  item,
  ids,
  open,
  openId,
  reduced,
  onToggle,
}: BubbleProps & { onToggle: () => void }) {
  return (
    <motion.button
      id={ids.question}
      type="button"
      data-slot="faq-question"
      aria-expanded={open}
      aria-controls={open ? ids.answer : undefined}
      onClick={onToggle}
      // every bubble re-measures when any answer opens, so the ones below slide
      layout="position"
      layoutDependency={openId}
      transition={reduced ? INSTANT : SHIFT}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      className={cn(
        "max-w-[85%] cursor-pointer self-start rounded-[18px] rounded-bl-[6px] px-4 py-2.5 text-left text-[15px] leading-[1.4] tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        open
          ? "bg-ink text-bone shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          : "bg-ink/[0.06] text-ink hover:bg-ink/10",
      )}
    >
      {item.question}
    </motion.button>
  );
}

function Answer({
  item,
  ids,
  open,
  openId,
  reduced,
  avatar,
}: BubbleProps & { avatar: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {open && (
        <motion.div
          key="answer"
          data-slot="faq-answer"
          layout="position"
          layoutDependency={openId}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: reduced ? INSTANT : LEAVE,
          }}
          transition={reduced ? INSTANT : SEND}
          style={{ originX: 1, originY: 1 }}
          className="flex items-end justify-end gap-2"
        >
          <div
            id={ids.answer}
            role="region"
            aria-labelledby={ids.question}
            className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-[var(--faq-accent)] px-4 py-2.5 text-[15px] leading-[1.45] tracking-[-0.01em] text-bone"
          >
            {item.answer}
          </div>
          {avatar != null && (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink/80 text-gold shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl [&>img]:size-full [&>img]:object-cover"
            >
              {avatar}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type FaqProps = Omit<ComponentProps<"div">, "defaultValue"> & {
  items: FaqItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  accent?: string;
  avatar?: ReactNode;
};

export function Faq({
  items,
  value,
  defaultValue = null,
  onValueChange,
  accent = "#b5532f",
  avatar = <RareMark />,
  className,
  style,
  ...props
}: FaqProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const [own, setOwn] = useState(defaultValue);
  const openId = value === undefined ? own : value;

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    if (value === undefined) setOwn(next);
    onValueChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    const target = event.target as HTMLElement;
    if (!step || !target.matches(QUESTION)) return;

    const questions = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(QUESTION),
    ];
    const next = step(questions.indexOf(target), questions.length - 1);
    event.preventDefault();
    questions[(next + questions.length) % questions.length]?.focus();
  };

  return (
    <div
      data-slot="faq"
      onKeyDown={onKeyDown}
      style={{ "--faq-accent": accent, ...style } as CSSProperties}
      className={cn("relative flex w-full max-w-xl flex-col gap-3", className)}
      {...props}
    >
      {items.map((item) => {
        const bubble = {
          item,
          ids: {
            question: `${uid}-${item.id}-question`,
            answer: `${uid}-${item.id}-answer`,
          },
          open: openId === item.id,
          openId,
          reduced,
        };

        return (
          <Fragment key={item.id}>
            <Question {...bubble} onToggle={() => toggle(item.id)} />
            <Answer {...bubble} avatar={avatar} />
          </Fragment>
        );
      })}
    </div>
  );
}

export default Faq;

