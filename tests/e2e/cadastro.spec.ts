// Teste End-to-End (E2E) do fluxo de cadastro.
import { test, expect } from "@playwright/test";
import { SENHA_FORTE, emailUnico } from "../support/dados";

test("fluxo de cadastro: novo usuário se cadastra e é levado para a home", async ({ page }) => {
  await page.goto("/signup");

  await page.getByPlaceholder("seu@email.com").fill(emailUnico());

  
  const camposSenha = page.getByPlaceholder("••••••••");
  await camposSenha.nth(0).fill(SENHA_FORTE); // campo Senha
  await camposSenha.nth(1).fill(SENHA_FORTE); // campo Confirmar

  // Clica no botão "Criar Conta" que está DENTRO do formulário.
  await page.locator("form").getByRole("button", { name: "Criar Conta" }).click();

  //redirecionar para a página principal.
  await expect(page).toHaveURL("http://localhost:3000/");

  //cabeçalho deve mostrar o botão Sair
  await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
});
