/**
 * HextechIcons — SVG Icon System
 * Design: "Magic Powered Machine" (Art Déco / Hextech)
 *
 * Geometric language:
 *  • Square  → Structure / role containers (metal shell)
 *  • Diamond → Accent / state change markers
 *  • Circle  → Immediate-action focal points (magic core)
 *
 * Color duality:
 *  • Gold  → Metal spectrum (utility, navigation, structure)
 *  • Blue  → Magic spectrum (interaction focal points, urgency)
 */

import React from 'react';

const defaults = {
    width: 16,
    height: 16,
    fill: 'currentColor',
    strokeWidth: 0,
};

// ─── Role Icons (Square frame = structural / lane position) ───────────────

/** TOP — Shield with angular top-cut Art Deco */
export function IconTop({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            {/* Outer square frame (metal) */}
            <rect x="1" y="1" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Diamond accent center */}
            <rect x="7" y="7" width="6" height="6" rx="0" transform="rotate(45 10 10)" fill="currentColor" opacity="0.3" />
            {/* Sword / top lane glyph */}
            <line x1="10" y1="3" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="8" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.6" />
        </svg>
    );
}

/** JUNGLE — Hexagonal / organic circular element */
export function IconJungle({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            {/* Circle = focal organic element */}
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Inner hex points (jungle camps) */}
            <polygon
                points="10,3 16,6.5 16,13.5 10,17 4,13.5 4,6.5"
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"
            />
            {/* Leaf / paw glyph */}
            <circle cx="10" cy="10" r="2.5" fill="currentColor" />
            <line x1="10" y1="7.5" x2="10" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10" y1="7.5" x2="7.2" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
            <line x1="10" y1="7.5" x2="12.8" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        </svg>
    );
}

/** MID — Lightning bolt centered in square */
export function IconMid({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="1" y="1" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Lightning bolt */}
            <polyline
                points="12,2 7,11 11,11 8,18"
                stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"
                fill="none"
            />
        </svg>
    );
}

/** ADC — Arrow / crossbow bolt in square */
export function IconADC({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="1" y="1" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Arrow shaft */}
            <line x1="3" y1="17" x2="15" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            {/* Arrowhead */}
            <polyline points="9,4 16,4 16,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" />
            {/* Fletching */}
            <line x1="3" y1="17" x2="3" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="square" />
            <line x1="3" y1="17" x2="7" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="square" />
        </svg>
    );
}

/** SUPPORT — Shield with inner circle (protection focal point) */
export function IconSupport({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            {/* Shield polygonal (Art Deco angular shield) */}
            <path
                d="M10 2 L17 5 L17 11 Q17 16 10 18 Q3 16 3 11 L3 5 Z"
                stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"
            />
            {/* Circle = protection focal point */}
            <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
            <circle cx="10" cy="10" r="1.2" fill="currentColor" />
        </svg>
    );
}

// ─── Action Icons (Circle = immediate interaction / magic) ────────────────

/** EDIT — Pencil with diamond accent */
export function IconEdit({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M5 14 L7 15 L14 6 L12 4 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />
            <line x1="5" y1="14" x2="7" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="12" y1="4" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="4" y1="15.5" x2="8" y2="15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" opacity="0.6" />
        </svg>
    );
}

/** DELETE — X inside circle */
export function IconDelete({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            <line x1="6" y1="6" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <line x1="14" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
    );
}

/** SAVE — Floppy / downward diamond */
export function IconSave({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="2" y="2" width="16" height="16" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="5" y="2" width="10" height="6" rx="0" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <rect x="6" y="11" width="8" height="7" rx="0" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <line x1="8" y1="3.5" x2="8" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="square" />
            <line x1="11" y1="3.5" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
    );
}

/** EXPORT — Arrow up-right from square */
export function IconExport({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="2" y="8" width="10" height="10" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="11" y1="9" x2="18" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <polyline points="13,2 18,2 18,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" />
        </svg>
    );
}

/** CLIPBOARD / COPY */
export function IconClipboard({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="5" y="3" width="12" height="15" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="3" y="5" width="12" height="15" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
            <line x1="7" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.7" />
            <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.7" />
            <line x1="7" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.5" />
        </svg>
    );
}

/** COMPOSITIONS — Sword crossed square (tab icon) */
export function IconCompositions({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="1" y="1" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Cross-swords motif */}
            <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            {/* Corner accents (Art Deco) */}
            <rect x="1" y="1" width="3" height="3" fill="currentColor" opacity="0.6" />
            <rect x="16" y="1" width="3" height="3" fill="currentColor" opacity="0.6" />
            <rect x="1" y="16" width="3" height="3" fill="currentColor" opacity="0.6" />
            <rect x="16" y="16" width="3" height="3" fill="currentColor" opacity="0.6" />
        </svg>
    );
}

/** ARCHETYPES — Diamond lattice (pattern / puzzle) */
export function IconArchetypes({ size = 16, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            {/* Large diamond */}
            <rect x="4" y="4" width="12" height="12" rx="0"
                transform="rotate(45 10 10)"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Inner diamond */}
            <rect x="7" y="7" width="6" height="6" rx="0"
                transform="rotate(45 10 10)"
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
            {/* Center point */}
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>
    );
}

/** GOOD vs — Check in circle */
export function IconGood({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <polyline points="5,10 9,14 15,6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
        </svg>
    );
}

/** BAD vs — X in circle */
export function IconBad({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="6" y1="6" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <line x1="14" y1="6" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
    );
}

/** DIFFICULTY — Gear / cog (hexagonal) */
export function IconDifficulty({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Gear teeth (8 teeth as short lines radiating from center) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 10 + Math.cos(rad) * 5;
                const y1 = 10 + Math.sin(rad) * 5;
                const x2 = 10 + Math.cos(rad) * 8.5;
                const y2 = 10 + Math.sin(rad) * 8.5;
                return (
                    <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                );
            })}
        </svg>
    );
}

/** FOCUS — Diamond crosshair */
export function IconFocus({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            {/* Diamond */}
            <rect x="6" y="6" width="8" height="8" transform="rotate(45 10 10)"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Crosshair lines */}
            <line x1="10" y1="1" x2="10" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="10" y1="15" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="1" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="15" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            {/* Center pip */}
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        </svg>
    );
}

/** POOL — Grid of 4 squares (champion pool) */
export function IconPool({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="2" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="11" y="2" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <rect x="2" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <rect x="11" y="11" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
        </svg>
    );
}

/** EXAMPLES — Open book (horizontal lines in rectangle) */
export function IconExamples({ size = 14, className = '', style = {} }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 20 20"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className={className} style={style}
        >
            <rect x="2" y="3" width="16" height="14" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.5" strokeLinecap="square" />
            <line x1="4" y1="7" x2="8" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.8" />
            <line x1="4" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.6" />
            <line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.4" />
            <line x1="12" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.7" />
            <line x1="12" y1="10.5" x2="16" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.5" />
        </svg>
    );
}

// ─── Convenience export map ───────────────────────────────────────────────

export const ROLE_ICON_MAP = {
    top: IconTop,
    jungle: IconJungle,
    mid: IconMid,
    adc: IconADC,
    support: IconSupport,
    all: IconGlobe,
};

/** Renders the correct role icon component */
export function RoleIcon({ role, size = 14, className = '', style = {} }) {
    const Icon = ROLE_ICON_MAP[role];
    if (!Icon) return null;
    return <Icon size={size} className={className} style={style} />;
}

// ─── Navigation / Dashboard Icons ─────────────────────────────────────────

/** HOME — House in Art Deco square frame */
export function IconHome({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            <rect x="1" y="1" width="18" height="18" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
            <polyline points="2,10 10,3 18,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" fill="none" />
            <path d="M5 10 L5 18 L15 18 L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" fill="none" />
            <rect x="8" y="13" width="4" height="5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
        </svg>
    );
}

/** SWORD / DRAFT — Single sword (titlebar / nav icon) */
export function IconSword({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Blade */}
            <line x1="10" y1="2" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            {/* Guard */}
            <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            {/* Handle */}
            <line x1="10" y1="15" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.7" />
            {/* Pommel */}
            <rect x="8.5" y="17.5" width="3" height="1.5" fill="currentColor" opacity="0.8" />
            {/* Fuller */}
            <line x1="10" y1="4" x2="10" y2="11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="square" opacity="0.4" />
        </svg>
    );
}

/** TEAM BUILDER — Wrench over grid */
export function IconTeamBuilder({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Square grid (5 slots) */}
            <rect x="1" y="1" width="18" height="18" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
            <line x1="7" y1="1" x2="7" y2="19" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="13" y1="1" x2="13" y2="19" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            {/* Wrench handle */}
            <line x1="6" y1="14" x2="14" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            {/* Wrench head circle */}
            <circle cx="14" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="6" cy="14" r="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" />
        </svg>
    );
}

/** ROSTER — Two vertical rectangles (team/people) */
export function IconRoster({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Three player columns */}
            <rect x="2" y="5" width="4" height="13" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="8" y="3" width="4" height="15" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="14" y="5" width="4" height="13" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
            {/* Heads (circles) */}
            <circle cx="4" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="10" cy="1" r="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="16" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.8" />
        </svg>
    );
}

/** WIN RATE CHART — Bar chart with diagonal accent */
export function IconWinRate({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Grid border */}
            <rect x="1" y="1" width="18" height="18" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
            {/* Bars */}
            <rect x="3" y="12" width="3" height="6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
            <rect x="8" y="7" width="3" height="11" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.8" />
            <rect x="13" y="3" width="3" height="15" stroke="currentColor" strokeWidth="1.2" fill="currentColor" opacity="0.3" />
            <rect x="13" y="3" width="3" height="15" stroke="currentColor" strokeWidth="1.2" fill="none" />
            {/* Trend line */}
            <polyline points="4.5,14 9.5,9 14.5,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" opacity="0.7" />
        </svg>
    );
}

/** IMPORT — Arrow pointing down into box */
export function IconImport({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Box */}
            <path d="M3 12 L3 18 L17 18 L17 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" fill="none" />
            {/* Arrow down */}
            <line x1="10" y1="2" x2="10" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <polyline points="6,9 10,14 14,9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
        </svg>
    );
}

/** TROPHY / SOLOQ — Cup with diamond accent */
export function IconTrophy({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            <path d="M5 2 L15 2 L15 10 Q15 16 10 17 Q5 16 5 10 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="2" y1="2" x2="5" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="15" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <path d="M2 2 Q2 7 5 9" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M18 2 Q18 7 15 9" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
            <line x1="10" y1="17" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="7" y1="19" x2="13" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            {/* Diamond accent */}
            <rect x="8" y="6" width="4" height="4" transform="rotate(45 10 8)" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
    );
}

/** FLEX QUEUE — Two overlapping diamonds */
export function IconFlex({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            <rect x="4" y="4" width="12" height="12" rx="0" transform="rotate(45 10 10)"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="6" y="6" width="8" height="8" rx="0" transform="rotate(45 10 10)"
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
    );
}

/** GLOBE / ALL ROLES — Circle with latitude/longitude lines */
export function IconGlobe({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <ellipse cx="10" cy="10" rx="4" ry="8.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            <line x1="1.5" y1="10" x2="18.5" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.5" />
            <line x1="3" y1="5.5" x2="17" y2="5.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="square" opacity="0.3" />
            <line x1="3" y1="14.5" x2="17" y2="14.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="square" opacity="0.3" />
        </svg>
    );
}

/** GAME / WAITING — Controller / crystal arrangement */
export function IconGame({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Hextech crystal shape */}
            <polygon points="10,2 17,6 17,14 10,18 3,14 3,6"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Inner diamond */}
            <polygon points="10,5 14,10 10,15 6,10"
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
            {/* Center circle (magic core) */}
            <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.8" />
            {/* Glow rays */}
            <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
    );
}

/** EMPTY INBOX — Square with downward line (no data) */
export function IconEmptyInbox({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            <rect x="2" y="6" width="16" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M2 13 L7 13 L8 15 L12 15 L13 13 L18 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" fill="none" />
            <line x1="10" y1="2" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.5" />
            <line x1="7" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity="0.4" />
        </svg>
    );
}

/** WARNING — Triangle with inner exclamation (danger / out-of-meta) */
export function IconWarning({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Triangle */}
            <polygon points="10,2 19,17 1,17" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />
            {/* Bang */}
            <line x1="10" y1="8" x2="10" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            <rect x="9" y="14.5" width="2" height="1.8" fill="currentColor" rx="0" />
        </svg>
    );
}

/** INSIGHT — Diamond outer frame with inner circle (lightbulb replacement) */
export function IconInsight({ size = 16, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Outer diamond */}
            <polygon points="10,1 19,10 10,19 1,10"
                stroke="currentColor" strokeWidth="1.5" fill="none" />
            {/* Inner diamond */}
            <polygon points="10,5 15,10 10,15 5,10"
                stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
            {/* Center circle — the "idea" */}
            <circle cx="10" cy="10" r="2.5" fill="currentColor" opacity="0.9" />
            {/* 4 axis accents */}
            <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.6" />
            <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" opacity="0.6" />
        </svg>
    );
}
