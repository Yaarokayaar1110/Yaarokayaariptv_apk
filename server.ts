import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Universal CORS headers for all /api calls
  app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // High-performance Stream Relay Proxy for IPTV, Live Streams & Video Files
  // Solves CORS restrictions, byte-range scrubbing, and player compatibility
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    try {
      const rawUrl = targetUrl.split('|')[0].trim();

      // Extract User-Agent from query param or embedded pipe
      let userAgent =
        (req.query.ua as string) ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

      if (targetUrl.toLowerCase().includes('user-agent=')) {
        const uaMatch = targetUrl.match(/user-agent=([^|&]+)/i);
        if (uaMatch && uaMatch[1]) {
          userAgent = decodeURIComponent(uaMatch[1]);
        }
      }

      // Extract Referer from query param or embedded pipe
      let referer = (req.query.referer as string) || '';
      if (!referer && targetUrl.toLowerCase().includes('referer=')) {
        const refMatch = targetUrl.match(/referer=([^|&]+)/i);
        if (refMatch && refMatch[1]) {
          referer = decodeURIComponent(refMatch[1]);
        }
      }

      const headers: Record<string, string> = {
        'User-Agent': userAgent,
        'Accept': '*/*',
        'Connection': 'keep-alive',
      };

      if (referer) {
        headers['Referer'] = referer;
      }

      // Forward client Range header for video seeking/scrubbing
      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const response = await fetch(rawUrl, {
        headers,
        redirect: 'follow',
      });

      const contentType = response.headers.get('content-type') || '';
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

      if (response.headers.get('accept-ranges')) {
        res.setHeader('Accept-Ranges', response.headers.get('accept-ranges')!);
      }
      if (response.headers.get('content-range')) {
        res.setHeader('Content-Range', response.headers.get('content-range')!);
      }
      if (response.headers.get('content-length')) {
        res.setHeader('Content-Length', response.headers.get('content-length')!);
      }

      // Check if this is a continuous live TS stream (e.g. extension=ts or live.ts without content-length)
      const isContinuousStream =
        (rawUrl.includes('extension=ts') || rawUrl.includes('live.ts')) &&
        !response.headers.get('content-length') &&
        response.body;

      if (isContinuousStream && response.body) {
        res.setHeader('Content-Type', 'video/mp2t');
        const nodeStream = Readable.fromWeb(response.body as any);
        nodeStream.on('error', () => {
          res.end();
        });
        req.on('close', () => {
          nodeStream.destroy();
        });
        return nodeStream.pipe(res);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Check if it's genuinely an M3U8 text playlist
      // Real M3U playlists ALWAYS begin with #EXTM3U or #EXT
      const sampleText = buffer.slice(0, 50).toString('utf-8');
      const isM3UPlaylist = sampleText.includes('#EXTM3U') || sampleText.includes('#EXT-X');

      if (isM3UPlaylist) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        const text = buffer.toString('utf-8');
        const baseUrl = rawUrl.substring(0, rawUrl.lastIndexOf('/') + 1);

        // Helper to construct child segment/key proxy URL preserving referer & user-agent
        const makeProxyUrl = (urlToWrap: string) => {
          let proxyUrl = `/api/proxy?url=${encodeURIComponent(urlToWrap)}`;
          if (referer) {
            proxyUrl += `&referer=${encodeURIComponent(referer)}`;
          }
          if (userAgent) {
            proxyUrl += `&ua=${encodeURIComponent(userAgent)}`;
          }
          return proxyUrl;
        };

        const modified = text
          .split('\n')
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            if (trimmed.startsWith('#')) {
              if (trimmed.includes('URI="')) {
                return trimmed.replace(/URI="([^"]+)"/, (_, uri) => {
                  try {
                    const fullUri = uri.startsWith('http://') || uri.startsWith('https://')
                      ? uri
                      : new URL(uri, baseUrl).toString();
                    return `URI="${makeProxyUrl(fullUri)}"`;
                  } catch {
                    return `URI="${uri}"`;
                  }
                });
              }
              return line;
            }

            try {
              let fullUrl = trimmed;
              if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
                fullUrl = new URL(trimmed, baseUrl).toString();
              }
              return makeProxyUrl(fullUrl);
            } catch {
              return trimmed;
            }
          })
          .join('\n');

        return res.status(response.status).send(modified);
      } else {
        // Binary payload: AES-128 key (16 bytes), TS video segment, fMP4 chunk, etc.
        const outgoingType =
          contentType && !contentType.includes('text/plain')
            ? contentType
            : rawUrl.includes('&segment=') || rawUrl.endsWith('.ts')
            ? 'video/mp2t'
            : buffer.length === 16
            ? 'application/octet-stream'
            : contentType || 'application/octet-stream';

        res.setHeader('Content-Type', outgoingType);
        res.setHeader('Content-Length', String(buffer.length));
        return res.status(response.status).send(buffer);
      }
    } catch (err: any) {
      return res.status(500).send(`Proxy fetch failure: ${err?.message || err}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
