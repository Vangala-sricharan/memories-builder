import React from 'react';
import { 
  ExperienceTemplate, 
  ExperienceTheme, 
  ExperienceMood,
  AccentIntensity,
  GlowStyle,
  BorderStyle,
  HeadingStyle,
  BodyStyle,
  MotionEnergy,
  ParticleAtmosphere,
  PhotoPresentationStyle,
  HeroFocus,
  OccasionType,
  ExperienceCustomization
} from '../types';

export interface TemplateDefinition {
  id: ExperienceTemplate;
  name: string;
  subtitle: string;
  tagline: string;
  coreIdea: string;
  description: string;
  defaultTheme: ExperienceTheme;
  defaultCustomization: ExperienceCustomization;
  previewBadges: string[];
  sampleHeading: { primary: string; secondary: string };
  fontClass: string;
  headingFontClass: string;
  cardBorderClass: string;
  badgeClass: string;
}

export const DEFAULT_CUSTOMIZATION: Record<ExperienceTemplate, ExperienceCustomization> = {
  cinema: {
    mood: 'cinematic',
    accentIntensity: 'balanced',
    glowStyle: 'cinematic',
    borderStyle: 'cinematic',
    headingStyle: 'bold-cinematic',
    bodyStyle: 'clean',
    motionEnergy: 'cinematic',
    particleAtmosphere: 'cinematic',
    photoStyle: 'cinematic',
    heroFocus: 'auto',
    occasion: 'birthday',
  },
  memories: {
    mood: 'emotional',
    accentIntensity: 'balanced',
    glowStyle: 'subtle',
    borderStyle: 'thin',
    headingStyle: 'classic-serif',
    bodyStyle: 'editorial',
    motionEnergy: 'subtle',
    particleAtmosphere: 'minimal',
    photoStyle: 'editorial',
    heroFocus: 'auto',
    occasion: 'birthday',
  },
  celebration: {
    mood: 'energetic',
    accentIntensity: 'bold',
    glowStyle: 'cinematic',
    borderStyle: 'cinematic',
    headingStyle: 'bold-cinematic',
    bodyStyle: 'clean',
    motionEnergy: 'epic',
    particleAtmosphere: 'intense',
    photoStyle: 'cinematic',
    heroFocus: 'auto',
    occasion: 'birthday',
  },
  elegance: {
    mood: 'elegant',
    accentIntensity: 'subtle',
    glowStyle: 'subtle',
    borderStyle: 'thin',
    headingStyle: 'luxury',
    bodyStyle: 'minimal',
    motionEnergy: 'subtle',
    particleAtmosphere: 'minimal',
    photoStyle: 'editorial',
    heroFocus: 'auto',
    occasion: 'birthday',
  },
};

export const TEMPLATES: Record<ExperienceTemplate, TemplateDefinition> = {
  cinema: {
    id: 'cinema',
    name: 'CINEMA',
    subtitle: 'The Film Premiere',
    tagline: 'Tonight, your story premieres.',
    coreIdea: 'The birthday should feel like a premium cinematic film premiere.',
    description: 'Dark, dramatic, sophisticated, and immersive with high-contrast movie poster typography and deep atmospheric depth.',
    defaultTheme: {
      background: '#080808',
      primary: '#E50914',
      secondary: '#FFFFFF',
    },
    defaultCustomization: DEFAULT_CUSTOMIZATION.cinema,
    previewBadges: ['2.39:1 CINEMATIC MASTER', 'FILM PREMIERE', 'ATMOSPHERIC PARTICLES'],
    sampleHeading: { primary: 'HAPPY', secondary: 'BIRTHDAY' },
    fontClass: 'font-sans',
    headingFontClass: 'font-cinzel tracking-tight uppercase font-black',
    cardBorderClass: 'border-[#2B2B2B] hover:border-[var(--theme-primary)]',
    badgeClass: 'bg-[#141414] border-[#2B2B2B] text-neutral-300',
  },
  memories: {
    id: 'memories',
    name: 'MEMORIES',
    subtitle: 'The Memory Film',
    tagline: 'Every photograph holds a moment.',
    coreIdea: 'A deeply emotional visual memory archive of shared milestones.',
    description: 'Intimate, nostalgic, warm, and photographic with elegant serif typography, soft paper textures, and gentle projector-beam dust.',
    defaultTheme: {
      background: '#0C0A09',
      primary: '#F59E0B',
      secondary: '#F5F5F4',
    },
    defaultCustomization: DEFAULT_CUSTOMIZATION.memories,
    previewBadges: ['PHOTO ARCHIVE', 'WARM PROJECTOR DUST', 'INTIMATE SERIF'],
    sampleHeading: { primary: 'TIMELESS', secondary: 'MEMORIES' },
    fontClass: 'font-sans',
    headingFontClass: 'font-serif tracking-normal font-bold',
    cardBorderClass: 'border-[#292524] hover:border-[var(--theme-primary)] shadow-stone-950/50',
    badgeClass: 'bg-[#1C1917] border-[#292524] text-stone-300',
  },
  celebration: {
    id: 'celebration',
    name: 'CELEBRATION',
    subtitle: 'The Birthday Night',
    tagline: 'A high-energy luxury birthday celebration.',
    coreIdea: 'A premium energetic birthday celebration with bold motion graphics and vivid highlights.',
    description: 'Dynamic, exciting, bold, and celebratory with punchy oversized display typography, vibrant particle energy, and luminous accents.',
    defaultTheme: {
      background: '#09090B',
      primary: '#EF4444',
      secondary: '#FFFFFF',
    },
    defaultCustomization: DEFAULT_CUSTOMIZATION.celebration,
    previewBadges: ['LIVE ENERGY', 'HIGH CONTRAST', 'DYNAMIC SPARKLE'],
    sampleHeading: { primary: 'CELEBRATE', secondary: 'TONIGHT' },
    fontClass: 'font-sans',
    headingFontClass: 'font-sans font-black tracking-tighter uppercase',
    cardBorderClass: 'border-[#27272A] hover:border-[var(--theme-primary)] shadow-zinc-950/60',
    badgeClass: 'bg-[#18181B] border-[#27272A] text-zinc-200',
  },
  elegance: {
    id: 'elegance',
    name: 'ELEGANCE',
    subtitle: 'The Luxury Edition',
    tagline: 'Timeless luxury and refined minimalism.',
    coreIdea: 'A luxury editorial magazine celebration with refined typography and spacious serenity.',
    description: 'Sophisticated, minimal, refined, and calm with generous negative space, ultra-thin hairline borders, and delicate silver-gold motes.',
    defaultTheme: {
      background: '#050505',
      primary: '#D4AF37',
      secondary: '#F3F4F6',
    },
    defaultCustomization: DEFAULT_CUSTOMIZATION.elegance,
    previewBadges: ['LUXURY EDITORIAL', 'HAIRLINE BORDERS', 'QUIET SILVER MOTES'],
    sampleHeading: { primary: 'THE LUXURY', secondary: 'EDITION' },
    fontClass: 'font-sans',
    headingFontClass: 'font-cinzel font-light tracking-[0.22em] uppercase',
    cardBorderClass: 'border-white/10 hover:border-[var(--theme-primary)]/40',
    badgeClass: 'bg-[#0A0A0A] border-white/10 text-neutral-300',
  },
};

export interface QuickPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  template: ExperienceTemplate;
  theme: ExperienceTheme;
  customization: ExperienceCustomization;
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'cinematic',
    name: 'CINEMATIC',
    subtitle: 'The Premiere Cut',
    description: 'Theatrical red premiere styling, bold cinematic typography, balanced glow, and widescreen framing.',
    template: 'cinema',
    theme: { background: '#080808', primary: '#E50914', secondary: '#FFFFFF' },
    customization: {
      mood: 'cinematic',
      accentIntensity: 'balanced',
      glowStyle: 'cinematic',
      borderStyle: 'cinematic',
      headingStyle: 'bold-cinematic',
      bodyStyle: 'clean',
      motionEnergy: 'cinematic',
      particleAtmosphere: 'cinematic',
      photoStyle: 'cinematic',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
  {
    id: 'emotional',
    name: 'EMOTIONAL',
    subtitle: 'Warm Keepsake Archive',
    description: 'Warm nostalgic tones, heartfelt serif typography, subtle ambient glow, and authentic polaroid memories.',
    template: 'memories',
    theme: { background: '#0C0A09', primary: '#F59E0B', secondary: '#F5F5F4' },
    customization: {
      mood: 'emotional',
      accentIntensity: 'subtle',
      glowStyle: 'subtle',
      borderStyle: 'thin',
      headingStyle: 'classic-serif',
      bodyStyle: 'editorial',
      motionEnergy: 'subtle',
      particleAtmosphere: 'minimal',
      photoStyle: 'polaroid',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
  {
    id: 'red-night',
    name: 'RED NIGHT',
    subtitle: 'Midnight Crimson Celebration',
    description: 'Deep midnight obsidian backdrop, rich crimson neon highlights, and cinematic 35mm film-strip storytelling.',
    template: 'celebration',
    theme: { background: '#070709', primary: '#EF4444', secondary: '#FFFFFF' },
    customization: {
      mood: 'energetic',
      accentIntensity: 'bold',
      glowStyle: 'cinematic',
      borderStyle: 'cinematic',
      headingStyle: 'bold-cinematic',
      bodyStyle: 'clean',
      motionEnergy: 'epic',
      particleAtmosphere: 'intense',
      photoStyle: 'film-strip',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
  {
    id: 'luxury',
    name: 'LUXURY',
    subtitle: 'Private Salon Edition',
    description: 'Champagne gold accents, refined luxury display serif, hairline border discipline, and spacious serenity.',
    template: 'elegance',
    theme: { background: '#050505', primary: '#D4AF37', secondary: '#F3F4F6' },
    customization: {
      mood: 'elegant',
      accentIntensity: 'subtle',
      glowStyle: 'subtle',
      borderStyle: 'thin',
      headingStyle: 'luxury',
      bodyStyle: 'minimal',
      motionEnergy: 'subtle',
      particleAtmosphere: 'minimal',
      photoStyle: 'editorial',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
  {
    id: 'epic',
    name: 'EPIC',
    subtitle: 'Grand Screen Panorama',
    description: 'High-contrast theatrical glow, monumental typography, intense energy, and immersive fullscreen visuals.',
    template: 'cinema',
    theme: { background: '#050508', primary: '#6366F1', secondary: '#FFFFFF' },
    customization: {
      mood: 'cinematic',
      accentIntensity: 'bold',
      glowStyle: 'cinematic',
      borderStyle: 'cinematic',
      headingStyle: 'bold-cinematic',
      bodyStyle: 'clean',
      motionEnergy: 'epic',
      particleAtmosphere: 'intense',
      photoStyle: 'fullscreen',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
  {
    id: 'memory-film',
    name: 'MEMORY FILM',
    subtitle: 'Celluloid Nostalgia',
    description: 'Warm amber projector dust, authentic 35mm celluloid film strip, and literary narrative pacing.',
    template: 'memories',
    theme: { background: '#0A0806', primary: '#D97706', secondary: '#FDFBF7' },
    customization: {
      mood: 'emotional',
      accentIntensity: 'balanced',
      glowStyle: 'subtle',
      borderStyle: 'cinematic',
      headingStyle: 'modern-editorial',
      bodyStyle: 'editorial',
      motionEnergy: 'subtle',
      particleAtmosphere: 'cinematic',
      photoStyle: 'film-strip',
      heroFocus: 'auto',
      occasion: 'birthday',
    },
  },
];

export interface DerivedThemeTokens {
  background: string;
  primary: string;
  secondary: string;
  surface: string;
  surfaceHighlight: string;
  border: string;
  borderHighlight: string;
  body: string;
  muted: string;
  glow: string;
  glowStrong: string;
  isLightBg: boolean;
  accentMultiplier: number;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 8, g: 8, b: 8 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const val = v / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function deriveThemeTokens(
  templateId: ExperienceTemplate = 'cinema',
  theme?: Partial<ExperienceTheme>,
  customization?: Partial<ExperienceCustomization>
): DerivedThemeTokens {
  const defaultTheme = TEMPLATES[templateId]?.defaultTheme || TEMPLATES.cinema.defaultTheme;
  const background = theme?.background || defaultTheme.background;
  const primary = theme?.primary || defaultTheme.primary;
  const secondary = theme?.secondary || defaultTheme.secondary;

  const bgRgb = hexToRgb(background);
  const primRgb = hexToRgb(primary);
  const bgLum = getLuminance(background);
  const isLightBg = bgLum > 0.45;

  const accentIntensity = customization?.accentIntensity || 'balanced';
  const glowStyle = customization?.glowStyle || (templateId === 'cinema' || templateId === 'celebration' ? 'cinematic' : 'subtle');
  const borderStyle = customization?.borderStyle || (templateId === 'cinema' || templateId === 'celebration' ? 'cinematic' : 'thin');

  const accentMultiplier = accentIntensity === 'subtle' ? 0.6 : accentIntensity === 'bold' ? 1.4 : 1.0;

  // Derive intelligent accessible surfaces and supporting texts
  let surface: string;
  let surfaceHighlight: string;
  let body: string;
  let muted: string;
  let border: string;
  let borderHighlight: string;

  const borderAlpha = borderStyle === 'none' ? 0.04 : borderStyle === 'thin' ? 0.12 : 0.22 * accentMultiplier;
  const borderHighlightAlpha = borderStyle === 'none' ? 0.15 : Math.min(0.9, 0.5 * accentMultiplier);

  if (isLightBg) {
    surface = `rgba(${Math.max(0, bgRgb.r - 15)}, ${Math.max(0, bgRgb.g - 15)}, ${Math.max(0, bgRgb.b - 15)}, 0.95)`;
    surfaceHighlight = `rgba(${Math.max(0, bgRgb.r - 28)}, ${Math.max(0, bgRgb.g - 28)}, ${Math.max(0, bgRgb.b - 28)}, 0.95)`;
    body = '#18181B';
    muted = '#52525B';
    border = `rgba(0, 0, 0, ${borderAlpha})`;
    borderHighlight = `rgba(${primRgb.r}, ${primRgb.g}, ${primRgb.b}, ${borderHighlightAlpha})`;
  } else {
    const lift = Math.min(255, bgRgb.r + 14);
    const liftG = Math.min(255, bgRgb.g + 14);
    const liftB = Math.min(255, bgRgb.b + 14);
    surface = `rgb(${lift}, ${liftG}, ${liftB})`;
    surfaceHighlight = `rgb(${Math.min(255, lift + 12)}, ${Math.min(255, liftG + 12)}, ${Math.min(255, liftB + 12)})`;
    body = '#E4E4E7';
    muted = '#A1A1AA';
    border = `rgba(255, 255, 255, ${borderAlpha})`;
    borderHighlight = `rgba(${primRgb.r}, ${primRgb.g}, ${primRgb.b}, ${borderHighlightAlpha})`;
  }

  const glowAlpha = glowStyle === 'none' ? 0 : glowStyle === 'subtle' ? 0.12 * accentMultiplier : 0.28 * accentMultiplier;
  const glowStrongAlpha = glowStyle === 'none' ? 0 : glowStyle === 'subtle' ? 0.20 * accentMultiplier : 0.45 * accentMultiplier;

  const glow = `rgba(${primRgb.r}, ${primRgb.g}, ${primRgb.b}, ${glowAlpha})`;
  const glowStrong = `rgba(${primRgb.r}, ${primRgb.g}, ${primRgb.b}, ${glowStrongAlpha})`;

  return {
    background,
    primary,
    secondary,
    surface,
    surfaceHighlight,
    border,
    borderHighlight,
    body,
    muted,
    glow,
    glowStrong,
    isLightBg,
    accentMultiplier,
  };
}

export function getThemeCssVariables(tokens: DerivedThemeTokens): React.CSSProperties {
  return {
    backgroundColor: tokens.background,
    color: tokens.body,
    ['--theme-bg' as string]: tokens.background,
    ['--theme-primary' as string]: tokens.primary,
    ['--theme-secondary' as string]: tokens.secondary,
    ['--theme-surface' as string]: tokens.surface,
    ['--theme-surface-highlight' as string]: tokens.surfaceHighlight,
    ['--theme-border' as string]: tokens.border,
    ['--theme-border-highlight' as string]: tokens.borderHighlight,
    ['--theme-body' as string]: tokens.body,
    ['--theme-muted' as string]: tokens.muted,
    ['--theme-glow' as string]: tokens.glow,
    ['--theme-glow-strong' as string]: tokens.glowStrong,
  } as React.CSSProperties;
}

export function getHeroFocusStyle(focus: HeroFocus = 'auto'): React.CSSProperties {
  switch (focus) {
    case 'top':
      return { objectPosition: '50% 15%' };
    case 'bottom':
      return { objectPosition: '50% 85%' };
    case 'left':
      return { objectPosition: '15% 50%' };
    case 'right':
      return { objectPosition: '85% 50%' };
    case 'center':
    case 'auto':
    default:
      return { objectPosition: '50% 50%' };
  }
}

export function getHeadingFontClass(
  style?: HeadingStyle,
  template?: ExperienceTemplate
): string {
  if (style) {
    switch (style) {
      case 'classic-serif':
        return 'font-serif font-bold tracking-normal';
      case 'modern-editorial':
        return 'font-sans font-extrabold tracking-tight uppercase';
      case 'bold-cinematic':
        return 'font-cinzel font-black tracking-tight uppercase';
      case 'luxury':
        return 'font-cinzel font-light tracking-[0.24em] uppercase';
    }
  }

  // Fallback to template default
  const tpl = template || 'cinema';
  return TEMPLATES[tpl]?.headingFontClass || 'font-cinzel font-black tracking-tight uppercase';
}

export function getBodyFontClass(style?: BodyStyle): string {
  switch (style) {
    case 'editorial':
      return 'font-serif italic leading-relaxed';
    case 'minimal':
      return 'font-sans font-light tracking-wide text-xs sm:text-sm';
    case 'clean':
    default:
      return 'font-sans leading-relaxed text-sm';
  }
}

interface SplitHeadingProps {
  primaryPart: string;
  secondaryPart: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
  breakLine?: boolean;
}

export const SplitHeading: React.FC<SplitHeadingProps> = ({
  primaryPart,
  secondaryPart,
  className = '',
  as = 'h2',
  breakLine = false,
}) => {
  const Component = as;

  return (
    <Component className={`leading-[1.1] ${className}`}>
      <span
        style={{ color: 'var(--theme-primary, #E50914)' }}
        className="transition-colors duration-300"
      >
        {primaryPart}
      </span>
      {breakLine ? <br /> : ' '}
      <span
        style={{ color: 'var(--theme-secondary, #FFFFFF)' }}
        className="transition-colors duration-300"
      >
        {secondaryPart}
      </span>
    </Component>
  );
};
