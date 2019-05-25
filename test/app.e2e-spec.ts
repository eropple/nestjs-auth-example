import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';
import { configureApp } from './../src/init';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await configureApp(app);
    await app.init();
  });

  async function doLogin(username: string, scopes: Array<string>): Promise<string> {
    const { body } = 
      await request(app.getHttpServer())
        .post('/login')
        .send({ username, password: "hunter2", scopes })
        .expect(200);

    return body.token;
  }

  it('/hello (GET)', async () => {
    await request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect({ message: 'Hello, stranger!' });

    const aliceToken = await doLogin("alice", []);

    await request(app.getHttpServer())
      .get("/hello")
      .set("X-App-Token", aliceToken)
      .expect(200)
      .expect({ message: 'Hello, alice!' });
  });

  it("/me (GET)", async () => {
    // as we've discussed elsewhere, grants are globs, and since the required
    // scope is `user/view`, these should all work.
    const validToken1 = await doLogin("alice", ["user/view"]);
    const validToken2 = await doLogin("alice", ["user/*"]);
    const validToken3 = await doLogin("alice", ["**/*"]);
    const validToken4 = await doLogin("alice", ["**/view"]);
    const invalidToken = await doLogin("alice", ["nope"]);


    for (const token of [validToken1, validToken2, validToken3, validToken4]) {
      await request(app.getHttpServer())
        .get("/me")
        .set("X-App-Token", token)
        .expect(200);
    }

    await request(app.getHttpServer())
      .get("/me")
      .set("X-App-Token", invalidToken)
      .expect(403);
  });

  it("/records/public (GET)", async () => {
    const aliceView = await doLogin("alice", ["record/*/view"]);
    const bobView = await doLogin("bob", ["record/*/view"]);
    const charlieView = await doLogin("charlie", ["record/*/view"]);

    // unauthed users should be able to see the public item
    await request(app.getHttpServer())
      .get("/records/public")
      .expect(200);

    for (const t of [aliceView, bobView, charlieView]) {
      // it's public, so everyone should be able to see it
      await request(app.getHttpServer())
        .get("/records/public")
        .set("X-App-Token", t)
        .expect(200);
    }
  });

  it("/records/noexist (GET)", async () => {
    // if a record doesn't exist, we want to 403, not 404, to hide whether or
    // not a record exists at all.

    const aliceView = await doLogin("alice", ["record/*/view"]);

    await request(app.getHttpServer())
      .get("/records/noexist")
      .set("X-App-Token", aliceView)
      .expect(403);
  })

  it("/records/bar (GET)", async () => {
    // foo is visible by alice and bob, and is not public.
    const aliceView = await doLogin("alice", ["record/*/view"]);
    const bobView = await doLogin("bob", ["record/*/view"]);
    const charlieView = await doLogin("charlie", ["record/*/view"]);

    for (const t of [aliceView, bobView]) {
      // it's public, so everyone should be able to see it
      await request(app.getHttpServer())
        .get("/records/bar")
        .set("X-App-Token", t)
        .expect(200);
    }

    await request(app.getHttpServer())
      .get("/records/bar")
      .set("X-App-Token", charlieView)
      .expect(403);
  });

  it ("/records/public (PUT)", async () => {
    // public is publicly visible, but only bob can edit it.
    const aliceView = await doLogin("alice", ["record/*/*"]);
    const bobView = await doLogin("bob", ["record/*/*"]);

    const { body: body1 } = await request(app.getHttpServer())
      .get("/records/public")
      .set("X-App-Token", aliceView)
      .expect(200);

    expect(body1.lastEditor).toBe(null);
    expect(body1.content).toBe("bob can edit");

    // alice can't edit
    await request(app.getHttpServer())
      .put("/records/public")
      .send({ content: "this will fail" })
      .set("X-App-Token", aliceView)
      .expect(403);

    await request(app.getHttpServer())
      .put("/records/public")
      .send({ content: "bob DID edit" })
      .set("X-App-Token", bobView)
      .expect(200);

    const { body: body2 } = await request(app.getHttpServer())
      .get("/records/public")
      .expect(200);

    expect(body2.lastEditor).toBe("bob");
    expect(body2.content).toBe("bob DID edit");
  })
});
