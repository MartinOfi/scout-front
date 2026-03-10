# Scout Frontend Design System

## Direction & Feel

**Domain:** Scout group financial management (Argentina). Administrators and leaders (educadores) managing community finances, members, camps, and events.

**Feel:** Warm, approachable, community-oriented. Forms feel like a modern digital logbook — inviting rather than corporate. Inputs are slightly recessed with subtle warmth, not sterile.

**Signature:** Logbook-inspired inputs with warm stone backgrounds, burgundy brand focus states, and subtle inset shadows that feel handmade yet modern.

## Color Palette

### Brand Colors
- **Burgundy:** `#812128` (primary brand, focus states, primary buttons)
- **Burgundy Light:** `#a33a42` (hover states)
- **Indigo:** `#242167` (secondary brand, accents)
- **Indigo Light:** `#3a378a`
- **Amber:** `#f4a261` (warmth accent)

### Stone Scale (Warm Grays)
- `stone-50`: `#fafaf9` — Input backgrounds
- `stone-100`: `#f5f5f4` — Page backgrounds
- `stone-200`: `#e7e5e4` — Borders, dividers
- `stone-300`: `#d6d3d1` — Input borders
- `stone-400`: `#a8a29e` — Placeholder text
- `stone-500`: `#78716c` — Secondary text, hints
- `stone-600`: `#57534e` — Medium emphasis text
- `stone-700`: `#44403c` — Labels, body text
- `stone-800`: `#292524` — Input values, emphasis
- `stone-900`: `#1c1917` — Headings

### Semantic Colors
- **Error:** `#dc2626` (red)
- **Error Light:** `#fef2f2`
- **Success:** `#059669` (green)
- **Success Light:** `#ecfdf5`

## Depth Strategy

**Approach:** Subtle inset for inputs (slightly darker background than surface) + soft shadows on containers.

- **Inputs:** `inset 0 1px 2px rgba(0, 0, 0, 0.05)` — inputs feel recessed
- **Focus:** `0 0 0 3px rgba(129, 33, 40, 0.15)` — burgundy glow
- **Cards:** `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)` — whisper-quiet elevation

## Spacing Base

**Base unit:** 4px (spacing-xs)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Input padding:** 14px horizontal, 12px vertical
**Label margin:** 8px bottom
**Field margin:** 20px bottom

## Typography

**Fonts:** Inter (body), Inter Tight (headings) — already defined in global styles.

### Labels
- Size: 14px
- Weight: 500
- Color: stone-700
- Letter-spacing: 0.01em

### Input Values
- Size: 15px
- Weight: 400
- Color: stone-800

### Hints
- Size: 13px
- Weight: 400
- Color: stone-500

### Errors
- Size: 13px
- Weight: 500
- Color: #dc2626

## Border Radius Scale

- **Inputs:** 10px (softer, approachable)
- **Cards:** 16px (generous, friendly)
- **Checkboxes:** 6px
- **Buttons:** 8px

## Transitions

- **Fast:** 150ms ease (hover, focus)
- **Base:** 200ms ease (transitions)

## Component Patterns

### Inputs
- Background: stone-50 (slightly recessed)
- Border: 1.5px solid stone-300
- Hover: border-color stone-400, bg white
- Focus: border-color burgundy, burgundy ring shadow
- Placeholder: stone-400

### Checkboxes
- Size: 20px
- Border-radius: 6px
- Checked: burgundy background with white checkmark

### Form Container
- Page background: stone-100
- Card: white with 16px radius, subtle shadow
- Header: 24px padding
- Body: 28px horizontal, 28px vertical (comfortable)

### Form Actions
- Background: stone-50
- Border-top: 1px solid stone-200
- Padding: 20px 28px 28px
- Primary button: burgundy background
- Secondary button: white with stone-300 border

## Token File Location

`src/app/shared/components/form/_form-tokens.scss`

Contains all SCSS variables and mixins for form components.
