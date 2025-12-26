const { WebSocketServer, WebSocket } = require('ws');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket Proxy running on ws://localhost:${PORT}`);

if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is missing in .env.local");
}

wss.on('connection', function connection(ws) {
  console.log('Client connected to Proxy');

  if (!process.env.GEMINI_API_KEY) {
      console.error("Closing: No API Key");
      ws.close(1008, "Missing API Key");
      return;
  }

  const geminiWs = new WebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`
  );

  const messageBuffer = [];

  geminiWs.on('open', function open() {
    console.log('Connected to Gemini');
    // Flush buffer
    messageBuffer.forEach(msg => geminiWs.send(msg));
    messageBuffer.length = 0;
  });

  geminiWs.on('message', function message(data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  geminiWs.on('close', function close(code, reason) {
    console.log(`Gemini disconnected. Code: ${code}, Reason: ${reason}`);
    ws.close();
  });

  geminiWs.on('error', function error(err) {
    console.error('Gemini Upstream Error:', err);
    ws.close(1011, "Gemini Upstream Error");
  });

  ws.on('message', function message(data) {
    if (geminiWs.readyState === WebSocket.OPEN) {
      geminiWs.send(data);
    } else {
        // Buffer if connecting
        if (geminiWs.readyState === WebSocket.CONNECTING) {
            messageBuffer.push(data);
        }
    }
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
    geminiWs.close();
  });
});
