import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { ShopPanel } from './components/panels/ShopPanel';
import { YearProgressPanel } from './components/panels/YearProgressPanel';
import { InternshipPanel } from './components/panels/InternshipPanel';
import { CareerLadderPanel } from './components/panels/CareerLadderPanel';
import { InternshipFlow } from './components/events/InternshipFlow';
import { JobOfferFlow } from './components/events/JobOfferFlow';

export default function App() {
  return (
    <AppShell>
      <Header version="v0.0" stage="session 16 — career ladder" />
      <HUD />
      <ActionsPanel />
      <YearProgressPanel />
      <InternshipPanel />
      <CareerLadderPanel />
      <ShopPanel />
      <Footer />
      <InternshipFlow />
      <JobOfferFlow />
    </AppShell>
  );
}
