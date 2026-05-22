import { useEffect, useState } from 'react';

// This hook waits for the browser to finish loading fonts declared via CSS @font-face.
// Keep fonts declared in `src/index.css` so they are globally available and easy to edit.
export default function useAppFonts() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (document && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) setLoaded(true);
      }).catch(() => {
        if (mounted) setLoaded(true);
      });
    } else {
      // Fallback: assume fonts are available
      setLoaded(true);
    }

    return () => { mounted = false; };
  }, []);

  return [loaded];
}