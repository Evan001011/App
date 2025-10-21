# Studently Design Guidelines

## Design Approach: Modern Productivity System

**Selected Approach**: Design System - Inspired by Linear, Notion, and modern productivity tools
**Justification**: Studently is utility-focused with information-dense content (calendar, tasks, AI chat). Students need efficiency, clarity, and consistency over visual flair. The design should feel approachable and motivating while maintaining professional organization.

**Core Principles**:
- Clarity over decoration - every element serves a purpose
- Calm, focused environment that reduces cognitive load
- Motivating without being distracting
- Student-friendly but not childish

---

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 250 100% 60% (vibrant blue - energizing but not overwhelming)
- Background: 0 0% 100% (pure white)
- Surface: 240 20% 98% (subtle off-white for cards)
- Border: 240 10% 90% (soft gray borders)
- Text Primary: 240 10% 10% (near-black)
- Text Secondary: 240 5% 45% (medium gray)
- Success: 142 76% 45% (green for completed tasks)
- Warning: 38 92% 50% (amber for upcoming deadlines)
- Accent (sparingly): 280 80% 65% (purple for AI features)

**Dark Mode**:
- Primary: 250 100% 65% (slightly lighter blue)
- Background: 240 10% 8% (dark charcoal)
- Surface: 240 8% 12% (elevated dark surface)
- Border: 240 8% 20% (subtle borders)
- Text Primary: 0 0% 95% (off-white)
- Text Secondary: 240 5% 65% (light gray)
- Success: 142 70% 50%
- Warning: 38 85% 55%
- Accent: 280 75% 70%

**Subject Color Coding** (for calendar events):
- Math: 210 100% 55% (blue)
- Science: 142 70% 45% (green)
- Writing: 280 75% 60% (purple)
- Social Studies: 25 90% 50% (orange)
- Coding: 340 80% 55% (pink/red)
- Other: 200 15% 55% (gray-blue)

### B. Typography

**Font Families**:
- Primary: Inter (via Google Fonts) - clean, modern, excellent readability
- Monospace: JetBrains Mono (for AI code assistance)

**Hierarchy**:
- Page Headers: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-base font-medium (16px)
- Body Text: text-sm font-normal (14px)
- Labels/Meta: text-xs font-medium (12px)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Tight spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4 (16px)
- Section spacing: p-6, py-8 (24px, 32px)
- Large gaps: gap-12, py-16 (48px, 64px)

**Grid System**:
- Dashboard: 12-column grid on desktop, single column on mobile
- Calendar: 7-column grid for week view
- Standard container: max-w-7xl mx-auto px-4

### D. Component Library

**Navigation**:
- Top navbar: Fixed position with app branding, navigation links (Calendar, Tasks, AI Study, Progress), user menu
- Height: h-16, backdrop blur with border-b
- Mobile: Hamburger menu collapsing to slide-out drawer

**Calendar Components**:
- Month view: Grid layout with date cells, event indicators as colored dots/bars
- Date cells: Hover state with subtle bg change, today highlighted with primary color ring
- Event cards: Rounded corners (rounded-lg), subject color left border (border-l-4), compact padding
- Add event modal: Centered overlay with form fields, subject dropdown with color preview

**Task List Components**:
- Task items: Checkbox on left, task text (strikethrough when complete), drag handle icon, delete button
- Draggable state: Shadow elevation and slight scale increase
- Empty state: Centered icon and encouraging text
- Add task input: Sticky at top with autofocus

**AI Chat Interface**:
- Subject selector: Horizontal tabs or pills to switch between Math, Writing, Social Studies, Coding
- Chat messages: Alternating alignment (user right, AI left), different bg colors, rounded bubbles
- Input area: Fixed bottom position with send button, multiline textarea that expands
- Code blocks: Monospace font with syntax highlighting background

**Progress Dashboard**:
- Progress bars: Full width with rounded ends, gradient fill, percentage label
- Stat cards: Grid layout (2-3 columns), large numbers, descriptive labels, subtle icons
- Streak calendar: Mini calendar showing activity dots

**Shared Elements**:
- Buttons: Primary (filled with primary color), Secondary (outline), Ghost (transparent hover)
- Cards: bg-surface, rounded-xl, border, shadow-sm on hover
- Inputs: Consistent height (h-10), rounded-md, border with focus ring
- Modals: Centered overlay, max-w-md to max-w-2xl, dark backdrop

### E. Animations

**Minimal, Purposeful Animations**:
- Task completion: Subtle checkmark animation and fade to strikethrough (200ms)
- Drag and drop: Smooth position transitions (150ms ease-out)
- Modal entrance: Scale from 95% to 100% with fade (200ms)
- Progress bars: Smooth fill animation on load (500ms ease-out)
- No distracting scroll animations or decorative effects

---

## Page-Specific Layouts

**Dashboard/Home**:
- Top: Welcome message with current date
- Three-column grid (desktop): Today's tasks (left), Mini calendar (center), Progress summary (right)
- Mobile: Stacked single column

**Calendar Page**:
- Header: Month/year selector with prev/next arrows, "Add Event" button
- Main: Calendar grid with week day headers, date cells with event indicators
- Sidebar (desktop): Upcoming events list, subject legend
- Mobile: Calendar full-width, upcoming events below

**Tasks Page**:
- Header: "Daily Planner" title, date selector
- Main: Task list with add input at top
- Section dividers: "Incomplete" and "Completed" with counts
- Empty state illustration when no tasks

**AI Study Page**:
- Header: Subject tabs/pills
- Main: Chat message area (scrollable, flex-col-reverse for bottom-anchored)
- Bottom: Fixed input area with textarea and send button
- Welcome state: Brief intro to selected subject mode with example prompts

**Progress Page**:
- Header: Date range selector (This Week, This Month)
- Sections: Task completion rate, Study time by subject, Streak calendar, AI interactions summary
- Cards with large numbers and trend indicators

---

## Accessibility & Quality Standards

- Maintain WCAG AA contrast ratios across all color combinations
- Consistent dark mode throughout including all inputs and modals
- Focus states visible on all interactive elements (ring-2 ring-primary)
- Semantic HTML with proper heading hierarchy
- Mobile-first responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

**Key Success Metrics**:
- Clear visual hierarchy guides users to primary actions
- Motivating but calm aesthetic that encourages daily use
- Information density balanced with breathing room
- Seamless transitions between features without cognitive friction