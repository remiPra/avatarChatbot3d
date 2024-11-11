// src/components/ExpressionControls.jsx
import React from 'react';

export default function ExpressionControls({ 
  expressions, 
  onExpressionChange,
  onAutoAnimate,
  isAutoAnimating
}) {
  return (
    <div style={{
      position: 'absolute',
      right: 20,
      top: 20,
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      width: '300px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Contrôles des expressions</h3>
      
      {Object.entries(expressions).map(([name, value]) => (
        <div key={name} style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '5px',
            color: '#555',
            fontSize: '14px'
          }}>
            {name.replace(/([A-Z])/g, ' $1').toLowerCase()}:
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => onExpressionChange(name, parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ 
                minWidth: '40px', 
                textAlign: 'right',
                fontSize: '12px'
              }}>
                {value.toFixed(2)}
              </span>
            </div>
          </label>
        </div>
      ))}

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
      }}>
        <button
          onClick={() => onAutoAnimate('speak')}
          style={{
            padding: '8px 16px',
            background: isAutoAnimating.speak ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          {isAutoAnimating.speak ? 'Arrêter parole' : 'Parler'}
        </button>
        <button
          onClick={() => onAutoAnimate('blink')}
          style={{
            padding: '8px 16px',
            background: isAutoAnimating.blink ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          {isAutoAnimating.blink ? 'Arrêter clignement' : 'Cligner'}
        </button>
      </div>
    </div>
  );
}
