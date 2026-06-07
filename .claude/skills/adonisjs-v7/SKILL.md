---
name: adonisjs-v7
description: Conventions and workflows for this AdonisJS v7 + Lucid + Inertia (Vue 3) + Tuyau codebase. Use when creating or editing controllers, models, migrations, validators, transformers, services, middleware, routes, or any backend work in this project. Covers v7-specific features that differ from v6 — auto-generated schema classes, transformers/serializers, typed `#generated` controllers, and `vine.create()`.
---

# AdonisJS v7 (this project)

This is an **AdonisJS v7** app (`@adonisjs/core ^7.3.3`) — NOT v6. The public docs at
docs.adonisjs.com mostly describe v6, so prefer the patterns below and the existing code over
docs when they conflict. Stack: **Lucid** (PostgreSQL), **VineJS**, **Inertia + Vue 3**,
**Tuyau** (end-to-end RPC types), **Japa** (tests), **Edge** (views).

Runtime is **Bun** (`bun.lock`) on Node >= 24. Run ace via `node ace <command>`.

## What's different in v7 (read this first)

1. **Models extend auto-generated schema classes.** `database/schema.ts` is generated from
   migrations (DO NOT EDIT it). Each table gets a `<Name>Schema` class with typed `@column`
   declarations. Your model composes it:

   ```ts
   // app/models/user.ts
   import { UserSchema } from '#database/schema'
   import { compose } from '@adonisjs/core/helpers'
   export default class User extends compose(UserSchema, withAuthFinder(hash)) {
     // add getters, relations, and custom logic here — NOT columns
   }
   ```

   Columns live in the generated schema, not the model. Regenerate after a migration with
   `node ace migration:run` (auto-regenerates) or `node ace schema:generate`. Customize generation
   via `database/schema_rules.ts`.

2. **Validators use `vine.create()`, not `vine.compile()`.**

   ```ts
   export const signupValidator = vine.create({ email: vine.string().email(), ... })
   ```

3. **Routes reference typed controllers from `#generated/controllers`** — no magic strings,
   no manual imports of the controller class:

   ```ts
   import { controllers } from '#generated/controllers'
   router.get('signup', [controllers.NewAccount, 'create'])
   ```

   The `#generated/*` files (controllers, events, listeners) are auto-built by the `init` hooks in
   `adonisrc.ts`. Treat everything under `.adonisjs/` as generated — never edit by hand.

4. **Transformers** (`app/transformers/`, `make:transformer`) shape model data for API responses,
   extending `BaseTransformer<Model>`:

   ```ts
   export default class UserTransformer extends BaseTransformer<User> {
     toObject() {
       return this.pick(this.resource, ['id', 'email', 'initials'])
     }
   }
   ```

5. **Serializers** (`BaseSerializer`) standardize API envelopes. This project has a custom
   `ApiSerializer` in `providers/api_provider.ts` that wraps responses in `{ data: ... }` and
   exposes `ctx.serialize(data)` on every `HttpContext`. Use `ctx.serialize(...)` for API output.

6. **`node ace env:add NAME`** adds an env var to `.env`, `.env.example`, AND the `start/env.ts`
   validation schema in one step. Prefer it over editing those files manually.

## Project layout

```
app/
  controllers/     # HTTP controllers (one action per route)
  models/          # Lucid models — compose generated schema + mixins
  middleware/      # request pipeline
  validators/      # VineJS schemas (vine.create)
  transformers/    # response shaping (BaseTransformer)
  exceptions/      # handler.ts + custom exceptions
config/            # one file per package (auth, database, session, inertia, ...)
database/
  migrations/      # schema changes
  schema.ts        # GENERATED — do not edit
  schema_rules.ts  # tweaks for schema generation
providers/         # IoC bindings + HttpContext extensions (api_provider.ts)
start/
  routes.ts        # route definitions
  kernel.ts        # middleware registration (server/router/named)
  env.ts           # env var validation
inertia/           # Vue 3 frontend (pages/, layouts/, app.ts, ssr.ts)
.adonisjs/         # GENERATED registry (#generated/*) — do not edit
```

Subpath imports (from `package.json` `imports`): `#controllers/*`, `#models/*`, `#validators/*`,
`#transformers/*`, `#services/*`, `#middleware/*`, `#config/*`, `#start/*`, `#database/*`,
`#generated/*`. Always import with these aliases, not relative paths.

## Common workflows — always use ace generators

```bash
node ace make:controller <name>           # --resource (CRUD) | --api (no create/edit views)
node ace make:model <name>
node ace make:migration <name>            # then: node ace migration:run
node ace make:validator <name>            # --resource for create + update schemas
node ace make:transformer <name>
node ace make:service <name>
node ace make:middleware <name>           # registers in start/kernel.ts
node ace make:page <name>                 # Inertia Vue page
node ace make:test <name> --suite=functional
node ace migration:run | migration:fresh | migration:rollback | migration:status
node ace schema:generate                  # regenerate database/schema.ts
node ace db:seed | make:seeder | make:factory
node ace list:routes
node ace env:add MY_VAR
```

Generators wire things up (kernel registration, generated registries, schema). Hand-writing files
skips that wiring — only do it to edit an existing file.

## Conventions in this codebase

- **Controllers**: thin, one action per method, destructure `HttpContext`. Validate with
  `request.validateUsing(someValidator)`. Render pages with `inertia.render('path', props)` or
  `router.on(...).renderInertia(...)`. Redirect with `response.redirect().toRoute('name')`.
- **Auth**: session-based `web` guard (`config/auth.ts`). `auth.use('web').login(user)` /
  `.logout()`. `User.verifyCredentials(email, password)` via the `withAuthFinder` mixin.
  Protect routes with `.use(middleware.auth())`; gate guests with `middleware.guest()`.
- **Dates**: Lucid + Vine return Luxon `DateTime` (see `start/validator.ts` global transform).
- **Models**: put relations, computed getters (e.g. `get initials()`), hooks, and scopes in the
  model body; never declare `@column` there — it belongs in the generated schema.
- **API responses**: return `ctx.serialize(data)` (wraps in `{ data }`, handles pagination meta).
- **Tests**: Japa, suites `unit` / `functional` / `browser` (see `adonisrc.ts`). Use
  `node ace test --suite=functional`.

## Before finishing backend changes

Run the project checks (Bun):

```bash
node ace migration:run    # if you added a migration (also regenerates schema.ts)
bun run typecheck         # tsc --noEmit && vue-tsc for inertia
bun run lint
```
