# `@eropple/nestjs-auth-example` #
This project exists to demonstrate how to use
[@eropple/nestjs-auth](https://github.com/eropple/nestjs-auth).
`@eropple/nestjs-auth` requires some initial setup and some careful
consideration when you're layering it into a project, and hopefully some study
of this example project can help you get your own off the ground.

This project is pretty heavily documented. I wrote quite a few comments about
exactly how to work with `@eropple/nestjs-auth` and how to think about its
features as they can apply to your projects. I recommend exploring it in its
entirety and to please file GitHub issues on `@eropple/nestjs-auth` if you have
any questions.

There is no database requirement for this application; it's all in-memory. You
can just run it with `yarn start:dev`. You can also run its end-to-end tests,
which are integrated with `@eropple/nestjs-auth`, with `yarn test:e2e`.

## Modules ##
- The `LoginModule` is a stand-in for a much more fully-featured login flow,
  like Passport or something. All that matters, for our purposes, is that we get
  some sort of session token out of it. (Ours is very clever, I promise.) That
  session token will them be used for both authentication and authorization for
  the rest of the application.
- The `AuthxModule` performs the necessary [module
  injection](https://github.com/eropple/nestjs-auth#module-injection) on behalf
  of `@eropple/nestjs-auth`. It contains the root of the rights tree (though it
  refers out to services that manage subtrees of it, which is the cleanest way
  I've found to avoid having big sprawling methods) and 
- The `MeModule` contains endpoints related to the current user. It owns the
  `user/*` rights subtree.
- The `RecordService` manages CRUD operations for an arbitrary `Record` type,
  which contains a single string as data and some simple ACLs around who can
  read or edit them. It owns the `record/*` rights subtree.

