export type FactoryVideo = {
  src: string;
  titleEn: string;
  titleZh: string;
};

export const FACTORY_VIDEO_PLAYBACK_RATE = 0.5;

export const factoryVideos: FactoryVideo[] = [
  {
    src: "/media/video1.mp4",
    titleEn: "Factory video 1",
    titleZh: "工厂视频 1",
  },
  {
    src: "/media/video2.mp4",
    titleEn: "Factory video 2",
    titleZh: "工厂视频 2",
  },
  {
    src: "/media/video3.mp4",
    titleEn: "Factory video 3",
    titleZh: "工厂视频 3",
  },
  {
    src: "/media/video4.mp4",
    titleEn: "Factory video 4",
    titleZh: "工厂视频 4",
  },
];
