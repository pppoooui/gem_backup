import { describe, expect, it } from "vitest";
import {
  historyAutoplayDelayMs,
  historyResetMotionMs,
  historyStepMotionMs,
  historyYears,
  nextHistoryIndex,
} from "./history-carousel";

it("uses the requested nine milestone years in ascending order", () => {
  expect(historyYears).toEqual([
    "1995",
    "2000",
    "2005",
    "2010",
    "2015",
    "2018",
    "2020",
    "2025",
    "2026",
  ]);
});

describe("nextHistoryIndex", () => {
  it("moves forward and wraps to the first milestone", () => {
    expect(nextHistoryIndex(3, 1, 9)).toBe(4);
    expect(nextHistoryIndex(8, 1, 9)).toBe(0);
  });

  it("moves backward and wraps to the last milestone", () => {
    expect(nextHistoryIndex(3, -1, 9)).toBe(2);
    expect(nextHistoryIndex(0, -1, 9)).toBe(8);
  });
});

it("uses the requested faster autoplay timing", () => {
  expect(historyAutoplayDelayMs).toBe(1800);
  expect(historyStepMotionMs).toBeLessThan(historyAutoplayDelayMs);
  expect(historyResetMotionMs).toBeLessThan(historyStepMotionMs);
});
