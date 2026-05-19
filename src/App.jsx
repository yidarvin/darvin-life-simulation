import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { ShopPanel } from './components/panels/ShopPanel';
import { YearProgressPanel } from './components/panels/YearProgressPanel';
import { InternshipPanel } from './components/panels/InternshipPanel';
import { InternshipFlow } from './components/events/InternshipFlow';

export default function App() {
  return (
    <AppShell>
      <Header version="v0.0" stage="session 14 — internship" />
      <HUD />
      <ActionsPanel />
      <YearProgressPanel />
      <InternshipPanel />
      <ShopPanel />
      <Footer />
      <InternshipFlow />
    </AppShell>
  );
}
