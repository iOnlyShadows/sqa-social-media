// fluxo de curtir sem estar aut
import { test, expect } from "@playwright/test";

test("fluxo de curtida sem login: clicar em Curtir exibe um alerta pedindo autenticação", async ({ page }) => {
 
  let mensagemDoAlerta = "";
  page.once("dialog", async (dialog) => {
    mensagemDoAlerta = dialog.message();
    await dialog.dismiss();
  });

  // Abre a home (usuário deslogado).
  await page.goto("/");

  // Espera o primeiro botão "Curtir" aparecer (os posts vêm da API, então demora um instante).
  const primeiroCurtir = page.getByRole("button", { name: "Curtir" }).first();
  await primeiroCurtir.waitFor();

  // Clica em "Curtir" sem estar logado.
  await primeiroCurtir.click();

  // Espera o alerta ter sido capturado e confiro a mensagem exata.
  await expect.poll(() => mensagemDoAlerta).not.toBe("");
  expect(mensagemDoAlerta).toContain("Você precisa estar autenticado para curtir posts!");
});
