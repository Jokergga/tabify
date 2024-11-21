import React, { useState } from 'react';
import Tab from './Tab';

const TabGroup = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            isActive={activeTab === index}
            onClick={() => setActiveTab(index)}
          />
        ))}
      </div>
      <div>
        {tabs[activeTab] && tabs[activeTab].content}
      </div>
    </div>
  );
};

export default TabGroup;
