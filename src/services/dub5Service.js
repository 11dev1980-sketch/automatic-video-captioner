const DEFAULT_ENDPOINT = ''; // Disabled - using Google AI Studio instead

function parseSseLines(buffer, onContent, onEvent) {
    const lines = buffer.split('\n');
    const tail = lines.pop() || '';
    for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;
        try {
            const obj = JSON.parse(jsonStr);
            if (obj && typeof obj === 'object') {
                if (obj.content) {
                    onContent && onContent(String(obj.content));
                } else if (obj.type) {
                    onEvent && onEvent(obj);
                }
            }
        } catch (_) { }
    }
    return tail;
}

function escapeText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function readStream(response, onContent, onEvent) {
    const reader = response.body && response.body.getReader ? response.body.getReader() : null;
    if (!reader) {
        const text = await response.text();
        let buffer = text;
        let tail = buffer;
        while (tail.includes('\n')) {
            const idx = tail.indexOf('\n');
            const head = tail.slice(0, idx + 1);
            tail = tail.slice(idx + 1);
            parseSseLines(head, onContent, onEvent);
        }
        parseSseLines(tail + '\n', onContent, onEvent);
        return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseLines(buffer, onContent, onEvent);
    }
}

export async function sendDub5Request(input, task, params, options = {}) {
    const endpoint = options.endpoint || DEFAULT_ENDPOINT;
    const token = options.token;
    const controller = new AbortController();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = { input };
  if (task) body.task = task;
  if (params) body.params = params;
  let fullText = '';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    await readStream(
      res,
      chunk => {
        const safe = escapeText(chunk);
        fullText += safe;
        options.onContent && options.onContent(safe, fullText);
      },
      ev => {
        options.onEvent && options.onEvent(ev);
      }
    );
    return { text: fullText, abortController: controller };
  } catch (err) {
    return { error: err.message || 'Request failed', abortController: controller };
  }
}

export async function translate(input, params, options = {}) {
  const resp = await sendDub5Request(input, 'translate', params, options);
  if (resp.error) throw new Error(resp.error);
  return escapeText(resp.text);
}

export async function extract(input, params, options = {}) {
  const resp = await sendDub5Request(input, 'extract', params, options);
  if (resp.error) throw new Error(resp.error);
  return escapeText(resp.text);
}
