import React from 'react';

const Logo = ({ className = "text-3xl" }: { className?: string }) => {
  const logoStyle: React.CSSProperties = {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontWeight: 900,
    color: '#000',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 1,
  };

  const boltStyle: React.CSSProperties = {
    fontSize: '1.5em',
    color: '#EBF400',
    transform: 'rotate(30deg)',
    marginLeft: '-0.3em',
    marginRight: '-0.4em',
    position: 'relative',
    top: '0.05em',
    display: 'inline-block',
  };

  return (
    <h1 className={className} style={logoStyle}>
      ka<span style={boltStyle}>⚡</span>ya
    </h1>
  );
};

export default Logo;
