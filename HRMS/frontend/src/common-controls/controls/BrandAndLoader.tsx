import React from 'react';

export interface UniGlobalLogoIconProps {
  size?: number;
  variant?: 'png' | 'jpg';
  animated?: boolean;
  className?: string;
}

/**
 * Official UniGlobal Logo Icon (from UniGlobal Logos/LogoIcon.png & LogoIcon.jpg).
 * Used as the Application Icon, Favicon, and Animated Loading Indicator.
 */
export const UniGlobalLogoIcon: React.FC<UniGlobalLogoIconProps> = ({
  size = 28,
  variant = 'png',
  animated = false,
  className = '',
}) => {
  const src = variant === 'jpg' ? '/assets/logos/LogoIcon.jpg' : '/assets/logos/LogoIcon.png';

  if (!animated) {
    return (
      <img
        src={src}
        alt="UniGlobal Logo"
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
          borderRadius: variant === 'jpg' ? 6 : 0,
        }}
      />
    );
  }

  const ringSize = Math.round(size * 1.38);
  return (
    <span
      style={{
        position: 'relative',
        width: ringSize,
        height: ringSize,
        display: 'inline-grid',
        placeItems: 'center',
      }}
    >
      <svg
        width={ringSize}
        height={ringSize}
        viewBox="0 0 64 64"
        fill="none"
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r="29"
          stroke="var(--ug-border)"
          strokeWidth="3.5"
        />
        <circle
          cx="32"
          cy="32"
          r="29"
          stroke="var(--ug-primary)"
          strokeWidth="3.5"
          strokeDasharray="115 68"
          strokeLinecap="round"
          className="ug-loader-ring"
        />
      </svg>
      <img
        src={src}
        alt="UniGlobal Loading"
        width={size}
        height={size}
        className="ug-loader-core"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </span>
  );
};

export interface UniGlobalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  overlay?: boolean;
}

export const UniGlobalLoader: React.FC<UniGlobalLoaderProps> = ({
  size = 'md',
  label = 'Loading...',
  overlay = false,
}) => {
  const px = size === 'sm' ? 22 : size === 'lg' ? 46 : 32;
  const content = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <UniGlobalLogoIcon size={px} animated />
      {label && (
        <span style={{ fontSize: '0.926rem', fontWeight: 600, color: 'var(--ug-primary)' }}>
          {label}
        </span>
      )}
    </div>
  );

  if (!overlay) return content;

  return (
    <div className="ug-backdrop" style={{ zIndex: 120 }}>
      <div
        style={{
          background: 'var(--ug-surface)',
          padding: '28px 40px',
          borderRadius: 'var(--ug-radius-lg)',
          boxShadow: 'var(--ug-shadow-lg)',
          border: '1px solid var(--ug-border)',
        }}
      >
        {content}
      </div>
    </div>
  );
};
