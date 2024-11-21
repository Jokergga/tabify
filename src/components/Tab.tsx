import React from 'react';

const Tab = ({ label, onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px',
        margin: '0 5px',
        border: isActive ? '2px solid blue' : '1px solid gray',
        backgroundColor: isActive ? 'lightblue' : 'white',
      }}
    >
      {label}
    </button>
  );
};

export default Tab;
