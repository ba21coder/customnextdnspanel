# NextDNS Panel – OpenAI AI Assistant

## Deploy the secure AI endpoint

1. In Cloudflare, create a new **Worker** and paste the contents of `ai-worker.js`.
2. In Worker **Settings → Variables and Secrets**, add:
   - Secret: `OPENAI_API_KEY` = your OpenAI API key
   - Variable: `ALLOWED_ORIGIN` = `https://bthn1.github.io`
   - (Optional) Variable: `OPENAI_MODEL` = `gpt-4.1-mini`
3. Deploy the Worker. Its URL will look like `https://your-worker-name.workers.dev/chat`.
4. In `ai-assistant.js`, replace `https://YOUR-AI-WORKER.workers.dev/chat` with that URL, then commit the change.

The OpenAI key stays in the Worker secret and is never sent to the browser. The assistant does not receive the NextDNS API key or automatically access account data. It answers general NextDNS and dashboard questions based on the conversation.

## Security notes
- Do not put the OpenAI key in `index.html`, `app.js`, or any other public file.
- Configure an appropriate usage limit/budget in your OpenAI account.
- The Worker only accepts requests from the GitHub Pages origin configured above.
