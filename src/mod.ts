import { serve } from "$std/http/server.ts";
import { log } from "$utils/logger.ts";
import { database } from "./database.ts"

async function handleRequest(request: Request) {
  log.info("Handling request");

  const method = request.method;

  if (method != "GET") {
    log.debug("method not GET");

    const error = { message: "Invalid method." };

    const response = Response.json(error, { status: 405 });

    return response;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path == "/entry") {
    log.debug("path /entry");
    
    const id = url.searchParams.get("id");

    if (!id) {
      log.debug("no query 'id'");

      const error = { message: "Invalid query." };

      const response = Response.json(error, { status: 405 });

      return response;
    }

    // TODO: error handling to not crash server
    const res = await database.entry(id);

    log.debug("response", res);

    const response = Response.json(res);

    return response;

  } else if (path == "/entries") {
    log.debug("path /entries");
    
    const value = url.searchParams.get("value");
    const amount = url.searchParams.get("amount");
    const before = url.searchParams.get("before");
    const after = url.searchParams.get("after");

    if (!value || !amount || (!before && !after)) {
      log.debug("no query 'value' or 'amount' or ('before' or 'after')");

      const error = { message: "Invalid query." };

      const response = Response.json(error, { status: 405 });

      return response;
    }

    // TODO: error handling to not crash server
    const res = await database.findEntries(value, amount, after, before);

    log.debug("response", res);

    const response = Response.json(res);

    return response;
    
  } else {
    log.debug("path not /entry or /entries");

    const error = { message: "Invalid path." };

    const response = Response.json(error, { status: 404 });

    return response;
  }
}

// When running locally in Deno CLI is listening on http://localhost:8000
serve(handleRequest);
