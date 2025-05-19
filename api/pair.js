import { makeWASocket, useSingleFileAuthState, delay, jidNormalizedUser } from '@whiskeysockets/baileys';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import pino from 'pino';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const number = req.query.number;
  if (!number) return res.status(400).json({ error: 'Missing number parameter' });

  const sessionPath = `/tmp/session-${Date.now()}.json`;
  const { state, saveState } = await useSingleFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '22.0']
  });

  try {
    await delay(2000);
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const code = await sock.requestPairingCode(cleanNumber);
    res.status(200).json({ code });
  } catch (err) {
    res.status(500).json({ error: 'Pairing failed', detail: err.message });
  }

  sock.ev.on('creds.update', saveState);

  setTimeout(() => {
    try {
      if (existsSync(sessionPath)) unlinkSync(sessionPath);
    } catch (e) {
      console.error('Error cleaning session:', e);
    }
  }, 15000);
}
