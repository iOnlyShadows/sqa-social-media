import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright — Atividade 5 (Testes E2E e de API).
 *   - back   http://localhost:8080   (cd ../api  -> ./mvnw spring-boot:run)
 *   - Front http://localhost:3000   (cd ../client -> npm run dev)
 */
export default defineConfig({
  // Onde ficam os testes. Organizamos em duas pastas: e2e/ e api/.
  testDir: ".",
  // Ignora as dependências (a pasta node_modules não tem testes).
  testIgnore: ["**/node_modules/**"],

  // Roda os arquivos de teste em paralelo.
  fullyParallel: true,

  // No CI, falha se alguém esquecer um test.only no código.
  forbidOnly: !!process.env.CI,
  // Tenta de novo só no CI.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Relatórios: list mostra o resultado no terminal; "html" gera um relatório visual.
  reporter: [["list"], ["html", { open: "never" }]],

  // Configurações compartilhadas por todos os testes.
  use: {
    
    baseURL: "http://localhost:3000",
    // Guarda o "trace" (gravação passo a passo) quando um teste falha numa retentativa.
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
