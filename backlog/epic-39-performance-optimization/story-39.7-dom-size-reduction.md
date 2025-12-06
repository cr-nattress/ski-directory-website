# Story 39.7: DOM Size Reduction

## Priority: P2 (Medium)
## Current DOM: 2,576 elements (Target: <1,500)

## User Story

As a user, I want pages to be responsive and smooth, not sluggish when scrolling or interacting.

## Problem

Lighthouse reports "Avoid an excessive DOM size" with 2,576 elements. Large DOM trees slow down:
- Memory usage
- Style calculations
- Layout/reflow operations
- JavaScript DOM queries

## Acceptance Criteria

- [ ] DOM element count < 1,500
- [ ] No single parent has > 60 child elements
- [ ] DOM depth < 15 levels
- [ ] Page scrolls smoothly at 60fps
- [ ] Interaction latency reduced

## Technical Implementation

### 1. Audit Current DOM

```javascript
// Run in browser console
console.log('Total elements:', document.querySelectorAll('*').length);
console.log('Max depth:', getMaxDepth(document.body));
console.log('Max children:', getMaxChildren(document.body));

function getMaxDepth(el, depth = 0) {
  return Math.max(depth, ...Array.from(el.children).map(c => getMaxDepth(c, depth + 1)));
}

function getMaxChildren(el) {
  const children = el.children.length;
  const childMax = Math.max(0, ...Array.from(el.children).map(getMaxChildren));
  return Math.max(children, childMax);
}
```

### 2. Identify Bloated Components

Common culprits:
- Long lists rendered without virtualization
- Repeated nested wrappers
- Hidden content still in DOM
- SVG icons with many paths
- Overly nested component structures

### 3. Implement List Virtualization

For the directory page with many resort cards:

```tsx
// Install react-window
npm install react-window

// Use virtualized list
import { FixedSizeList } from 'react-window';

function VirtualizedResortList({ resorts }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ResortCard resort={resorts[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={800}
      width="100%"
      itemCount={resorts.length}
      itemSize={300}  // Card height
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 4. Conditional Rendering

```tsx
// Bad - always in DOM, just hidden
<div className={isVisible ? 'block' : 'hidden'}>
  <HeavyComponent />
</div>

// Good - removed from DOM when hidden
{isVisible && <HeavyComponent />}
```

### 5. Simplify Component Structure

```tsx
// Bad - unnecessary wrapper divs
<div className="wrapper">
  <div className="inner">
    <div className="content">
      <span>{text}</span>
    </div>
  </div>
</div>

// Good - flat structure
<span className="content">{text}</span>
```

### 6. Use CSS Instead of DOM Elements

```tsx
// Bad - span for each character
{text.split('').map((char, i) => (
  <span key={i}>{char}</span>
))}

// Good - CSS for styling
<span className="tracking-wide">{text}</span>
```

### 7. Lazy Load Sections

```tsx
// Only render below-fold sections when near viewport
function LazySection({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { rootMargin: '200px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <Placeholder />}
    </div>
  );
}
```

### 8. Optimize Map Markers

If map has many markers:
```tsx
// Use marker clustering
import MarkerClusterGroup from 'react-leaflet-cluster';

<MarkerClusterGroup>
  {resorts.map(resort => (
    <Marker key={resort.id} position={[resort.lat, resort.lng]} />
  ))}
</MarkerClusterGroup>
```

## Components to Audit

| Component | Potential Issue | Solution |
|-----------|-----------------|----------|
| Directory page | Many cards | Virtualization |
| ResortMapView | Many markers | Clustering |
| PhotoGallery | Many thumbnails | Lazy render |
| RelatedResorts | Nested cards | Simplify |

## Testing

1. Measure DOM size before/after changes
2. Profile scroll performance (60fps target)
3. Check interaction latency
4. Run Lighthouse audit

## Definition of Done

- [ ] DOM elements < 1,500
- [ ] Virtualization implemented for long lists
- [ ] Conditional rendering for hidden content
- [ ] Smooth 60fps scrolling
- [ ] Lighthouse DOM audit passes
