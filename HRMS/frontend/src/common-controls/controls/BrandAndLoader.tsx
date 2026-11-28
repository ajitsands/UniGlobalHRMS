import React from 'react';
import { useTheme } from '../tokens/ThemeContext';

export interface PromptLogoIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Square Prompt Solutions Emblem Icon (cropped from official prompt_logo.png).
 * Used for favicons, compact square badges, and animated ring loaders.
 */
export const PromptLogoIcon: React.FC<PromptLogoIconProps> = ({
  size = 28,
  animated = false,
  className = '',
}) => {
  const src = '/assets/logos/prompt_icon.png';

  if (!animated) {
    return (
      <img
        src={src}
        alt="Prompt Solutions Icon"
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
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
        <circle cx="32" cy="32" r="29" stroke="var(--ug-border)" strokeWidth="3.5" />
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
        alt="Prompt Loading"
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

export interface PromptLogoProps {
  variant?: 'color' | 'white';
  height?: number;
  badgeText?: string;
  className?: string;
}

/**
 * Official PROMPT Solutions Logo (from client reference prompt_logo.png & prompt_logo_white.png).
 * Used across Login Screens and PROMPT ERP / HRMS headers.
 */
export const PromptLogo: React.FC<PromptLogoProps> = ({
  variant = 'color',
  height = 44,
  badgeText,
  className = '',
}) => {
  const src =
    variant === 'white'
      ? '/assets/logos/prompt_logo_white.png'
      : '/assets/logos/prompt_logo.png';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <img
        src={src}
        alt="Prompt Solutions"
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {badgeText && (
        <>
          <span
            aria-hidden="true"
            style={{
              height: Math.round(height * 0.56),
              width: 1,
              background: variant === 'white' ? 'rgba(255,255,255,0.35)' : 'var(--ug-border-strong)',
            }}
          />
          <span
            style={{
              fontSize: '0.852rem',
              fontWeight: 800,
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: variant === 'white' ? '#ffffff' : 'var(--ug-primary)',
            }}
          >
            {badgeText}
          </span>
        </>
      )}
    </span>
  );
};

export interface UniGlobalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  overlay?: boolean;
  brand?: 'uniglobal' | 'prompt';
}

export const UniGlobalLoader: React.FC<UniGlobalLoaderProps> = ({
  size = 'md',
  label = 'Loading...',
  overlay = false,
  brand = 'prompt',
}) => {
  const { isDarkTheme } = useTheme();
  const px = size === 'sm' ? 22 : size === 'lg' ? 46 : 32;
  const logoVariant = isDarkTheme ? 'white' : 'color';
  const content = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {brand === 'prompt' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <PromptLogo variant={logoVariant} height={px + 6} />
          <div
            style={{
              width: 120,
              height: 4,
              borderRadius: 999,
              background: 'var(--ug-border)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '45%',
                height: '100%',
                borderRadius: 999,
                background: 'var(--ug-primary)',
                animation: 'ug-login-bar-slide 1.1s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      ) : (
        <UniGlobalLogoIcon size={px} animated />
      )}
      {label && (
        <span style={{ fontSize: '0.926rem', fontWeight: 600, color: 'var(--ug-primary)' }}>
          {label}
        </span>
      )}
    </div>
  );

  if (!overlay) return content;

  return (
    <div className="ug-backdrop" style={{ zIndex: 150 }}>
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
