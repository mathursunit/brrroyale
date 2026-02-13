const Icon = ({ name, className = '', title = '' }) => {
  const props = {
    className: `ui-icon ${className}`.trim(),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': title ? undefined : 'true',
    role: title ? 'img' : undefined
  };

  const Title = title ? <title>{title}</title> : null;

  switch (name) {
    case 'sun':
      return (
        <svg {...props}>
          {Title}
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          {Title}
          <path d="M21 12.5A8.5 8.5 0 1 1 11.5 3 6.5 6.5 0 0 0 21 12.5z" />
        </svg>
      );
    case 'snow':
      return (
        <svg {...props}>
          {Title}
          <path d="M12 2v20M4 6l16 12M20 6L4 18M4 12h16" />
        </svg>
      );
    case 'thermo':
      return (
        <svg {...props}>
          {Title}
          <path d="M10 14a3 3 0 1 0 4 0V5a2 2 0 1 0-4 0v9z" />
          <path d="M10 8h4" />
        </svg>
      );
    case 'info':
      return (
        <svg {...props}>
          {Title}
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          {Title}
          <path d="M8 4h8v3a4 4 0 0 1-8 0z" />
          <path d="M6 4H4a2 2 0 0 0 2 2" />
          <path d="M18 4h2a2 2 0 0 1-2 2" />
          <path d="M12 11v4" />
          <path d="M8 19h8" />
        </svg>
      );
    case 'close':
      return (
        <svg {...props}>
          {Title}
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...props}>
          {Title}
          <path d="M3 8l4 3 5-6 5 6 4-3v9H3z" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          {Title}
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          {Title}
          <path d="M4 19V5" />
          <path d="M8 19v-6" />
          <path d="M12 19v-9" />
          <path d="M16 19v-4" />
          <path d="M20 19v-11" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...props}>
          {Title}
          <path d="M7 17L17 7" />
          <path d="M10 7h7v7" />
        </svg>
      );
    case 'arrow-up':
      return (
        <svg {...props}>
          {Title}
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      );
    case 'arrow-down':
      return (
        <svg {...props}>
          {Title}
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      );
    case 'minus':
      return (
        <svg {...props}>
          {Title}
          <path d="M5 12h14" />
        </svg>
      );
    case 'gauge':
      return (
        <svg {...props}>
          {Title}
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
          <path d="M12 12l4-4" />
          <path d="M12 8v4" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          {Title}
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
