import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { BurnoutPanel } from './components/panels/BurnoutPanel';
import { ShopPanel } from './components/panels/ShopPanel';
import { YearProgressPanel } from './components/panels/YearProgressPanel';
import { InternshipPanel } from './components/panels/InternshipPanel';
import { CareerLadderPanel } from './components/panels/CareerLadderPanel';
import { SpecializationPanel } from './components/panels/SpecializationPanel';
import { UpworkPanel } from './components/panels/UpworkPanel';
import { RankProgressPanel } from './components/panels/RankProgressPanel';
import { InfluenceAllocationPanel } from './components/panels/InfluenceAllocationPanel';
import { HirePanel } from './components/panels/HirePanel';
import { TeamsPanel } from './components/panels/TeamsPanel';
import { EndgamePanel } from './components/panels/EndgamePanel';
import { SwapPanel } from './components/panels/SwapPanel';
import { InternshipFlow } from './components/events/InternshipFlow';
import { JobOfferFlow } from './components/events/JobOfferFlow';
import { RankUpFlow } from './components/events/RankUpFlow';
import { SwapFlow } from './components/events/SwapFlow';
import { RandomEventFlow } from './components/events/RandomEventFlow';
import { EndgameFlow } from './components/events/EndgameFlow';
import { WellnessFlow } from './components/events/WellnessFlow';
import { OfflineCatchUpFlow } from './components/events/OfflineCatchUpFlow';
import { MusicController } from './components/MusicController';
import { initOfflineCatchUp, teardownOfflineCatchUp } from './game/state/offlineCatchUp';
import { music, getCurrentPhase } from './utils/music';
import { useGameStore } from './game/state/store';

export default function App() {
  useEffect(() => {
    initOfflineCatchUp();
    return () => teardownOfflineCatchUp();
  }, []);

  useEffect(() => {
    // Every gesture: read current phase from the store and ensure the right
    // track is playing. Zustand updates synchronously inside the React onClick
    // handler that fires before this bubble-phase handler, so getState() here
    // sees the post-click phase. Doing this inside a gesture is what makes
    // play() reliably succeed — useEffect-driven plays after a phase change
    // can be rejected by Chrome's autoplay policy.
    const onGesture = () => {
      const state = useGameStore.getState();
      const phase = getCurrentPhase({
        stage: state.stage,
        year: state.year,
        career: { currentTrack: state.career.currentTrack, rank: state.career.rank },
      });
      music.ensurePlaying(phase);
    };
    document.addEventListener('click', onGesture);
    document.addEventListener('touchstart', onGesture);
    document.addEventListener('keydown', onGesture);
    return () => {
      document.removeEventListener('click', onGesture);
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, []);

  return (
    <AppShell>
      <MusicController />
      <Header version="v0.1" stage="Barely working prototype.  Ready to ship." />
      <HUD />
      <ActionsPanel />
      <BurnoutPanel />
      <YearProgressPanel />
      <InternshipPanel />
      <CareerLadderPanel />
      <SpecializationPanel />
      <UpworkPanel />
      <RankProgressPanel />
      <InfluenceAllocationPanel />
      <HirePanel />
      <TeamsPanel />
      <EndgamePanel />
      <SwapPanel />
      <ShopPanel />
      <Footer />
      <InternshipFlow />
      <JobOfferFlow />
      <RankUpFlow />
      <SwapFlow />
      <RandomEventFlow />
      <EndgameFlow />
      <WellnessFlow />
      <OfflineCatchUpFlow />
    </AppShell>
  );
}
