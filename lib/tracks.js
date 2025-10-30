
const BASE = process.env.NEXT_PUBLIC_SERVER_URL || "";

const tracks = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  return {
    id: `track${n}`,
    title: `Track ${n}`,
    src: `${BASE}/music/track${n}.mp3`,
  };
});

export default tracks;
