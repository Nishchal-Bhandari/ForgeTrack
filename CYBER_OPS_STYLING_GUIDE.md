# Cyber Ops Styling Guide - CSS Classes & Patterns

## Quick Reference

### Color Classes (Tailwind)

**Background**
```
cyber-bg          → #0A0A0A (Page background)
cyber-surface     → #131313 (Card/surface background)
cyber-card        → #1A1A1A (Nested card background)
cyber-border      → Used for borders with opacity
```

**Text**
```
cyber-text              → #EAEAEA (Primary text)
cyber-text-secondary    → #8A8A8A (Secondary text)
```

**Accents**
```
cyber-neon      → #00FF41 (Primary accent - neon green)
danger-color    → #FF3B3B (Error/danger states)
warning-color   → #FFD700 (Warning/delayed states)
info-color      → #00BFFF (Info/neutral states)
success-color   → #00FF41 (Same as neon for success)
```

---

## Common Styling Patterns

### 1. Card Header (Title + Status)

```jsx
<div className="flex items-center justify-between mb-4">
  <h2 className="font-mono text-2xl font-bold text-cyber-neon tracking-widest uppercase">
    SYSTEM STATUS
  </h2>
  <p className="text-cyber-text-secondary text-sm font-mono">
    ▸ LIVE - Ready for operations
  </p>
</div>
```

### 2. Card Content Wrapper

```jsx
<div className="space-y-4">
  {/* Content sections */}
</div>
```

**Note**: Use `space-y-4` for vertical rhythm between sections

### 3. Bordered Input Field

```jsx
<input
  type="text"
  placeholder="Type to search..."
  className="w-full bg-cyber-surface border border-cyber-border rounded px-3 py-2 text-sm text-cyber-text placeholder-cyber-text-secondary focus:border-cyber-neon focus:outline-none transition-all font-mono"
/>
```

### 4. Bordered Button

```jsx
<button className="px-4 py-2 border border-cyber-border rounded text-sm font-mono text-cyber-text-secondary hover:text-cyber-neon hover:border-cyber-neon transition-all uppercase tracking-wide">
  ACTION
</button>
```

### 5. Primary Button (Neon Green)

```jsx
<button className="px-4 py-2 bg-cyber-neon text-cyber-bg font-mono font-bold rounded hover:shadow-neon-glow transition-all uppercase tracking-widest">
  CONFIRM
</button>
```

### 6. Status Badge

```jsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon font-mono text-xs font-bold uppercase">
  <span className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse"></span>
  Active
</div>
```

### 7. Metric Display

```jsx
<div className="text-center">
  <p className="text-xs text-cyber-text-secondary font-mono uppercase mb-1">
    LABEL
  </p>
  <p className="font-mono text-3xl font-bold text-cyber-neon">
    1234
  </p>
</div>
```

### 8. Table Row (Hover Effect)

```jsx
<div className="flex items-center gap-4 p-4 border border-cyber-border/30 rounded hover:border-cyber-neon hover:bg-cyber-neon/5 transition-all cursor-pointer">
  {/* Row content */}
</div>
```

### 9. Status Indicator Dot

```jsx
<div className="flex items-center gap-2">
  <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-cyber-neon animate-pulse' : 'bg-gray-600'}`}></div>
  <span className="text-sm">{statusText}</span>
</div>
```

### 10. Section Divider

```jsx
<div className="h-px bg-cyber-border/20"></div>
```

---

## Layout Patterns

### Full-Page Layout with Background

```jsx
export function Page() {
  return (
    <>
      <CyberBackground interactive={false} particleCount={300} />
      
      <div className="space-y-6 pb-24 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <section>
          <h2 className="font-mono text-4xl font-bold text-cyber-neon tracking-widest uppercase">
            PAGE TITLE
          </h2>
          <p className="text-cyber-text-secondary text-sm font-mono mt-2">
            Page subtitle or status
          </p>
        </section>

        {/* Content Cards */}
        <CyberCard title="SECTION" icon="📊" animated interactive>
          {/* Content */}
        </CyberCard>
      </div>
    </>
  );
}
```

### Grid Layout (Metrics)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <CyberCard>
    <CyberMetric label="Total" value={100} status="active" />
  </CyberCard>
  {/* More cards */}
</div>
```

### Search + List Layout

```jsx
<CyberCard className="!p-4">
  <div className="space-y-4">
    {/* Search input */}
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-neon/50" />
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-cyber-surface border border-cyber-border rounded px-3 py-2 pl-10 text-sm text-cyber-text placeholder-cyber-text-secondary focus:border-cyber-neon outline-none transition-all font-mono"
      />
    </div>

    {/* List */}
    <div className="max-h-96 overflow-y-auto border border-cyber-border rounded p-3 space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-2 rounded border border-cyber-border/30 hover:border-cyber-neon transition-all">
          <input type="checkbox" className="w-4 h-4" />
          <span className="flex-1">{item.name}</span>
        </div>
      ))}
    </div>
  </div>
</CyberCard>
```

---

## Animation Classes

### Built-in Tailwind Animations

```
animate-fade-in       → Fade in effect
animate-pulse-neon    → Pulsing neon glow
animate-glow-pulse    → Smooth glow transition
animate-matrix-fall   → Falling animation
animate-blink         → Blinking cursor
```

### Usage Examples

```jsx
{/* Fade in on page load */}
<div className="animate-fade-in">Content</div>

{/* Pulsing indicator */}
<div className="w-2 h-2 rounded-full bg-cyber-neon animate-pulse-neon"></div>

{/* Blinking cursor */}
<span className="animate-blink">_</span>
```

---

## Hover & Interactive Effects

### Glow on Hover

```jsx
<div className="p-4 border border-cyber-border rounded hover:border-cyber-neon hover:shadow-neon-glow transition-all duration-300">
  Content
</div>
```

### Scale on Hover

```jsx
<button className="px-4 py-2 bg-cyber-neon text-cyber-bg rounded hover:scale-105 transition-transform duration-200">
  Button
</button>
```

### Background Highlight on Hover

```jsx
<div className="p-4 border border-cyber-border/30 rounded hover:border-cyber-neon hover:bg-cyber-neon/5 transition-all">
  Interactive area
</div>
```

### Lift Effect (translateY)

```jsx
<div className="p-4 border border-cyber-border rounded hover:-translate-y-1 shadow-md hover:shadow-neon-glow transition-all">
  Card content
</div>
```

---

## Typography Patterns

### Main Title

```jsx
<h1 className="font-mono text-4xl font-bold text-cyber-neon tracking-widest uppercase">
  MAIN TITLE
</h1>
```

### Subtitle

```jsx
<p className="text-cyber-text-secondary text-sm font-mono">
  Secondary information
</p>
```

### Label (Above Input)

```jsx
<label className="text-xs text-cyber-text-secondary font-mono uppercase tracking-widest mb-2 block">
  FIELD LABEL
</label>
```

### Monospace Number

```jsx
<span className="font-mono text-lg font-bold text-cyber-neon tabular-nums">
  12,345
</span>
```

### Small Text

```jsx
<span className="text-xs text-cyber-text-secondary font-mono">
  Timestamp or metadata
</span>
```

---

## Border & Shadow Patterns

### Neon Green Border (Active)

```jsx
className="border-2 border-cyber-neon"
```

### Subtle Border (Inactive)

```jsx
className="border border-cyber-border/30"
```

### Glow Shadow

```jsx
className="shadow-neon-glow"  // 20px outer glow
className="shadow-neon-glow-sm"  // 10px outer glow
```

### Error Glow

```jsx
className="shadow-error-glow"
```

---

## Accessibility Patterns

### Focus States

```jsx
<input
  className="...focus:border-cyber-neon focus:outline-none focus:ring-1 focus:ring-cyber-neon/50"
/>
```

### High Contrast Text

```jsx
<p className="text-cyber-text">Primary text (WCAG AA compliant)</p>
<p className="text-cyber-text-secondary">Secondary text (WCAG AA compliant)</p>
```

### Error Messages

```jsx
<div className="p-3 bg-danger-color/10 border border-danger-color/30 rounded text-danger-color font-mono text-sm">
  ✗ Error message
</div>
```

### Success Messages

```jsx
<div className="p-3 bg-cyber-neon/10 border border-cyber-neon/30 rounded text-cyber-neon font-mono text-sm">
  ✓ Success message
</div>
```

---

## Responsive Patterns

### Mobile-First Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Items */}
</div>
```

### Hidden on Mobile

```jsx
<div className="hidden md:block">
  {/* Only visible on tablet/desktop */}
</div>
```

### Full Width on Mobile

```jsx
<button className="w-full md:w-auto">
  {/* Button */}
</button>
```

---

## Common Component Combinations

### Card with Metrics

```jsx
<CyberCard title="SYSTEM METRICS" icon="📊" animated>
  <div className="grid grid-cols-2 gap-4">
    <CyberMetric label="Users" value={245} status="active" />
    <CyberMetric label="Sessions" value={18} status="active" />
  </div>
</CyberCard>
```

### Card with Search & List

```jsx
<CyberCard>
  <input type="text" placeholder="Search..." className="..." />
  <div className="max-h-96 overflow-y-auto mt-4 space-y-2">
    {/* List items */}
  </div>
</CyberCard>
```

### Modal/Dialog Pattern

```jsx
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
  <CyberCard className="max-w-md">
    <h3 className="text-lg font-bold text-cyber-neon mb-4">CONFIRMATION</h3>
    <p className="text-cyber-text-secondary mb-6">Are you sure?</p>
    <div className="flex gap-2">
      <button className="flex-1 px-4 py-2 bg-cyber-neon text-cyber-bg rounded font-mono font-bold">
        CONFIRM
      </button>
      <button className="flex-1 px-4 py-2 border border-cyber-border rounded font-mono">
        CANCEL
      </button>
    </div>
  </CyberCard>
</div>
```

---

## Color Selection Guide

| Use Case | Class | Color |
|----------|-------|-------|
| Main backgrounds | `bg-cyber-bg` | `#0A0A0A` |
| Card backgrounds | `bg-cyber-surface` | `#131313` |
| Active elements | `text-cyber-neon` | `#00FF41` |
| Primary text | `text-cyber-text` | `#EAEAEA` |
| Secondary text | `text-cyber-text-secondary` | `#8A8A8A` |
| Error/danger | `text-danger-color` | `#FF3B3B` |
| Warning state | `text-warning-color` | `#FFD700` |
| Info state | `text-info-color` | `#00BFFF` |

---

## Key Takeaways

1. **Always use `font-mono`** for technical elements (titles, IDs, numbers)
2. **Use `tracking-widest`** for uppercase headers to increase letter spacing
3. **Always include `transition-all`** on interactive elements
4. **Use `hover:` for state changes** (color, border, shadow, scale)
5. **Wrap pages with `CyberBackground`** for consistent aesthetic
6. **Use `space-y-*` for vertical rhythm** between sections
7. **Apply `relative z-10`** to content over background
8. **Use `max-w-*` to limit content width** (max-w-6xl common)
9. **Include `pb-24`** at bottom of pages for scroll space
10. **Test hover states** on all interactive elements

---

**Last Updated**: Current Session
