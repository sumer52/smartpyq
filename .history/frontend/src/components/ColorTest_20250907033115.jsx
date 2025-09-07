import React from 'react';

const ColorTest = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '20px',
      background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
      backgroundSize: '400% 400%',
      animation: 'rainbow-shift 3s ease infinite',
      borderRadius: '10px',
      color: 'white',
      fontWeight: 'bold',
      boxShadow: '0 0 20px rgba(255, 107, 107, 0.7), 0 0 40px rgba(78, 205, 196, 0.5)',
      transform: 'translateY(0px)',
      animationName: 'floating, pulse-glow',
      animationDuration: '3s, 2s',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-in-out'
    }}>
      🌈 COLORFUL ANIMATIONS ACTIVE! 🌈
      <div style={{
        marginTop: '10px',
        padding: '10px',
        background: '#ff6b6b',
        borderRadius: '5px',
        animation: 'color-shift 4s ease-in-out infinite'
      }}>
        Color Shifting Box
      </div>
    </div>
  );
};

export default ColorTest;