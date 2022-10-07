# README

The API server of Kita accessed by the Web server



## Architecture

- GraphQL API using `graphql` running on Deno Deploy Worker
- fake in-memory database without persistence across Workers
- todo: use Deno Deploy Coordinator for database https://github.com/denoland/deploy_feedback/issues/88
