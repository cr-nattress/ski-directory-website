# Story 44.5: Offline Fallback Page

## Description

Create a user-friendly offline fallback page that displays when users navigate to uncached pages without network connectivity.

## Acceptance Criteria

- [ ] `public/offline.html` created with branded design
- [ ] Page explains offline status clearly
- [ ] Page is pre-cached by service worker
- [ ] Works without any external dependencies (inline CSS)
- [ ] Matches app design language

## Technical Details

### Offline Page: `public/offline.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#1E40AF">
  <title>Offline | Ski Directory</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: white;
    }

    .container {
      text-align: center;
      max-width: 400px;
    }

    .icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon svg {
      width: 60px;
      height: 60px;
      fill: white;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    button, a {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    button {
      background: white;
      color: #1E40AF;
      border: none;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    a {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    a:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .cached-pages {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .cached-pages h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.7;
      margin-bottom: 16px;
    }

    .cached-pages ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .cached-pages a {
      padding: 8px 16px;
      font-size: 14px;
      border-width: 1px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <!-- Mountain/Snow icon -->
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 19h20L12 2zm0 4l6.5 11h-13L12 6z"/>
        <circle cx="12" cy="5" r="1"/>
        <path d="M8 14l2-3 2 2 4-5" stroke="white" stroke-width="1.5" fill="none"/>
      </svg>
    </div>

    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection.
      Don't worry - some pages are available offline!
    </p>

    <div class="actions">
      <button onclick="window.location.reload()">
        Try Again
      </button>
    </div>

    <div class="cached-pages">
      <h2>Available Offline</h2>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/directory">Directory</a></li>
        <li><a href="/ski-links">Ski Links</a></li>
        <li><a href="/social-links">Social</a></li>
      </ul>
    </div>
  </div>

  <script>
    // Check if back online
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>
```

### Design Decisions

1. **Inline CSS:** No external dependencies, works completely offline
2. **Gradient background:** Uses brand colors (ski-blue)
3. **Helpful messaging:** Explains situation, provides actions
4. **Cached page links:** Shows what's available offline
5. **Auto-reload:** Refreshes when connection restored

### Service Worker Integration

The offline page is already referenced in the service worker (Story 44.2):

```javascript
// In fetch handler for navigation requests
.catch(() => {
  return caches.match(request)
    .then((cached) => cached || caches.match('/offline.html'));
});
```

## Tasks

1. [ ] Create `public/offline.html`
2. [ ] Test offline display in Chrome DevTools
3. [ ] Verify links to cached pages work
4. [ ] Test auto-reload on reconnection
5. [ ] Verify page is pre-cached by SW

## Testing

1. Build production: `npm run build && npm start`
2. Open Chrome DevTools > Network > Offline
3. Navigate to uncached page
4. Should see offline.html
5. Disable offline mode
6. Page should auto-reload

## Effort

2 story points (Small)

## Notes

- Keep file size small (< 10KB) for quick cache
- SVG icon is inline for zero dependencies
- Consider adding a ski/snowflake animation for delight
