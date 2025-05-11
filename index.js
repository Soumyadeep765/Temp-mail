//index.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

async function getCustomMail(name) {
  const checkRes = await axios.post(
    'https://www.disposablemail.com/index/email-check/',
    new URLSearchParams({ email: name, format: 'json' }),
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://www.disposablemail.com',
      }
    }
  );

  if (checkRes.data !== 'ok') {
    return null;
  }

  const createRes = await axios.post(
    'https://www.disposablemail.com/index/new-email/',
    new URLSearchParams({ emailInput: name, format: 'json' }),
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://www.disposablemail.com',
      }
    }
  );

  const cookie = createRes.headers['set-cookie']?.find(c => c.includes('TMA='))?.split(';')[0];
  const email = decodeURIComponent(cookie?.split('=')[1]);

  return { email, session: cookie };
}

async function getDefaultMail() {
  const homeRes = await axios.get('https://www.disposablemail.com', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'DNT': '1',
      'Referer': 'https://www.disposablemail.com/',
    },
    decompress: true
  });

  const setCookie = homeRes.headers['set-cookie'];
  const phpsessid = setCookie?.find(c => c.includes('PHPSESSID'))?.split(';')[0];
  const csrf = homeRes.data.match(/const CSRF\s*=\s*"(.+?)"/)?.[1];

  const inboxRes = await axios.get(`https://www.disposablemail.com/index/index?csrf_token=${csrf}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.disposablemail.com/',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': phpsessid
    },
    decompress: true
  });

  return {
    email: inboxRes.data?.email || null,
    password: inboxRes.data?.heslo || null, // No idea about the pass uses 🙂
    //session: phpsessid.replace('PHPSESSID=', '') //No need it currently it's PHP session id only 
  };
}

app.get('/getmail', async (req, res) => {
  try {
    const name = req.query.name;
    if (name) {
      const result = await getCustomMail(name);
      if (!result) return res.status(400).json({ error: 'Mail not available' });
      return res.json(result);
    } else {
      const data = await getDefaultMail();
      return res.json(data);
    }
  } catch {
    res.status(500).send('Failed to generate mail');
  }
});

app.get('/chkmail', async (req, res) => {
  const mail = req.query.mail;
  if (!mail) return res.status(400).send('Missing mail query parameter');

  try {
    const response = await axios.get('https://www.disposablemail.com/index/refresh', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'sec-ch-ua-platform': '"Android"',
        'x-requested-with': 'XMLHttpRequest',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-fetch-site': 'same-origin',
        'referer': 'https://www.disposablemail.com/',
        'accept-language': 'en-US,en;q=0.9,bn;q=0.8,ru;q=0.7,zh-CN;q=0.6,zh;q=0.5,hi;q=0.4,la;q=0.3',
        'Cookie': `TMA=${encodeURIComponent(mail)}`
      }
    });

    res.json(response.data);
  } catch {
    res.status(500).send('Failed to check mail');
  }
});

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Disposable Mail API</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f9f9f9; color: #333; padding: 2rem; }
        h1 { color: #444; }
        code { background: #eee; padding: 2px 6px; border-radius: 4px; }
        ul { line-height: 1.8; }
      </style>
    </head>
    <body>
      <h1>Disposable Mail API</h1>
      <p>This API allows you to generate disposable email addresses and check their inbox.</p>
      <h3>Endpoints:</h3>
      <ul>
        <li><strong>GET <code>/getmail</code></strong> – Generate a random email address</li>
        <li><strong>GET <code>/getmail?name=yourname</code></strong> – Generate a custom email if available</li>
        <li><strong>GET <code>/chkmail?mail=encoded_mail</code></strong> – Check inbox for received messages</li>
      </ul>
      <h4>Example:</h4>
      <pre><code>/getmail?name=sounyaa00</code></pre>
    </body>
    </html>
  `);
});

module.exports = app;
