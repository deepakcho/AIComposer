import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TableOfContents } from './components/TableOfContents';
import { useActiveSection } from './components/useActiveSection';
import { Hero } from './sections/Hero';
import { Installation } from './sections/Installation';
import { QuickStart } from './sections/QuickStart';
import { Demos } from './sections/Demos';
import { Templates } from './sections/Templates';
import { TemplateTutorial } from './sections/TemplateTutorial';
import { Scenarios } from './sections/Scenarios';
import { ApiReference } from './sections/ApiReference';
import { Theming } from './sections/Theming';
import { StylingTutorial } from './sections/StylingTutorial';
import { Frameworks } from './sections/Frameworks';
import { Storybooks } from './sections/Storybooks';

export function App(): JSX.Element {
  const activeId = useActiveSection();

  return (
    <>
      <Header />
      <div className="page-layout">
        <Sidebar activeId={activeId} />
        <main className="content-column">
          <Hero />
          <Installation />
          <QuickStart />
          <Demos />
          <Templates />
          <TemplateTutorial />
          <Scenarios />
          <ApiReference />
          <Theming />
          <StylingTutorial />
          <Frameworks />
          <Storybooks />
        </main>
        <TableOfContents activeId={activeId} />
      </div>
    </>
  );
}
