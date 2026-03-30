import { useEffect, useRef, useState } from 'react';
import { attemptsAPI } from '../api/client';

export const MAX_VIOLATIONS = 2; // tighter on mobile — 2 strikes and auto-submit

interface AntiCheatOptions {
  testId: number;
  onAutoSubmit: () => void;
}

export interface AntiCheatState {
  violations: number;
  blurred: boolean;
  warningMsg: string;
}

export function useAntiCheat({ testId, onAutoSubmit }: AntiCheatOptions): AntiCheatState {
  const [violations, setViolations] = useState(0);
  const [blurred,    setBlurred]    = useState(false);
  const [warningMsg, setWarningMsg] = useState('');

  const violationsRef    = useRef(0);
  const autoSubmittedRef = useRef(false);
  const onAutoSubmitRef  = useRef(onAutoSubmit);
  const testIdRef        = useRef(testId);
  const mountedRef       = useRef(false);
  // Cooldown: prevent the same event type from firing twice within 1s
  const lastViolationTime = useRef(0);

  useEffect(() => { onAutoSubmitRef.current = onAutoSubmit; }, [onAutoSubmit]);
  useEffect(() => { testIdRef.current = testId; }, [testId]);

  const recordViolation = (reason: string, force = false) => {
    if (autoSubmittedRef.current) return;

    // Debounce: same violation can't fire more than once per second
    const now = Date.now();
    if (!force && now - lastViolationTime.current < 1000) return;
    lastViolationTime.current = now;

    violationsRef.current += 1;
    setViolations(violationsRef.current);
    setWarningMsg(reason);

    attemptsAPI.logViolation(testIdRef.current).catch(() => {});

    if (violationsRef.current >= MAX_VIOLATIONS) {
      autoSubmittedRef.current = true;
      setWarningMsg('Too many violations. Your test is being submitted automatically.');
      setTimeout(() => onAutoSubmitRef.current(), 2500);
    }
  };

  useEffect(() => {
    // Wait 1.5s before activating — lets the page fully load and focus
    const mountTimer = setTimeout(() => { mountedRef.current = true; }, 1500);

    // ── 1. visibilitychange — PRIMARY mobile signal ───────────
    // Fires when: tab switch, home button, app switcher, Gemini overlay, any other app
    const onVisibilityChange = () => {
      if (!mountedRef.current) return;
      if (document.hidden) {
        setBlurred(true);
        recordViolation('You left the test. Switching apps is not allowed.');
      } else {
        setBlurred(false);
        setTimeout(() => setWarningMsg(''), 5000);
      }
    };

    // ── 2. pagehide — catches mobile browser backgrounding ────
    // More reliable than blur on iOS Safari and Android Chrome
    const onPageHide = () => {
      if (!mountedRef.current) return;
      setBlurred(true);
      recordViolation('You left the test. Switching apps is not allowed.');
    };

    const onPageShow = () => {
      setBlurred(false);
      setTimeout(() => setWarningMsg(''), 5000);
    };

    // ── 3. window blur — desktop + some mobile browsers ───────
    let visChangedRecently = false;
    const markVisChanged = () => {
      visChangedRecently = true;
      setTimeout(() => { visChangedRecently = false; }, 300);
    };

    const onWindowBlur = () => {
      if (!mountedRef.current) return;
      if (visChangedRecently) return;
      setBlurred(true);
      recordViolation('You left the test window. This has been flagged.');
    };

    const onWindowFocus = () => {
      setBlurred(false);
      setTimeout(() => setWarningMsg(''), 5000);
    };

    // ── 4. Block right-click & long-press context menu ────────
    // On mobile, long-press triggers contextmenu — this is how text gets copied to AI
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      recordViolation('Long-press / right-click is disabled during the test.');
    };

    // ── 5. Block all touch-based text selection (mobile) ──────
    const onTouchStart = (e: TouchEvent) => {
      // Prevent default only on text nodes to stop long-press selection
      const target = e.target as HTMLElement;
      if (target && target.tagName !== 'BUTTON' && target.tagName !== 'INPUT') {
        // Don't preventDefault here — it breaks button taps
        // Instead rely on CSS user-select: none
      }
    };

    // ── 6. Block copy / cut / paste ───────────────────────────
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Copying text is not allowed during the test.');
    };
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('Cutting text is not allowed during the test.');
    };

    // ── 7. Block keyboard shortcuts (desktop) ─────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'printscreen') {
        e.preventDefault();
        recordViolation('Screenshot attempt detected. This has been flagged.');
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const combo = e.shiftKey ? `shift+${key}` : key;
        const blocked: Record<string, string> = {
          'p':       'Printing is not allowed during the test.',
          's':       'Saving is not allowed during the test.',
          'u':       'Viewing page source is not allowed.',
          'a':       'Selecting all text is not allowed.',
          'shift+i': 'Developer tools are not allowed.',
          'shift+j': 'Developer tools are not allowed.',
          'shift+c': 'Developer tools are not allowed.',
          'shift+s': 'Screenshot attempt detected.',
        };
        if (blocked[combo]) {
          e.preventDefault();
          recordViolation(blocked[combo]);
          return;
        }
      }

      if (key === 'f12') {
        e.preventDefault();
        recordViolation('Developer tools are not allowed during the test.');
      }
    };

    // ── 8. DevTools size heuristic (desktop) ──────────────────
    const devtoolsInterval = setInterval(() => {
      if (!mountedRef.current) return;
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        recordViolation('Developer tools detected. Please close them.');
      }
    }, 3000);

    // ── 9. Screen Capture API detection ───────────────────────
    // If the browser supports getDisplayMedia, detect when screen sharing starts
    if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
      // We can't block it, but we can detect if the page is being captured
      // via the visibilitychange that some browsers fire during screen share setup
    }

    // ── 10. CSS: disable ALL selection, drag, callout ─────────
    const style = document.createElement('style');
    style.id = 'anticheat-styles';
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    // Register all listeners
    document.addEventListener('visibilitychange', markVisChanged, true);
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('contextmenu',      onContextMenu,  true);
    document.addEventListener('keydown',          onKeyDown);
    document.addEventListener('copy',             onCopy);
    document.addEventListener('cut',              onCut);
    document.addEventListener('touchstart',       onTouchStart,   { passive: true });
    window.addEventListener('blur',     onWindowBlur);
    window.addEventListener('focus',    onWindowFocus);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      clearTimeout(mountTimer);
      clearInterval(devtoolsInterval);
      document.removeEventListener('visibilitychange', markVisChanged, true);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('contextmenu',      onContextMenu,  true);
      document.removeEventListener('keydown',          onKeyDown);
      document.removeEventListener('copy',             onCopy);
      document.removeEventListener('cut',              onCut);
      document.removeEventListener('touchstart',       onTouchStart);
      window.removeEventListener('blur',     onWindowBlur);
      window.removeEventListener('focus',    onWindowFocus);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      // Remove injected CSS
      document.getElementById('anticheat-styles')?.remove();
    };
  }, []);

  return { violations, blurred, warningMsg };
}
