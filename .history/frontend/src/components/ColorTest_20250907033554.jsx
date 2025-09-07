import React, { useState, useEffect } from 'react';

const ColorTest = () => {
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '20px',
      background: colors[colorIndex],
      borderRadius: '15px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: `0 0 30px ${colors[colorIndex]}80, 0 0 60px ${colors[(colorIndex + 1) % colors.length]}40`,
      transform: `translateY(${Math.sin(Date.now() / 1000) * 10}px)`,
      transition: 'all 0.5s ease',
      textAlign: 'center',
      minWidth: '200px'
    }}>
      🌈 COLORS ARE WORKING! 🌈
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: colors[(colorIndex + 2) % colors.length],
        borderRadius: '8px',
        fontSize: '14px',
        boxShadow: `inset 0 0 20px ${colors[(colorIndex + 3) % colors.length]}60`
      }}>
        Dynamic Color Box
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        opacity: 0.9
      }}>
        Current: {colors[colorIndex]}
      </div>
    </div>
  );
};

export default ColorTest;