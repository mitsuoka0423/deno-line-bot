const CHANNEL_ACCESS_TOKEN = Deno.env.get("CHANNEL_ACCESS_TOKEN") || '';

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  if (!request.headers.has("content-type")) {
    return new Response(
      JSON.stringify({ error: "please provide 'content-type' header" }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  const contentType = request.headers.get("content-type");
  if (contentType.includes("application/json")) {
    const json = await request.json();
    console.log(json);

    if (json.events.length > 0) {
      await replyMessage(
        json.events[0]?.message?.text,
        json.events[0]?.replyToken,
        CHANNEL_ACCESS_TOKEN
      );
    }

    return new Response();
  }
}

async function replyMessage(
  message,
  replyToken,
  token,
) {
  const body = {
    replyToken,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  };

  return fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
}
