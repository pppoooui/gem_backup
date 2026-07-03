"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { defaultHomeContent, type HomeMilestone } from "@/lib/home-content";
import type { Locale } from "@/types/domain";

export const historyYears = defaultHomeContent.milestones.map((milestone) => milestone.year);
export const historyAutoplayDelayMs = 1800;
export const historyStepMotionMs = 950;
export const historyResetMotionMs = 280;

export function nextHistoryIndex(current: number, direction: number, total: number) {
  return (current + direction + total) % total;
}

export function HistoryCarousel({
  locale,
  milestones = defaultHomeContent.milestones,
}: {
  locale: Locale;
  milestones?: HomeMilestone[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const motionDurationRef = useRef(0);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = nextHistoryIndex(current, 1, milestones.length);
        motionDurationRef.current = next === 0 ? historyResetMotionMs : historyStepMotionMs;
        return next;
      });
    }, historyAutoplayDelayMs);
    return () => window.clearInterval(timer);
  }, [paused, milestones.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const target = scroller?.children.item(active) as HTMLElement | null;
    if (!scroller || !target) return;
    if (animationRef.current !== null) {
      window.cancelAnimationFrame(animationRef.current);
    }
    const start = scroller.scrollLeft;
    const destination = Math.min(
      target.offsetLeft,
      scroller.scrollWidth - scroller.clientWidth,
    );
    const distance = destination - start;
    const duration = motionDurationRef.current;
    if (duration === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scroller.scrollLeft = destination;
    } else {
      const startedAt = window.performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
        scroller.scrollLeft = start + distance * eased;
        if (progress < 1) animationRef.current = window.requestAnimationFrame(animate);
      };
      animationRef.current = window.requestAnimationFrame(animate);
    }
    const years = yearsRef.current;
    const yearTarget = years?.children.item(active) as HTMLElement | null;
    if (years && yearTarget) {
      years.scrollLeft = Math.max(
        0,
        yearTarget.offsetLeft - (years.clientWidth - yearTarget.clientWidth) / 2,
      );
    }
    return () => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    };
  }, [active]);

  const selectYear = (index: number) => {
    motionDurationRef.current = 900;
    setActive(index);
  };

  return (
    <section id="history" className="bg-[#f7f7f6] py-14 sm:py-18">
      <div className="mx-auto max-w-[1840px] px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">{locale === "zh" ? "发展历程" : "Our journey"}</h2>
          <p className="mt-4 text-sm leading-7 text-black/48">
            {locale === "zh"
              ? "持续完善切工、检测、包装与全球履约，让每一次补货都更加稳定清晰。"
              : "Continuously improving cutting, inspection, packing and global fulfillment for dependable replenishment."}
          </p>
        </div>

        <div className="relative mt-11" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto [scrollbar-width:none] sm:gap-8 lg:gap-14 [&::-webkit-scrollbar]:hidden">
            {milestones.map((milestone) => (
              <article key={milestone.year} className="group relative aspect-[16/9] w-[88%] shrink-0 overflow-hidden bg-black text-left sm:w-[calc((100%_-_4rem)/3)] lg:w-[calc((100%_-_7rem)/3)]">
                <Image src={milestone.image} alt={locale === "zh" ? milestone.titleZh : milestone.titleEn} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 640px) 88vw, 33vw" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_44%,rgba(0,0,0,0.78)_100%)]" />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-xs tracking-[0.2em] text-[#d4ad80]">{milestone.year}</span>
                  <span className="mt-2 block text-lg font-medium">{locale === "zh" ? milestone.titleZh : milestone.titleEn}</span>
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div ref={yearsRef} className="flex min-w-max border-b border-black/12 sm:min-w-0">
            {milestones.map((milestone, index) => (
              <button key={milestone.year} type="button" onClick={() => selectYear(index)} aria-current={active === index ? "step" : undefined} data-active={active === index ? "true" : "false"} className={`relative min-w-24 flex-1 pb-4 text-center text-base transition sm:min-w-0 sm:text-lg ${active === index ? "font-semibold text-[#a97342]" : "text-black/42 hover:text-black/70"}`}>
                {milestone.year}
                <span className={`absolute bottom-[-4px] left-1/2 size-2 -translate-x-1/2 rounded-full border ${active === index ? "border-[#a97342] bg-white" : "border-white bg-[#a97342]"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-4xl text-center">
          <h3 className="text-xl font-semibold">{locale === "zh" ? milestones[active].titleZh : milestones[active].titleEn}</h3>
          <p className="mt-3 text-sm leading-7 text-black/55">{locale === "zh" ? milestones[active].bodyZh : milestones[active].bodyEn}</p>
        </div>
      </div>
    </section>
  );
}
