import { describe, expect, it } from "vitest";
import {
  FACTORY_VIDEO_PLAYBACK_RATE,
  factoryVideos,
} from "@/lib/factory-videos";

describe("factoryVideos", () => {
  it("uses the four supplied original video files", () => {
    expect(factoryVideos.map((video) => video.src)).toEqual([
      "/media/video1.mp4",
      "/media/video2.mp4",
      "/media/video3.mp4",
      "/media/video4.mp4",
    ]);
  });

  it("plays every factory video at half speed", () => {
    expect(FACTORY_VIDEO_PLAYBACK_RATE).toBe(0.5);
  });
});
