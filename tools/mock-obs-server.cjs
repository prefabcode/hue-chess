const http = require('http');
const crypto = require('crypto');

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const PASSWORD = process.env.OBS_PASSWORD || '';
const PORT = Number(process.env.PORT || 4455);

function encodeText(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  if (len < 126) return Buffer.concat([Buffer.from([0x81, len]), payload]);
  const header = Buffer.alloc(4);
  header[0] = 0x81;
  header[1] = 126;
  header.writeUInt16BE(len, 2);
  return Buffer.concat([header, payload]);
}

function encodeClose(code) {
  const body = Buffer.alloc(2);
  body.writeUInt16BE(code, 0);
  return Buffer.concat([Buffer.from([0x88, 2]), body]);
}

function decodeFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const opcode = buffer[offset] & 0x0f;
    const b1 = buffer[offset + 1];
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let p = offset + 2;
    if (len === 126) {
      if (p + 2 > buffer.length) break;
      len = buffer.readUInt16BE(p);
      p += 2;
    } else if (len === 127) {
      if (p + 8 > buffer.length) break;
      len = Number(buffer.readBigUInt64BE(p));
      p += 8;
    }
    let mask = null;
    if (masked) {
      if (p + 4 > buffer.length) break;
      mask = buffer.subarray(p, p + 4);
      p += 4;
    }
    if (p + len > buffer.length) break;
    const payload = Buffer.from(buffer.subarray(p, p + len));
    if (mask) for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
    offset = p + len;
    frames.push({ opcode, payload });
  }
  return { frames, rest: buffer.subarray(offset) };
}

const server = http.createServer();

server.on('upgrade', (req, socket) => {
  const accept = crypto.createHash('sha1')
    .update(req.headers['sec-websocket-key'] + GUID)
    .digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\n' +
    `Connection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  const salt = crypto.randomBytes(16).toString('base64');
  const challenge = crypto.randomBytes(16).toString('base64');
  const hello = { op: 0, d: { obsWebSocketVersion: '5.5.0', rpcVersion: 1 } };
  if (PASSWORD) hello.d.authentication = { challenge, salt };
  socket.write(encodeText(JSON.stringify(hello)));
  console.log(`[mock] client connected (auth ${PASSWORD ? 'required' : 'disabled'})`);

  let buf = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    const { frames, rest } = decodeFrames(buf);
    buf = rest;

    for (const frame of frames) {
      if (frame.opcode === 8) { socket.end(); return; }
      if (frame.opcode !== 1) continue;

      const msg = JSON.parse(frame.payload.toString('utf8'));

      if (msg.op === 1) {
        if (PASSWORD) {
          const secret = crypto.createHash('sha256').update(PASSWORD + salt).digest('base64');
          const expected = crypto.createHash('sha256').update(secret + challenge).digest('base64');
          if (msg.d.authentication !== expected) {
            console.log(`[mock] AUTH FAILED\n  expected ${expected}\n  received ${msg.d.authentication}`);
            socket.write(encodeClose(4009));
            socket.end();
            return;
          }
          console.log('[mock] auth OK — client auth string matches');
        } else if (msg.d.authentication !== undefined) {
          console.log('[mock] PROBLEM: client sent authentication when none was requested');
        }
        socket.write(encodeText(JSON.stringify({ op: 2, d: { negotiatedRpcVersion: 1 } })));
        console.log('[mock] identified');
        return;
      }

      if (msg.op === 6) {
        const rd = msg.d.requestData;
        const ed = rd.requestData.event_data;
        console.log(
          `[mock] ${msg.d.requestType} vendor=${rd.vendorName} op=${rd.requestType} ` +
          `event=${rd.requestData.event_name} type=${ed?.type} ` +
          (ed?.type === 'state' ? `level=${ed.level} hue=${ed.hue} perks=${ed.perks?.length} next=${ed.nextUnlock?.id}` : JSON.stringify(ed))
        );
        socket.write(encodeText(JSON.stringify({
          op: 7,
          d: { requestType: msg.d.requestType, requestId: msg.d.requestId, requestStatus: { result: true, code: 100 } },
        })));
      }
    }
  });

  socket.on('error', () => {});
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock] obs-websocket mock listening on ws://127.0.0.1:${PORT}`);
});
