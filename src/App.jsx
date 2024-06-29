// src/App.jsx
import React from 'react';
import MapComponent from './components/MapComponent';
import './index.css'; // Импортируем стили

const App = () => {
  return (
    <div style={{ height: '100%' }}>
      <h1>Interactive Map of Russia</h1>
      <MapComponent />
    </div>
  );
};

export default App;
