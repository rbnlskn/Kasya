import React from 'react';

const Logo = ({ size = '4rem' }: { size?: string }) => {
  return (
    <h1
      className="kasya-logo"
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: size,
        color: '#000',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
      }}
    >
      ka
      <span
        className="bolt"
        style={{
          fontSize: '1.5em',
          color: '#EBF400',
          transform: 'rotate(30deg)',
          marginLeft: '-0.3em',
          marginRight: '-0.4em',
          position: 'relative',
          top: '0.05em',
          display: 'inline-block',
        }}
      >
        ⚡
      </span>
      ya
    </h1>
  );
};

export default Logo;
