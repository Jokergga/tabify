import { TabGroup } from "./components";

function App() {

  const tabs = [
    { label: 'Tab 1', content: <div>Content 1</div>, key: 'tabs1' },
    { label: 'Tab 2', content: <div>Content 2</div>, key: 'tabs2' },
  ];

  return <TabGroup tabs={tabs} />;
}

export default App
