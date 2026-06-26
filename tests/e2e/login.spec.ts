// Teste End-to-End (E2E) do fluxo de login.
import { test, expect } from "@playwright/test";
import { API_URL, SENHA_FORTE, emailUnico } from "../support/dados";

test("fluxo de login: usuário cadastrado faz login e é levado para a home", async ({ page, request }) => {
  const email = emailUnico();

  // Pré-condição: crio o usuário direto pela API, pra garantir que ele existe antes do login.
  await request.post(`${API_URL}/auth/signup`, { data: { email, password: SENHA_FORTE } });

  // Abre a tela de login.
  await page.goto("/signin");

  // Preenche e-mail e senha (na tela de login só há um campo de senha).
  await page.getByPlaceholder("seu@email.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(SENHA_FORTE);

  // Clica no botão "Entrar" do formulário (o cabeçalho também tem um "Entrar").
  await page.locator("form").getByRole("button", { name: "Entrar" }).click();

  // Login certo -> vai pra home e o cabeçalho mostra "Sair".
  await expect(page).toHaveURL("http://localhost:3000/");
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
