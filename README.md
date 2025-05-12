# Disposable Mail Generator API

A Node.js Express API that integrates with [disposablemail.com](https://www.disposablemail.com) to generate temporary email addresses, including support for custom email names and inbox checking.

## Features

- Generate random disposable emails (`/getmail`)
- Generate custom emails by passing `name` query (`/getmail?name=yourname`)
- Check email inbox messages (`/chkmail?mail=your_encoded_email`)
- Delete email by `mail` and email `id` (`/delete?mail=testSoumya@xxx.xxx&id=1`)
- Fully serverless and deployable on **Vercel**

## Base URL : 
**In my case base url is** - `https://temp-mail-peach.vercel.app`

## Endpoints

### `GET /getmail`

Generates a new disposable email.

#### Optional Query Parameters:
- `name`: Custom email name to register (e.g., `/getmail?name=soumyatest`)

Returns JSON:
```json
{
  "email": "soumyatest@deliverydaily.org",
  "password": null,
  "session": "your-session-id"
}
```

---

### `GET /chkmail`

Checks inbox for a generated email.

#### Required Query Parameters:
- `mail`: Email name encoded (e.g., `soumyatest%40deliverydaily.org`)

Returns JSON inbox data from DisposableMail.

---
### `GET /delete`

Delete a inboxed email for a specific mail.

#### Required Query Parameters:
- `mail`: Email name encoded (e.g., `soumyatest%40deliverydaily.org`)
- `id` : email id (e.g., `1`)

return success or failed response.

## Deployment

This project is ready to deploy on [Vercel](https://vercel.com/).


### Deploy Steps

1. Push to GitHub
2. Connect the repo to Vercel
3. Vercel auto-detects the build using `vercel.json`

---

## `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ]
}
```

This setup ensures that all routes (`/getmail`, `/chkmail`, etc.) are handled by the Express server.

