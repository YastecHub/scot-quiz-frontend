import { useEffect, useRef, useCallback, useState } from 'react';
import { attemptsAPI } from '../api/client';

const MAX_VIOLATIONS = 3;

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

  const recordViolation = useCallback((reason: string) => {
    if (autoSubmittedRef.current) return;

    violationsRef.current += 1;
    setViolations(violationsRef.current);
    setWarningMsg(reason);

    attemptsAPI.logViolation(testId).catch(() => {});

    if (violationsRef.current >= MAX_VIOLATIONS) {
      autoSubmittedRef.current = true;
      setWarningMsg('Too many violations detected. Your test is being submitted automatically.');
      setTimeout(() => onAutoSubmit(), 2500);
    }
  }, [testId, onAutoSubmit]);

  useEffect(() => {
    // 1. Block right-click
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('Right-click is disabled during the test.');
    };

    // 2. Block dangerous keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'printscreen') {
        e.preventDefault();
        recordViolation('Screenshots are not allowed during the test.');
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const combo = e.shiftKey ? `shift+${key}` : key;
        const blocked: Record<string, string> = {
          'p':       'Printing is not allowed during the test.',
          's':       'Saving is not allowed during the test.',
          'u':       'Viewing page source is not allowed.',
          'shift+i': 'Developer tools are not allowed.',
          'shift+j': 'Developer tools are not allowed.',
          'shift+c': 'Developer tools are not allowed.',
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

    // 3. Tab / window visibility
    const onVisibilityChange = () => {
      if (document.hidden) {
        setBlurred(true);
        recordViolation('You switched tabs or minimised the window. This has been flagged.');
      } else {
        setBlurred(false);
        setWarningMsg('');
      }
    };

    // 4. Window blur (alt-tab, clicking outside browser)
    const onWindowBlur = () => {
      setBlurred(true);
      recordViolation('You left the test window. This has been flagged.');
    };
    const onWindowFocus = () => {
      setBlurred(false);
      setWarningMsg('');
    };

    // 5. DevTools size heuristic (checked every 3s)
    const devtoolsInterval = setInterval(() => {
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        recordViolation('Developer tools detected. Please close them to continue.');
      }
    }, 3000);

    // 6. Disable text selection globally while test is active
    document.body.style.userSelect       = 'none';
    (document.body.style as any).webkitUserSelect = 'none';

    document.addEventListener('contextmenu',      onContextMenu);
    document.addEventListener('keydown',          onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur',  onWindowBlur);
    window.addEventListener('focus', onWindowFocus);

    return () => {
      document.removeEventListener('contextmenu',      onContextMenu);
      document.removeEventListener('keydown',          onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur',  onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      clearInterval(devtoolsInterval);
      document.body.style.userSelect       = '';
      (document.body.style as any).webkitUserSelect = '';
    };
  }, [recordViolation]);

  return { violations, blurred, warningMsg };
}
