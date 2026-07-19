export function getResponse(message) {
  if (message.includes("גרביל")) {
    return "זה לא ארבע גרביל";
  }
  if ((message.match(/[^\s_]+/g) || []).length !== 4) {
    return "זה לא ארבע מילים";
  }
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK");
    }
    if (
      env.TELEGRAM_WEBHOOK_SECRET &&
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !==
        env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return new Response("Forbidden", { status: 403 });
    }
    try {
      const data = await request.json();
      const message = String(data.message.text);
      const response = getResponse(message);
      if (response) {
        await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: response,
              chat_id: data.message.chat.id,
              reply_to_message_id: data.message.message_id,
            }),
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
    // Always 200 so Telegram doesn't retry updates we can't handle.
    return new Response(null, { status: 200 });
  },
};
