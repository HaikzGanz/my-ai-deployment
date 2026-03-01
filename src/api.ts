import { Message } from './types';

export async function streamChat(
  apiKey: string,
  model: string,
  messages: any[], 
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!apiKey) {
    onError('Tolong masukan api key MegaLLM, Tanya Haikal untuk info lebih lanjut.');
    return;
  }

  const typeText = async (text: string, speed = 20) => {
    for (const char of text) {
      if (signal?.aborted) throw new Error('Dibatalkan oleh Komandan.');
      onChunk(char);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  };

  try {
    const lastMessage = messages[messages.length - 1];
    let userText = "";
    
    if (typeof lastMessage.content === 'string') {
      userText = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      const textPart = lastMessage.content.find((c: any) => c.type === 'text');
      if (textPart && textPart.text) {
        userText = textPart.text;
      }
    }

    if (userText && userText.trim().toLowerCase().startsWith('/imagine ')) {
      const imagePrompt = userText.substring(9).trim(); 
      
      if (!imagePrompt) {
          throw new Error("Komandan lupa masukin prompt gambarnya! Ketik /imagine [spasi] [gambar yang dimau]");
      }

      const forceModel = "google/nano-banana-pro";

      await typeText('🎨 *Membangun mantra visual... Sabar ya Komandan...*\n\n');

      const submitRes = await fetch('/api-ai/v1/image/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: forceModel, 
          prompt: imagePrompt, 
          aspect_ratio: "1:1",
          resolution: "1K"
        }),
        signal,
      });

      if (!submitRes.ok) {
        const errText = await submitRes.text();
        throw new Error(`Gagal ngirim request: ${errText}`);
      }
      
      const submitData = await submitRes.json();
      if (submitData.code !== 200) {
        throw new Error(submitData.error || submitData.code_msg || 'Gagal generate gambar.');
      }

      const requestId = submitData.resp_data.request_id;
      
      await typeText(`⏳ *Tiket antrean didapat (ID: ${requestId}). Sedang merender di dapur Nano Banana...*\n\n`);

      while (true) {
        if (signal?.aborted) {
          throw new Error('Dibatalkan oleh Komandan.');
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        const pollRes = await fetch(`/api-ai/v1/image/${requestId}/result`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          signal,
        });

        if (!pollRes.ok) throw new Error('Gagal ngecek status gambar.');
        
        const pollData = await pollRes.json();
        if (pollData.code !== 200) throw new Error(pollData.error || pollData.code_msg);

        const status = pollData.resp_data.status;
        
        if (status === 'success') {
          await typeText(`✅ **Selesai!**\n\n`);
          let imgUrl = pollData.resp_data.image_list[0];
          
          imgUrl = imgUrl.replace('http://', 'https://');
          const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(imgUrl)}`;
          
          onChunk(`![Hasil Generate](${proxiedUrl})\n`);
          onDone();
          return; 
        } else if (status === 'failed' || status === 'error') {
          throw new Error(pollData.resp_data.error || 'Server gagal bikin gambarnya, Bre.');
        }
      }
    }

    const isCustom = localStorage.getItem('USE_CUSTOM_URL') === 'true';
    const customUrl = localStorage.getItem('CUSTOM_API_URL');
    const endpointUrl = isCustom && customUrl ? customUrl : '/api-ai/v1/chat/completions';

    const response = await fetch(endpointUrl, {
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
): any[] { 
  const msgs: any[] = [];
  if (systemPrompt) {
    msgs.push({ role: 'system', content: systemPrompt });
  }
  for (const m of chatMessages) {
    if (m.role === 'user' || m.role === 'assistant') {
      if (m.imageUrl) {
        msgs.push({
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.imageUrl } }
          ]
        });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    }
  }
  return msgs;
}