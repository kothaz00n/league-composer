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

// ────────────────────────────────────────────────────────────────────────
// ELABORATE STITCH-STYLE DASHBOARD ICONS
// ────────────────────────────────────────────────────────────────────────

/** TEAM BUILDER — Intricate magic circle and gears */
export function IconTeamBuilderDashboard({ size = 100, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Outer Runic Circle */}
            <circle cx="50" cy="50" r="42" stroke="#0ac8b9" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
            <circle cx="50" cy="50" r="38" stroke="#0397ab" strokeWidth="1" opacity="0.6" />
            {/* Octagram / Star lines */}
            <path d="M50 8 L50 92 M8 50 L92 50 M20 20 L80 80 M20 80 L80 20" stroke="#0ac8b9" strokeWidth="1.5" opacity="0.3" />
            {/* Outer floating diamonds */}
            {[...Array(8)].map((_, i) => (
                <rect key={i} x="48" y="2" width="4" height="4" fill="#0ac8b9" transform={`rotate(${i * 45} 50 50)`} />
            ))}
            {/* Background Gear */}
            <circle cx="50" cy="50" r="28" stroke="#c8aa6e" strokeWidth="3" opacity="0.9" />
            <circle cx="50" cy="50" r="22" stroke="#c8aa6e" strokeWidth="1" opacity="0.5" />
            {[...Array(8)].map((_, i) => (
                <path key={`gear${i}`} d="M46 18 L54 18 L52 24 L48 24 Z" fill="#c8aa6e" transform={`rotate(${i * 45} 50 50)`} />
            ))}
            {/* Inner mechanism */}
            <circle cx="50" cy="50" r="14" stroke="#0ac8b9" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#0397ab" opacity="0.8" />
            <circle cx="50" cy="50" r="4" fill="#0ac8b9" />
            {/* Magical nodes */}
            <circle cx="50" cy="15" r="5" stroke="#c8aa6e" strokeWidth="1.5" />
            <path d="M48 15 L50 12 L52 15 L50 18 Z" fill="#0ac8b9" />
            <circle cx="50" cy="85" r="5" stroke="#c8aa6e" strokeWidth="1.5" />
            <path d="M48 85 L50 82 L52 85 L50 88 Z" fill="#0ac8b9" />
            <circle cx="15" cy="50" r="5" stroke="#c8aa6e" strokeWidth="1.5" />
            <path d="M15 48 L18 50 L15 52 L12 50 Z" fill="#0ac8b9" />
            <circle cx="85" cy="50" r="5" stroke="#c8aa6e" strokeWidth="1.5" />
            <path d="M85 48 L88 50 L85 52 L82 50 Z" fill="#0ac8b9" />
        </svg>
    );
}

/** ROSTER — Golden scroll with champion slots */
export function IconRosterDashboard({ size = 100, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Scroll Background */}
            <path d="M20 25 Q20 20 25 20 L75 20 Q80 20 80 25 L80 80 Q80 85 75 85 L25 85 Q20 85 20 80 Z"
                fill="#f0e6d2" stroke="#c8aa6e" strokeWidth="2" opacity="0.85" />
            {/* Scroll Roll Top */}
            <ellipse cx="25" cy="20" rx="8" ry="4" fill="#d4c29c" stroke="#785a28" strokeWidth="1.5" />
            <ellipse cx="75" cy="20" rx="8" ry="4" fill="#d4c29c" stroke="#785a28" strokeWidth="1.5" />
            <path d="M17 20 L83 20" stroke="#785a28" strokeWidth="2" />
            {/* Scroll Roll Bottom */}
            <ellipse cx="25" cy="85" rx="8" ry="4" fill="#d4c29c" stroke="#785a28" strokeWidth="1.5" />
            <ellipse cx="75" cy="85" rx="8" ry="4" fill="#d4c29c" stroke="#785a28" strokeWidth="1.5" />
            <path d="M17 85 L83 85" stroke="#785a28" strokeWidth="2" />

            {/* Crown */}
            <path d="M40 10 L45 15 L50 5 L55 15 L60 10 L58 20 L42 20 Z" fill="#c8aa6e" stroke="#785a28" strokeWidth="1" />

            {/* Portraits Lines */}
            <circle cx="40" cy="40" r="12" fill="#ff4e50" stroke="#c8aa6e" strokeWidth="2" opacity="0.8" />
            <circle cx="60" cy="40" r="12" fill="#0ac8b9" stroke="#c8aa6e" strokeWidth="2" opacity="0.8" />
            <circle cx="50" cy="65" r="12" fill="#cc33ff" stroke="#c8aa6e" strokeWidth="2" opacity="0.8" />

            <path d="M35 38 L45 42 M40 35 L40 45" stroke="#fff" strokeWidth="1" opacity="0.5" />
            <path d="M55 38 L65 42 M60 35 L60 45" stroke="#fff" strokeWidth="1" opacity="0.5" />
            <path d="M45 63 L55 67 M50 60 L50 70" stroke="#fff" strokeWidth="1" opacity="0.5" />

            {/* Little Deco Stars */}
            <path d="M12 40 L15 45 L11 43 Z" fill="#0ac8b9" />
            <path d="M85 60 L88 65 L84 63 Z" fill="#0ac8b9" />
        </svg>
    );
}

/** WIN RATES — Glowing chart with arrow */
export function IconWinRateDashboard({ size = 100, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Axes */}
            <path d="M15 15 L15 85 L85 85" stroke="#c8aa6e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 80 L20 80 M10 60 L15 60 M10 40 L15 40 M10 20 L15 20" stroke="#785a28" strokeWidth="2" />

            {/* Bar 1 */}
            <rect x="25" y="55" width="10" height="30" fill="#0397ab" rx="2">
                <animate attributeName="height" values="10;30;20;30" dur="3s" repeatCount="indefinite" />
                <animate attributeName="y" values="75;55;65;55" dur="3s" repeatCount="indefinite" />
            </rect>
            {/* Bar 2 */}
            <rect x="40" y="35" width="10" height="50" fill="#c8aa6e" rx="2">
                <animate attributeName="height" values="20;50;40;50" dur="4s" repeatCount="indefinite" />
                <animate attributeName="y" values="65;35;45;35" dur="4s" repeatCount="indefinite" />
            </rect>
            {/* Bar 3 */}
            <rect x="55" y="60" width="10" height="25" fill="#9933ff" rx="2">
                <animate attributeName="height" values="15;25;35;25" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="y" values="70;60;50;60" dur="2.5s" repeatCount="indefinite" />
            </rect>
            {/* Bar 4 */}
            <rect x="70" y="25" width="10" height="60" fill="#0ac8b9" rx="2">
                <animate attributeName="height" values="30;60;45;60" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="y" values="55;25;40;25" dur="3.5s" repeatCount="indefinite" />
            </rect>

            {/* Glowing Arrow Trendline */}
            <path d="M22 65 L40 40 L55 55 L75 25" stroke="#0ac8b9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                filter="drop-shadow(0 0 4px #0ac8b9)" />
            <path d="M75 25 L65 25 M75 25 L75 35" stroke="#0ac8b9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                filter="drop-shadow(0 0 4px #0ac8b9)" />

            {/* Magic Sparkles */}
            <path d="M20 30 L23 35 L20 38 L17 35 Z" fill="#fff" opacity="0.8" filter="drop-shadow(0 0 2px #fff)" />
            <path d="M80 50 L82 53 L80 55 L78 53 Z" fill="#fff" opacity="0.8" filter="drop-shadow(0 0 2px #fff)" />
            <path d="M50 15 L54 22 L50 28 L46 22 Z" fill="#0ac8b9" opacity="0.6" />
        </svg>
    );
}

/** COMPOSITIONS — Book with a quill */
export function IconCompositionsDashboard({ size = 100, className = '', style = {} }) {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
            xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
            {/* Book Cover / Pages */}
            <path d="M50 85 L20 75 L20 35 L50 45 L80 35 L80 75 Z" fill="#d4c29c" stroke="#785a28" strokeWidth="2" />
            <path d="M50 85 L20 75 L20 30 L50 40 L80 30 L80 75" fill="#f0e6d2" stroke="#c8aa6e" strokeWidth="2" />
            {/* Spine */}
            <path d="M50 40 L50 85" stroke="#785a28" strokeWidth="3" strokeLinecap="round" />
            <path d="M48 42 L48 83 M52 42 L52 83" stroke="#f0e6d2" strokeWidth="1" />

            {/* Magical Page content */}
            <path d="M30 46 L42 50 M30 52 L42 56 M30 58 L38 61" stroke="#a09b8c" strokeWidth="2" strokeLinecap="round" />
            {/* Right page runic emblem */}
            <circle cx="65" cy="55" r="8" stroke="#0ac8b9" strokeWidth="2" fill="none" />
            <circle cx="65" cy="55" r="4" fill="#0397ab" />

            {/* Blue Quill */}
            <path d="M80 15 C70 15, 60 30, 45 60 L40 70 L47 62 C65 50, 85 40, 80 15 Z" fill="#0ac8b9" stroke="#0397ab" strokeWidth="1" />
            <path d="M80 15 C75 25, 70 40, 45 60" stroke="#0397ab" strokeWidth="2" />
            <path d="M70 25 L80 30 M65 35 L75 42 M55 45 L65 55" stroke="#0397ab" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

            {/* Feather glow */}
            <circle cx="42" cy="68" r="3" fill="#fff" filter="drop-shadow(0 0 4px #0ac8b9)" />
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
