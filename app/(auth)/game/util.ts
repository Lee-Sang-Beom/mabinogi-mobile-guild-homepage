const audioList: string[] = [
  "/audios/fergus-song.mp3",
  "/audios/with-glory-i-shall-fall.mp3",
  "/audios/against-the-tide.mp3",
  "/audios/escaping-the-sandworm.mp3",
  "/audios/light-of-nibel.mp3",
  "/audios/test-drive.mp3",
];

// 랜덤 오디오 선택 함수
export const getRandomAudio = (): string => {
  const randomIndex = Math.floor(Math.random() * audioList.length);
  return audioList[randomIndex];
};
