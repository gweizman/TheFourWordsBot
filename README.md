# TheFourWordsBot

A Telegram bot that replies when a message is not exactly four words. Runs as a Cloudflare Worker.

## Development

```sh
npm install
npm test
```

## Deployment

```sh
npx wrangler secret put TELEGRAM_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET   # optional, but recommended
npm run deploy
```

Then point Telegram at the Worker (fill in your bot token, the Worker URL printed by the deploy, and the webhook secret):

```sh
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>&secret_token=<WEBHOOK_SECRET>"
```

`TELEGRAM_WEBHOOK_SECRET` makes the Worker reject requests that don't carry Telegram's `X-Telegram-Bot-Api-Secret-Token` header. If it isn't set, the check is skipped.
