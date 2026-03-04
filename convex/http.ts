import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/image-proxy",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const requestUrl = new URL(req.url);
    const targetUrl = requestUrl.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing url query param", { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new Response("Invalid target URL", { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response("Unsupported protocol", { status: 400 });
    }

    const upstream = await fetch(parsed.toString(), {
      method: "GET",
    });

    if (!upstream.ok) {
      return new Response("Failed to fetch source image", {
        status: upstream.status,
      });
    }

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const cacheControl =
      upstream.headers.get("cache-control") ?? "public, max-age=300";

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": cacheControl,
        "access-control-allow-origin": "*",
      },
    });
  }),
});

export default http;
