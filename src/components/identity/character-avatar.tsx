import type { CSSProperties } from "react";

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const skinTones = ["#f0be95", "#c98b60", "#8b5338", "#dfaa75", "#af7150", "#f5d1ac"];
const hairTones = ["#2d272e", "#493125", "#241f29", "#76462d", "#1c3435"];
const outfits = ["#236f67", "#9b6a41", "#3b576b", "#6b568d", "#a76554"];

/**
 * A deterministic miniature 3D-style character; no external image request
 * and no expensive individual WebGL canvases in member tables.
 * The Neon user ID can be supplied as seed to keep the assigned look stable.
 */
export function CharacterAvatar({
  name,
  seed = name,
  size = "md",
}: {
  name: string;
  seed?: string;
  size?: string;
}) {
  const hash = hashSeed(seed);
  const hue = hash % 360;
  const style = {
    "--character-bg": `hsl(${hue} 43% 78%)`,
    "--character-skin": skinTones[hash % skinTones.length],
    "--character-hair": hairTones[(hash >>> 5) % hairTones.length],
    "--character-shirt": outfits[(hash >>> 9) % outfits.length],
  } as CSSProperties;

  return (
    <span className={`avatar character-avatar ${size}`} style={style} role="img" aria-label={`${name}'s avatar`}>
      <span className={`character-hair hair-${(hash >>> 13) % 4}`} />
      <span className="character-head">
        <span className="character-eyes" />
        <span className="character-mouth" />
        {(hash >>> 17) % 3 === 0 && <span className="character-glasses" />}
      </span>
      <span className="character-shirt" />
    </span>
  );
}
