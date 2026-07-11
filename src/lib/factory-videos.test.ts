import { describe, expect, it } from "vitest";
import { factoryVideos } from "@/lib/factory-videos";

describe("factoryVideos", () => {
  it("uses the three supplied original vertical video files", () => {
    expect(factoryVideos.map((video) => video.src)).toEqual([
      "/media/video1.mp4",
      "/media/video2.mp4",
      "/media/video3.mp4",
    ]);
  });
});
