import { serve, graphql, log } from "./deps.ts";
import { schema } from "./schema.ts";

async function handleRequest(request: Request) {
  log.info("Handling request");

  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname

  if (path == "/api") {
    log.debug("path /api");
    
    if (method == "POST") {
      log.debug("method POST");
      
      // TODO: error handling to not crash server
      
      const req = await request.json();
      
      log.debug("request", req);
      
      /* expected JSON
      see https://graphql.org/learn/serving-over-http/
      {
        "query": "...",
        "operationName": "...",
        "variables": { "myVariable": "someValue", ... }
      }
      */
      
      const res = await graphql({schema, source: req.query, variableValues: req.variables, operationName: req.operationName});
  
      log.debug("response", res);
      
      const response = Response.json(res);
      
      return response;
  
    } else {
      log.debug("method not POST");
      
      const error = { message: "Invalid method." };
      
      const response = Response.json(error, { status: 405 });

      return response;
      
    }

  } else {
    log.debug("path not /api");
    
    const error = { message: "Invalid path." };
    
    const response = Response.json(error, { status: 404 });
    
    return response;
    
  }

}

// When running locally in Deno CLI is listening on http://localhost:8000
serve(handleRequest);
