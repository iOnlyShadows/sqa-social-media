// sem olhar o código por dentro. Usamos o "request" do Playwright pra isso.
import { test, expect } from "@playwright/test";
import { API_URL, SENHA_FORTE, emailUnico } from "../support/dados";

test.describe("API de autenticação (caixa-preta)", () => {
  // TESTE DE API 1 — cadastro com sucesso
  test("POST /auth/signup com dados válidos retorna 200 e o usuário criado", async ({ request }) => {
    const email = emailUnico(); // e-mail novo, pra não dar conflito
    const res = await request.post(`${API_URL}/auth/signup`, {
      data: { email, password: SENHA_FORTE }, // corpo enviado em JSON
    });

    expect(res.status()).toBe(200);     // a API deve responder 200 (OK)
    const body = await res.json();      // leio o corpo da resposta
    expect(body.email).toBe(email);     // o e-mail devolvido deve ser o que mandei
    expect(body.id).toBeDefined();      // e deve ter vindo um id gerado
  });

  // TESTE DE API 2 — e-mail duplicado
  test("POST /auth/signup com e-mail duplicado retorna 409", async ({ request }) => {
    const email = emailUnico();
    // 1ª vez: cria o usuário normalmente.
    await request.post(`${API_URL}/auth/signup`, { data: { email, password: SENHA_FORTE } });
    // 2ª vez com o MESMO e-mail: deve dar conflito.
    const res = await request.post(`${API_URL}/auth/signup`, { data: { email, password: SENHA_FORTE } });

    expect(res.status()).toBe(409);     // 409 = conflito (e-mail já existe)
    const body = await res.json();
    
    // "E-mail já está em uso". Esse é o bug que capturamos na Atividade 4.
    
    expect(body.message).toContain("E-mail");
  });

  // TESTE DE API 3 — login com sucesso
  test("POST /auth/signin com credenciais corretas retorna 200", async ({ request }) => {
    const email = emailUnico();
    // pré-condição: crio o usuário antes de tentar logar.
    await request.post(`${API_URL}/auth/signup`, { data: { email, password: SENHA_FORTE } });

    const res = await request.post(`${API_URL}/auth/signin`, {
      data: { email, password: SENHA_FORTE },
    });

    expect(res.status()).toBe(200);   // login certo -> 200
    const body = await res.json();
    expect(body.email).toBe(email);   // devolve o usuário logado
  });

  // TESTE DE API 4 — login com senha errada
  test("POST /auth/signin com senha errada retorna 401 e 'Credenciais inválidas'", async ({ request }) => {
    const email = emailUnico();
    await request.post(`${API_URL}/auth/signup`, { data: { email, password: SENHA_FORTE } });

    const res = await request.post(`${API_URL}/auth/signin`, {
      data: { email, password: "Errada@999" }, // senha de formato válido, mas incorreta
    });

    expect(res.status()).toBe(401);   // 401 = não autorizado
    const body = await res.json();
    expect(body.message).toBe("Credenciais inválidas");
  });

  // TESTE DE API 5 — e-mail com formato inválido
  test("POST /auth/signup com e-mail inválido retorna 422", async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/signup`, {
      data: { email: "semarroba", password: SENHA_FORTE }, // sem "@" -> inválido
    });

    expect(res.status()).toBe(422);   // 422 = entrada inválida
    const body = await res.json();
    expect(body.message).toBe("E-mail inválido");
  });

  // TESTE DE API 6 — reset de senha com e-mail inexistente
  test("POST /auth/reset-password com e-mail não cadastrado retorna 404", async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/reset-password`, {
      data: { email: emailUnico() }, // e-mail válido no formato, mas que não existe no banco
    });

    expect(res.status()).toBe(404);   // 404 = não encontrado
    const body = await res.json();
    expect(body.message).toBe("Usuário não encontrado");
  });
});
