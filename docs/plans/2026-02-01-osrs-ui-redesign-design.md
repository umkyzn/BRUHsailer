# OSRS-Themed UI Redesign - Design Document

**Date:** 2026-02-01
**Status:** Approved
**Author:** Design brainstorming session

## Executive Summary

Complete UI overhaul of BRUHsailer to address navigation and readability pain points while creating a distinctive Old School RuneScape-themed aesthetic with modern UX patterns.

## Problem Statement

Current UI has two critical usability issues:
1. **Navigation is hard to use** - Finding and moving between sections/chapters is confusing
2. **Steps are hard to read** - Individual step cards and content formatting make information difficult to parse

## Design Goals

- Create intuitive, compact navigation system
- Improve step readability with clear visual hierarchy
- Infuse OSRS aesthetic (pixel fonts, skill icons, game sprites) throughout
- Maintain modern UX patterns (smooth animations, responsive design, keyboard shortcuts)
- Preserve existing functionality and data structures

## Core Vision

Transform BRUHsailer into a visually distinctive OSRS-themed progress tracker that **feels like playing RuneScape** while maintaining modern web UX patterns. Balance nostalgia with usability.

---

## Visual Language

### Color Palette

**Light Mode:**
- Base: OSRS game window colors (brown/tan stone textures, medieval parchment)
- Accent: Classic OSRS UI gold (`#FFD700`) for highlights and active states
- Skills: Authentic OSRS skill colors (green for Woodcutting, red for Attack, etc.)
- Progress: Gold fill for completion states

**Dark Mode (OSRS Night Theme):**
- Background: Deep blue-grey stone texture (Lumbridge at night)
- Cards: Darker brown/slate panels
- Text: Cream/tan (high contrast)
- Accent gold: Brighter/more saturated for visibility
- Skill icons: Alternate sprite sheet with better contrast
- Progress orbs: Enhanced glowing effect

**Transitions:**
- 300ms ease between light/dark modes
- Respects `prefers-reduced-motion`

### Typography

**Primary Font:** Pixel/bitmap webfont (RuneScape UF or Old School RuneScape)
- Headers, UI labels, navigation
- Self-hosted WOFF2 format
- `font-display: swap` to prevent layout shift

**Fallback:** System monospace fonts for accessibility
- Ensures readability if pixel font fails to load
- Similar x-height to maintain layout consistency

**Text Sizes:** Scaled appropriately so pixel fonts remain readable on modern displays

### Icons & Sprites

**Skill Icons:**
- Actual OSRS skill icons for metadata badges
- GP = coins icon
- Time = clock/timer icon
- Items = inventory bag icon
- Requirements = quest point star or skill icons

**Progress Indicators:**
- OSRS-style checkboxes or quest point star icons
- Gold checkmark with particle effect on completion

**Navigation Icons:**
- Custom pixel-art icons representing chapter themes
- Progress rings around chapter icons showing % complete

**UI Elements:**
- OSRS arrow sprites for collapse/expand toggles
- Stone texture backgrounds for panels
- Medieval border patterns for cards

---

## Layout Architecture

### Navigation System: Compact Left Sidebar

#### Collapsed State (Default)
- **Width:** 64px
- **Content:** Chapter numbers/icons only as pixel-art badges
- **Active State:** Highlighted with OSRS gold glow
- **Progress:** Ring around each icon showing % complete
- **Toggle:** Collapse/expand button at bottom (OSRS arrow sprite)

#### Expanded State (Hover or Click)
- **Width:** 280px
- **Animation:** Smooth slide-out (200ms ease-out)
- **Chapter Display:** Icon + name beside it
- **Section List:** Appears under active chapter with indentation
- **Section Progress:** Mini indicator showing "3/12 steps"
- **Current Section:** OSRS-style selection border highlight

#### Key Interactions
- **Click chapter icon:** Expands sidebar + jumps to first incomplete section
- **Click section:** Navigates to section + auto-collapses sidebar after brief delay
- **Keyboard:**
  - Number keys `1-9` jump to chapters
  - Arrow keys navigate sections
  - `J/K` next/previous section (vim-style)
- **Mobile:** Swipe from left edge opens, tap outside closes

### Main Content Area: Single-Section Focus

#### Section Header
- **Layout:** Full-width banner with OSRS stone texture background
- **Title:** Large pixel font
- **Progress Stats:** OSRS-style "orbs" (circular indicators like HP/Prayer orbs)
  - Orb 1: Steps completed (fills clockwise with gold)
  - Orb 2: Time invested (fills with blue)
  - Orb 3: GP accumulated (fills with green)
- **Quick Stats:** Steps completed, estimated time remaining, GP earned so far
- **Hover:** Tooltip shows exact numbers in OSRS chatbox style

#### Overall Progress Bar
- **Location:** Top of page, slim horizontal bar
- **Style:** OSRS XP bar aesthetic
- **Segmentation:** Different color per chapter
- **Animation:** Smooth fill when steps complete
- **Hover:** Shows percentage

#### Step Cards

**Card Structure:**
- Styled like OSRS inventory slots or quest journal entries
- Visual hierarchy:
  1. Left edge: Large custom checkbox
  2. Header: Step number + collapsible toggle
  3. Content: Main instructions with OSRS text styling
  4. Footer: Metadata badges with skill icons

**Checkbox:**
- Unchecked: Empty box with OSRS border
- Checked: Gold checkmark with particle effect (XP drop style)
- Size: Large, touch-friendly (48x48px minimum on mobile)

**Card States:**
- Default: Collapsed, shows first 2 lines + metadata
- Expanded: Full content, nested steps, footnotes visible
- Completed: Slight transparency + gold border
- Hover: Subtle lift + glow effect (modern interaction)

**Metadata Badges:**
- Use actual OSRS skill icons
- Display: GP, time, items needed, requirements
- Layout: Horizontal row in card footer
- Responsive: Wrap to multiple lines on mobile

**Nested Content:**
- Left border in OSRS skill colors
- Indented with dotted connector lines (quest tree style)
- Multi-level: Different accent color per level (melee/range/mage colors)

---

## Interactions & Animations

### Step Card Interactions

**Checkbox Behavior:**
- Click: Scale animation + gold particle burst (OSRS XP drop effect)
- Toast: Bottom-right OSRS-style game message ("Step completed! +2h 15m")
- Undo: Small button in toast, visible for 5 seconds
- Keyboard: Space bar toggles when card is focused

**Expand/Collapse:**
- Default: First 2 lines visible
- Click anywhere (except checkbox): Smooth height expansion
- Icon: OSRS arrow sprite rotates when expanded
- Animation: 200ms ease-out, respects `prefers-reduced-motion`

**Toast Notifications:**
- Style: OSRS chat message box
- Position: Bottom-right corner
- Duration: 3 seconds, 5 seconds with undo button
- Animation: Slide up from bottom with fade-in

### Keyboard Shortcuts

**Enhanced Navigation:**
- `1-9`: Jump to chapter
- `J/K`: Next/previous section (vim-style)
- `Space`: Toggle current step checkbox
- `Cmd+K` / `Ctrl+K`: Command palette (existing)
- `/`: Focus search (existing)
- `N/P`: Next/prev incomplete step (new)
- `Shift+Enter`: Mark all visible steps complete (batch action)

**Visual Feedback:**
- Tooltips: OSRS-style on hover showing shortcuts
- Focus ring: Styled like OSRS selection borders
- Active state: Gold glow on focused element

### Animation Details

**Completion Effect:**
- Checkbox: Scale 1.0 → 1.2 → 1.0 with bounce easing
- Particles: 5-8 gold sparkles emanating from checkbox
- Card: Brief gold border pulse
- Progress bar: Smooth width transition over 300ms

**Transitions:**
- Sidebar expand/collapse: 200ms cubic-bezier ease-out
- Card expand/collapse: 200ms ease-out
- Hover effects: 150ms ease-in-out
- Page transitions: 250ms fade with slight vertical offset

---

## Responsive Design

### Mobile (< 768px)

**Navigation:**
- Sidebar becomes bottom sheet (slides up from bottom)
- Trigger: Hamburger menu in top-left (OSRS-styled)
- Format: Compact accordion for chapters/sections
- Gestures: Swipe left/right to navigate sections
- Progress: Orbs become horizontal pills at top

**Step Cards:**
- Full-width with reduced padding
- Metadata badges wrap to multiple lines
- Tap to expand (no hover)
- Checkbox: 48x48px minimum for touch
- Fixed "Mark Complete" button when expanded

### Tablet (768px - 1024px)

**Hybrid Layout:**
- Sidebar collapsed by default (icon-only)
- Step cards: 2-column grid when space allows
- Progress orbs: Full size maintained
- Touch-optimized but keeps hover for mouse/trackpad

### Desktop (> 1024px)

**Power User Features:**
- Sidebar can be pinned open (localStorage preference)
- Command palette shows keyboard shortcuts prominently
- Multi-step selection: Shift+click for range, batch mark complete
- Optional: Chapter progress minimap in sidebar (OSRS minimap inspired)

---

## Additional Features

### Search Enhancement
- Input: Styled as OSRS text field
- Real-time: Gold underline highlighting
- Counter: "3 of 47 steps match" in pixel font
- Navigation: Arrow keys cycle through results
- Scope: Includes metadata (GP, items, skill names)

### Filter Improvements
- Buttons: OSRS toggle button style
- Active state: Pressed-in appearance
- Hide completed: Fade-out with gold sparkle trail
- Persistence: Across sessions (already working)

### Loading States
- Spinner: OSRS spinning sword or skill cape
- Skeleton: Stone texture pattern while loading
- Errors: "Oh dear, you are dead" style message box

### Accessibility
- High contrast mode option (beyond dark mode)
- Screen reader: Progress update announcements
- Focus indicators: Clear gold outline
- Font fallbacks: Similar x-height to pixel fonts
- Icon labels: All icons have aria-labels
- Skip link: Keyboard users can skip to content

---

## Technical Implementation

### Asset Sourcing

**Fonts:**
- RuneScape UF or Old School RuneScape webfont
- Self-hosted WOFF2 format
- `font-display: swap`
- Fallback: System monospace

**Sprites & Icons:**
- OSRS Wiki skill icons (Creative Commons)
- Custom sprite sheets for UI elements
- SVG for scalability, PNG for pixel art authenticity
- Storage: `/public/assets/osrs/`

**Textures:**
- Stone/parchment CSS background patterns
- WebP format with PNG fallback
- Repeatable patterns for performance

### CSS Architecture

**Design Tokens:**
- Extend existing CSS custom properties in `styles.css`
- New tokens:
  - `--osrs-gold: #FFD700`
  - `--osrs-stone-light`, `--osrs-stone-dark`
  - `--osrs-text-shadow`
  - Skill-specific colors
- Keep existing token structure, add OSRS theme layer
- Dark mode: Override in `body.dark-mode`

**Component Styling:**
- Leverage existing Vue SFC scoped styles
- New file: `osrs-theme.css` for shared OSRS visuals
- Layout: CSS Grid for step cards (responsive by default)
- Animations: CSS transitions + Motion One library (already installed)

### Vue Component Refactoring

**Minimal Breaking Changes:**
- Keep existing component structure (GuideStep, StepHeader, StepContent, etc.)
- Refactor templates for new layout, preserve data flow
- Update `SidebarNav.vue` for collapsed/expanded behavior
- New components:
  - `ProgressOrbs.vue`
  - `OSRSCheckbox.vue`
  - `MetadataBadge.vue`

**State Management:**
- Keep existing Pinia stores (progress, filter, guide, ui, keyboard)
- New UI state:
  - `sidebarPinned: boolean`
  - `expandedSteps: Set<string>`
- No changes to localStorage keys (backward compatibility)

**Performance:**
- Vue `<Transition>` for animations
- Lazy-load sprite sheets
- Virtual scrolling available if needed (vue-virtual-scroller)
- Debounced search (existing)

### Migration Path

**Phase 1: Foundation (Non-Breaking)**
- Add OSRS fonts and sprite assets
- Extend CSS design tokens
- Update color palette and typography
- Test light and dark modes

**Phase 2: Navigation**
- Refactor SidebarNav for collapsed/expanded
- Add progress indicators to chapter icons
- Implement keyboard shortcuts for chapters
- Mobile bottom sheet navigation

**Phase 3: Step Cards**
- Redesign GuideStep with OSRS card styling
- New checkbox with animations
- Metadata badges with skill icons
- Enhanced expand/collapse

**Phase 4: Polish**
- Progress orbs in section header
- Enhanced loading/error states
- Toast notification styling
- Accessibility audit

**Phase 5: Testing & Refinement**
- Cross-browser testing (Chrome, Firefox, Safari, mobile)
- Performance profiling
- User feedback and iteration

### Rollout Strategy

**Direct Cutover (Recommended):**
- Deploy new UI directly
- Ensure design tokens provide fallbacks
- Thorough testing before deployment
- Keep old UI in git history for reference

**Alternative - Feature Flag:**
- Add `OSRS_THEME` toggle in settings
- Allow switching between old/new UI
- Gather feedback before making default
- Remove old UI after stabilization

---

## Success Metrics

### Usability
- Navigation: Reduce clicks to reach any section (target: max 2 clicks)
- Readability: Improved content scanning speed (subjective feedback)
- Mobile: Touch targets meet WCAG AAA standards (48x48px minimum)

### Aesthetics
- Distinctive visual identity (doesn't look like generic tracker)
- OSRS authenticity (recognizable to OSRS players)
- Modern polish (smooth animations, responsive)

### Performance
- Page load: No regression from current performance
- Animation frame rate: 60fps on modern devices
- Asset size: Optimized sprites and fonts

### Accessibility
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all features
- Screen reader compatibility

---

## Open Questions & Future Enhancements

### Post-Launch Considerations
- Social features: Share progress screenshots with OSRS-styled graphics
- Achievements: OSRS achievement diary-style milestones
- Themes: Allow custom color schemes beyond light/dark
- Sound effects: Optional OSRS sound effects for completion (level-up sound)
- Export: Download progress as OSRS-styled image or PDF

### Technical Debt
- Update CLAUDE.md to reflect Vue 3 + Vite architecture (currently says vanilla JS)
- Consider Tailwind CSS integration for utility classes (already installed but not documented)

---

## Conclusion

This redesign addresses core usability issues (navigation, readability) while creating a unique, OSRS-themed aesthetic that balances nostalgia with modern UX patterns. The implementation path is incremental, preserving existing functionality while introducing visual and interaction improvements.

The design prioritizes:
1. **Clear navigation** via compact, icon-based sidebar
2. **Readable steps** via card-based layout with OSRS styling
3. **OSRS authenticity** through pixel fonts, skill icons, and game-inspired visuals
4. **Modern UX** with smooth animations, keyboard shortcuts, and responsive design
5. **Accessibility** with proper fallbacks, ARIA labels, and high contrast options

Ready for implementation.
