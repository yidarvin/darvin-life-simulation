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
import { initOfflineCatchUp, teardownOfflineCatchUp } from './game/state/offlineCatchUp';

export default function App() {
  useEffect(() => {
    initOfflineCatchUp();
    return () => teardownOfflineCatchUp();
  }, []);

  return (
    <AppShell>
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
