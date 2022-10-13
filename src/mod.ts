import { serve, graphql } from "./deps.ts";
import { schema } from "./schema.ts";

async function handleRequest(request: Request) {

  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname

  if (path == "/api") {
    if (method == "POST") {
      
      // TODO: error handling to not crash server
      
      const req = await request.json();
      
      /* expected JSON
      see https://graphql.org/learn/serving-over-http/
      {
        "query": "...",
        "operationName": "...",
        "variables": { "myVariable": "someValue", ... }
      }
      */
      
      const res = await graphql({schema, source: req.query, variableValues: req.variables, operationName: req.operationName});
  
      const response = Response.json(res);
      
      return response;
  
    } else {
  
      const error = { message: "Invalid method." };
      
      const response = Response.json(error, { status: 405 });

      return response;
      
    }

  } else {

    const error = { message: "Invalid path." };
    
    const response = Response.json(error, { status: 404 });
    
    return response;
    
  }

}

// When running locally in Deno CLI is listening on http://localhost:8000
serve(handleRequest);
