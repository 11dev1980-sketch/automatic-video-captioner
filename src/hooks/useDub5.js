import { useRef, useState, useCallback } from 'react';
import { DUB5_ENDPOINT } from '../utils/constants';

const STATES = {
    IDLE: 'idle',
    SENDING: 'sending',
    STREAMING: 'streaming',
    COMPLETED: 'completed',
    ABORTED: 'aborted',
    ERROR: 'error',
};

function escapeText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function parseSse(buffer, onData) {
    const lines = buffer.split('\n');
    const tail = lines.pop() || '';
    for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;
        try {
            const obj = JSON.parse(jsonStr);
            onData(obj);
        } catch (e) {
            // Silent fail - invalid JSON chunk
        }
    }
    return tail;
}

export function useDub5() {
    const [state, setState] = useState(STATES.IDLE);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);
    const [files, setFiles] = useState([]);
    const [text, setText] = useState('');
    const controllerRef = useRef(null);
    const finalizeOnceRef = useRef(false);
    const runningPromiseRef = useRef(null);

    const abort = useCallback(() => {
        if (controllerRef.current) {
            try {
                controllerRef.current.abort();
            } catch (_) { }
        }
        controllerRef.current = null;
        if (!finalizeOnceRef.current) {
            finalizeOnceRef.current = true;
            setState(STATES.ABORTED);
        }
    }, []);

    const send = useCallback(async (input, task, params, options = {}) => {
        if (!input || !String(input).trim()) {
            setError('Input is required');
            setState(STATES.ERROR);
            return Promise.reject(new Error('Input is required'));
        }
        if (state === STATES.STREAMING || state === STATES.SENDING) {
            abort();
        }
        setError(null);
        setMeta(null);
        setFiles([]);
        setText('');
        finalizeOnceRef.current = false;
        const endpoint = options.endpoint || DUB5_ENDPOINT;
        
        // Check if endpoint is available
        if (!endpoint) {
            setError('DUB5 service is disabled. Please configure an AI provider.');
            setState(STATES.ERROR);
            return Promise.reject(new Error('DUB5 service is disabled'));
        }
        
        const token = options.token;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
    const body = { input };
    if (task) body.task = task;
    if (params) body.params = params;
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(STATES.SENDING);
    const run = (async () => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          setError(`HTTP ${res.status}`);
          setState(STATES.ERROR);
          throw new Error(`HTTP ${res.status}`);
        }
        setState(STATES.STREAMING);
        const reader = res.body && res.body.getReader ? res.body.getReader() : null;
        if (!reader) {
          const fullBody = await res.text();
          let buffer = fullBody;
          let tail = buffer;
          while (tail.includes('\n')) {
            const i = tail.indexOf('\n');
            const head = tail.slice(0, i + 1);
            tail = tail.slice(i + 1);
            tail = parseSse(head, obj => {
              if (!obj || typeof obj !== 'object') return;
              const type = obj.type || 'content';
              if (type === 'content') {
                const chunk = escapeText(obj.content || '');
                if (!finalizeOnceRef.current) setText(prev => prev + chunk);
              } else if (type === 'meta') {
                setMeta(obj.meta || null);
              } else if (type === 'file') {
                const url = obj.fileUrl || '';
                const filename = obj.filename || '';
                if (url && /^https:\/\//.test(url)) {
                  setFiles(prev => [...prev, { url, filename }]);
                }
              } else if (type === 'action') {
              }
            });
          }
          parseSse(tail + '\n', obj => {
            const type = obj.type || 'content';
            if (type === 'content') {
              const chunk = escapeText(obj.content || '');
              if (!finalizeOnceRef.current) setText(prev => prev + chunk);
            } else if (type === 'meta') {
              setMeta(obj.meta || null);
            } else if (type === 'file') {
              const url = obj.fileUrl || '';
              const filename = obj.filename || '';
              if (url && /^https:\/\//.test(url)) {
                setFiles(prev => [...prev, { url, filename }]);
              }
            } else if (type === 'action') {
            }
          });
        } else {
          const decoder = new TextDecoder();
          let buffer = '';
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            buffer = parseSse(buffer, obj => {
              if (!obj || typeof obj !== 'object') return;
              const type = obj.type || 'content';
              if (type === 'content') {
                const chunk = escapeText(obj.content || '');
                if (!finalizeOnceRef.current) setText(prev => prev + chunk);
              } else if (type === 'meta') {
                setMeta(obj.meta || null);
              } else if (type === 'file') {
                const url = obj.fileUrl || '';
                const filename = obj.filename || '';
                if (url && /^https:\/\//.test(url)) {
                  setFiles(prev => [...prev, { url, filename }]);
                }
              } else if (type === 'action') {
              }
            });
          }
        }
        if (!finalizeOnceRef.current) {
          finalizeOnceRef.current = true;
          setState(STATES.COMPLETED);
        }
        return text;
      } catch (err) {
        if (controller.signal.aborted) {
          if (!finalizeOnceRef.current) {
            finalizeOnceRef.current = true;
            setState(STATES.ABORTED);
          }
          throw new Error('aborted');
        }
        setError(err.message || 'Request failed');
        setState(STATES.ERROR);
        throw err;
      } finally {
        controllerRef.current = null;
      }
    })();
    runningPromiseRef.current = run;
    return run;
  }, [abort, state, text]);

  return {
    state,
    error,
    meta,
    files,
    text,
    send,
    abort,
    STATES,
  };
}
