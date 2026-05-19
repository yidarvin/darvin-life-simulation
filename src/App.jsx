import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { ShopPanel } from './components/panels/ShopPanel';
import { YearProgressPanel } from './components/panels/YearProgressPanel';
import { InternshipPanel } from './components/panels/InternshipPanel';
import { CareerLadderPanel } from './components/panels/CareerLadderPanel';
import { SpecializationPanel } from './components/panels/SpecializationPanel';
import { RankProgressPanel } from './components/panels/RankProgressPanel';
import { SwapPanel } from './components/panels/SwapPanel';
import { InternshipFlow } from './components/events/InternshipFlow';
import { JobOfferFlow } from './components/events/JobOfferFlow';
import { RankUpFlow } from './components/events/RankUpFlow';
import { SwapFlow } from './components/events/SwapFlow';
import { RandomEventFlow } from './components/events/RandomEventFlow';

export default function App() {
  return (
    <AppShell>
      <Header version="v0.0" stage="session 20 — random events" />
      <HUD />
      <ActionsPanel />
      <YearProgressPanel />
      <InternshipPanel />
      <CareerLadderPanel />
      <SpecializationPanel />
      <RankProgressPanel />
      <SwapPanel />
      <ShopPanel />
      <Footer />
      <InternshipFlow />
      <JobOfferFlow />
      <RankUpFlow />
      <SwapFlow />
      <RandomEventFlow />
    </AppShell>
  );
}
