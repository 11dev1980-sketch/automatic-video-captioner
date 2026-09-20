import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { validateInstagramUrl } from '../utils/validators';

function parseQuery(url) {
    try {
        const q = url.split('?')[1] || '';
        const params = {};
        for (const part of q.split('&')) {
            if (!part) continue;
            const [k, v] = part.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
        }
        return params;
    } catch {
        return {};
    }
}

function extractSharedUrl(incoming) {
    if (!incoming) return null;
    try {
        const params = parseQuery(incoming);
        if (params.url) {
            const candidate = String(params.url);
            const { valid } = validateInstagramUrl(candidate);
            return valid ? candidate : null;
        }
        const urlOnly = incoming.startsWith('http') ? incoming : null;
        if (urlOnly) {
            const { valid } = validateInstagramUrl(urlOnly);
            return valid ? urlOnly : null;
        }
        return null;
    } catch {
        return null;
    }
}

export function useShareUrl() {
    const [sharedUrl, setSharedUrl] = useState(null);

    useEffect(() => {
        let mounted = true;
        Linking.getInitialURL().then((url) => {
            if (!mounted) return;
            const extracted = extractSharedUrl(url);
            if (extracted) setSharedUrl(extracted);
        });
        const sub = Linking.addEventListener('url', ({ url }) => {
            const extracted = extractSharedUrl(url);
            if (extracted) setSharedUrl(extracted);
        });
        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    return { sharedUrl, clearSharedUrl: () => setSharedUrl(null) };
}
