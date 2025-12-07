# Story 44.6: Install Prompt UX

## Description

Create a user-friendly install prompt that appears at the right time to encourage users to add the app to their home screen.

## Acceptance Criteria

- [ ] Custom install prompt component created
- [ ] Prompt appears after meaningful engagement (not immediately)
- [ ] Prompt is dismissible and remembers user's choice
- [ ] Works on Android Chrome, Edge, and other supported browsers
- [ ] Graceful fallback for unsupported browsers (iOS Safari)
- [ ] Prompt positioned to not obstruct content

## Technical Details

### Component: `components/InstallPrompt.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed or recently dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < DISMISS_DURATION) {
      return; // Recently dismissed
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show after user has engaged (scrolled or spent time)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show manual instructions after engagement
    if (isIOSDevice) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 60000); // 60 seconds for iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  // iOS-specific instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-ski-blue rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install Ski Directory
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Add to your home screen for quick access!
            </p>
            <div className="text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <span>1. Tap</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4z"/>
                  <path d="M20 10v11c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .9 2 2z"/>
                </svg>
                <span>Share button</span>
              </p>
              <p className="mt-1">2. Scroll and tap "Add to Home Screen"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chrome/Edge install prompt
  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-100">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-ski-blue rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="font-semibold text-gray-900 mb-1">
            Install Ski Directory
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Get quick access from your home screen with offline support!
          </p>
          <button
            onClick={handleInstall}
            className="w-full bg-ski-blue text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Integration in Layout

```tsx
import { InstallPrompt } from '@/components/InstallPrompt';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
```

### Timing Strategy

| Trigger | Delay | Rationale |
|---------|-------|-----------|
| Chrome beforeinstallprompt | 30s | User has engaged, not immediately |
| iOS Safari | 60s | More time needed since manual steps |
| Dismiss | 7 days | Don't pester, but allow retry |

### Browser Support

| Browser | Install Support | Notes |
|---------|-----------------|-------|
| Chrome Android | Yes | Full A2HS support |
| Edge | Yes | Full A2HS support |
| Firefox Android | Yes | beforeinstallprompt |
| Safari iOS | Manual | Must show instructions |
| Safari macOS | No | Not supported |
| Firefox Desktop | No | Not supported |

## Tasks

1. [ ] Create `components/InstallPrompt.tsx`
2. [ ] Add to `app/layout.tsx`
3. [ ] Test on Chrome Android (emulator or device)
4. [ ] Test iOS Safari instructions
5. [ ] Test dismiss persistence
6. [ ] Verify standalone detection (don't show if installed)

## Effort

3 story points (Small-Medium)

## Notes

- Don't show immediately - wait for engagement
- iOS requires manual instructions (no programmatic install)
- Remember dismissal to avoid annoying users
- Position above mobile nav bar
