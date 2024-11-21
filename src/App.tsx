import { TabGroup } from './components';
import AntdTabs from './components/AntdTabs';

function App() {

  const tabs = [
    { label: 'Tab 1', content: <div>Content 1</div> },
    { label: 'Tab 2', content: <div>Content 2</div> },
  ];

  // return <TabGroup tabs={tabs} />;
  return <AntdTabs />
}

export default App
