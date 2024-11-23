import { TabGroup } from "./components";

function App() {

  const tabs = [
    { label: 'Tab 1', content: <div>Content 1</div> },
    { label: 'Tab 2', content: <div>Content 2</div> },
  ];

  return <TabGroup tabs={tabs} />;
}

export default App
