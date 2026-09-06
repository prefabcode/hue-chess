const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const AUTH_FAILED_CODE = 4009;
const EVENT_NAME = 'hue-chess';

let socket = null;
let settings = null;
let status = 'disconnected';
let reconnectDelay = RECONNECT_BASE_MS;
let reconnectTimer = null;
let requestCounter = 0;

export const getObsStatus = () => status;

const setStatus = (next) => {
  if (status === next) return;
  status = next;
  console.log(`[perk-chess] OBS bridge: ${next}`);
};

const sha256Base64 = async (value) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
};

const buildAuthentication = async (password, salt, challenge) => {
  const secret = await sha256Base64(password + salt);
  return sha256Base64(secret + challenge);
};

const send = (frame) => {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(frame));
};

const handleFrame = async (frame) => {
  if (frame.op === 0) {
    const identify = { rpcVersion: 1, eventSubscriptions: 0 };
    const auth = frame.d?.authentication;

    if (auth) {
      if (!settings.obsPassword) {
        setStatus('auth-failed');
        socket?.close();
        return;
      }
      identify.authentication = await buildAuthentication(settings.obsPassword, auth.salt, auth.challenge);
    }

    send({ op: 1, d: identify });
    return;
  }

  if (frame.op === 2) {
    reconnectDelay = RECONNECT_BASE_MS;
    setStatus('connected');
  }
};

const scheduleReconnect = () => {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(openSocket, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_MS);
};

// a failed connection fires error, and only sometimes close, so both routes end here
const handleSocketEnd = (instance, code) => {
  if (instance !== socket) return;
  socket = null;

  if (code === AUTH_FAILED_CODE || status === 'auth-failed') {
    setStatus('auth-failed');
    return;
  }
  setStatus('disconnected');
  if (settings?.obsEnabled) scheduleReconnect();
};

const closeSocket = () => {
  const instance = socket;
  socket = null;
  instance?.close();
};

function openSocket() {
  if (!settings?.obsEnabled) return;
  setStatus('connecting');

  let instance;
  try {
    instance = new WebSocket(`ws://${settings.obsHost}:${settings.obsPort}`);
  } catch (error) {
    console.warn('[perk-chess] OBS bridge could not open a socket', error);
    setStatus('disconnected');
    scheduleReconnect();
    return;
  }

  socket = instance;
  instance.addEventListener('message', (event) => handleFrame(JSON.parse(event.data)));
  instance.addEventListener('close', (event) => handleSocketEnd(instance, event.code));
  instance.addEventListener('error', () => handleSocketEnd(instance, null));
}

export const applyObsSettings = (next) => {
  const unchanged = settings
    && settings.obsEnabled === next.obsEnabled
    && settings.obsHost === next.obsHost
    && settings.obsPort === next.obsPort
    && settings.obsPassword === next.obsPassword;

  settings = next;
  if (unchanged) return;

  clearTimeout(reconnectTimer);
  reconnectDelay = RECONNECT_BASE_MS;
  closeSocket();

  if (next.obsEnabled) openSocket();
  else setStatus('disconnected');
};

export const emitToObs = (payload) => {
  if (status !== 'connected') return;
  requestCounter += 1;

  send({
    op: 6,
    d: {
      requestType: 'CallVendorRequest',
      requestId: `hue-chess-${requestCounter}`,
      requestData: {
        vendorName: 'obs-browser',
        requestType: 'emit_event',
        requestData: { event_name: EVENT_NAME, event_data: payload },
      },
    },
  });
};
