import { useEffect } from 'react';
import { useGameStore } from '../game/state/store';
import { music, getCurrentPhase } from '../utils/music';

export function MusicController() {
  const stage = useGameStore((s) => s.stage);
  const year = useGameStore((s) => s.year);
  const currentTrack = useGameStore((s) => s.career.currentTrack);
  const rank = useGameStore((s) => s.career.rank);

  useEffect(() => {
    const phase = getCurrentPhase({
      stage,
      year,
      career: { currentTrack, rank },
    });
    music.playPhase(phase);
  }, [stage, year, currentTrack, rank]);

  return null;
}
