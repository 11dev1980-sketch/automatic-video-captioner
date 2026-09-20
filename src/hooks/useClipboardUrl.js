import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { validateSupportedUrl } from '../utils/validators';

export function useClipboardUrl() {
    const [clipboardUrl, setClipboardUrl] = useState(null);
    const [platform, setPlatform] = useState(null);

    useEffect(() => {
        let mounted = true;
        let currentState = AppState.currentState;

        const check = async () => {
            try {
                if (Platform.OS === 'web') return;
                const mod = await import('expo-clipboard');
                const api = mod && (mod.default || mod);
                if (!api || !api.getStringAsync) return;
                const text = await api.getStringAsync();
                const res = validateSupportedUrl(text);
                if (res.valid) {
                    if (!mounted) return;
                    setClipboardUrl(text);
                    setPlatform(res.platform);
                }
            } catch {
            }
        };

        if (Platform.OS !== 'web') {
            check();
        }

        const sub = AppState.addEventListener('change', (state) => {
            if (currentState.match(/inactive|background/) && state === 'active') {
                if (Platform.OS !== 'web') {
                    check();
                }
            }
            currentState = state;
        });

        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    return {
        clipboardUrl,
        platform,
        clearClipboardUrl: () => {
            setClipboardUrl(null);
            setPlatform(null);
        },
        readClipboardNow: async () => {
            try {
                if (Platform.OS === 'web' && navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    const res = validateSupportedUrl(text);
                    if (res.valid) {
                        setClipboardUrl(text);
                        setPlatform(res.platform);
                        return true;
                    }
                    return false;
                } else {
                    const mod = await import('expo-clipboard');
                    const api = mod && (mod.default || mod);
                    if (!api || !api.getStringAsync) return false;
                    const text = await api.getStringAsync();
                    const res = validateSupportedUrl(text);
                    if (res.valid) {
                        setClipboardUrl(text);
                        setPlatform(res.platform);
                        return true;
                    }
                    return false;
                }
            } catch {
                return false;
            }
        },
    };
}
