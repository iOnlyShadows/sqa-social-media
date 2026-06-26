import { test, expect } from "@playwright/test";
import { API_URL } from "../support/dados";

test.describe("API de posts (caixa-preta)", () => {
  // TESTE DE API 7 — listar posts
  test("GET /posts retorna 200 com uma lista de posts", async ({ request }) => {
    const res = await request.get(`${API_URL}/posts?limit=5`); // peço 5 posts

    expect(res.status()).toBe(200);                  // deve responder 200
    const body = await res.json();
    expect(Array.isArray(body.posts)).toBe(true);    // o campo "posts" deve ser uma lista
    expect(body.posts.length).toBeGreaterThan(0);    // e deve ter pelo menos 1 post
    expect(body.posts[0]).toHaveProperty("title");   // cada post tem título
    expect(body.posts[0]).toHaveProperty("body");    // e corpo
  });
});
