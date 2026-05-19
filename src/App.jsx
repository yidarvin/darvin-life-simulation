import { AppShell } from './components/AppShell';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HUD } from './components/panels/HUD';
import { ActionsPanel } from './components/panels/ActionsPanel';
import { ShopPanel } from './components/panels/ShopPanel';

export default function App() {
  return (
    <AppShell>
      <Header version="v0.0" stage="session 12 — shop wired" />
      <HUD />
      <ActionsPanel />
      <ShopPanel />
      <Footer />
    </AppShell>
  );
}
