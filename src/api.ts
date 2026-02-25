import { Message } from './types';

export async function streamChat(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!apiKey) {
    onError('Tolong masukan api key MegaLLM, Tanya Haikal untuk info lebih lanjut.');
    return;
  }

  try {
    // URL UDAH DIGANTI JADI PROXY VITE
    const response = await fetch('/api-ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ChatGPT Clone',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as Record<string, Record<string, string>>)?.error?.message || `API error: ${response.status}`;
      onError(errorMessage);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('Failed to read response stream');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
    onDone();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      onDone();
      return;
    }
    onError(err instanceof Error ? err.message : 'An unknown error occurred');
  }
}

export function buildMessages(
  systemPrompt: string,
  chatMessages: Message[]
): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [];
  if (systemPrompt) {
    msgs.push({ role: 'system', content: systemPrompt });
  }
  for (const m of chatMessages) {
    if (m.role === 'user' || m.role === 'assistant') {
      msgs.push({ role: m.role, content: m.content });
    }
  }
  return msgs;
}