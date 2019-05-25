import { buildApp, configureApp } from "./init";

import { AppModule } from "./app.module";

async function main() {
  (await configureApp(await buildApp(AppModule))).listen(3000);
}
main();
