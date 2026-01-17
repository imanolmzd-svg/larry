
## Development
- Copy `.env.example` → `.env` (in `apps/api`).
- Values are loaded via `dotenv`.
- Do not commit `.env`.

## Production
- Use AWS SSM Parameter Store or Secrets Manager.
- Inject env vars via ECS/Fargate task definition.
- Never ship `.env` files in images.
