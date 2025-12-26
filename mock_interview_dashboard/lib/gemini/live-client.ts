import { EventEmitter } from 'events';
import { INTERVIEWER_PERSONA } from './prompts';

export class GeminiLiveClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  // ... connect code ...

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.emit('connected');
      // Send handshake if needed, or wait for server
      this.sendSetup();
    };

    this.ws.onmessage = async (event) => {
        // ... (truncated for brevity, assumes identical content to before)
      try {
        let msgStr;
        if (event.data instanceof Blob) {
            msgStr = await event.data.text();
        } else {
            msgStr = event.data;
        }
        
        const data = JSON.parse(msgStr);
        this.emit('data', data);

        // Handle Server Content (Audio & Text)
        if (data.serverContent?.modelTurn?.parts) {
            for (const part of data.serverContent.modelTurn.parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                    this.emit('audio', part.inlineData.data);
                }
                if (part.text) {
                    this.emit('content', part.text);
                }
            }
        }
        
        // Handle Turn Complete
        if (data.serverContent?.turnComplete) {
            this.emit('turnComplete');
        }

      } catch (e) {
        console.error('Error parsing Bidi message', e);
      }
    };

    this.ws.onclose = () => this.emit('disconnected');
    this.ws.onerror = (e) => this.emit('error', e);
  }

  sendSetup() {
    const setupMsg = {
      setup: {
        model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
        generation_config: {
          response_modalities: ["AUDIO", "TEXT"],
          speech_config: {
            voice_config: { prebuilt_voice_config: { voice_name: "Puck" } }
          }
        },
        system_instruction: {
          parts: [{ text: INTERVIEWER_PERSONA }]
        }
      }
    };
    this.sendJson(setupMsg);
  }

  sendText(text: string) {
    const msg = {
      client_content: {
        turns: [
          {
            role: "user",
            parts: [{ text: text }]
          }
        ],
        turn_complete: true
      }
    };
    this.sendJson(msg);
  }

  sendAudio(base64Data: string) {
    const msg = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: "audio/pcm",
            data: base64Data
          }
        ]
      }
    };
    this.sendJson(msg);
  }

  sendJson(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
