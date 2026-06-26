export const API_URL = "http://localhost:8080";

export const SENHA_FORTE = "Abcde1@xy";

// Gera um e-mail único a cada execução, usando a hora atual + um número aleatório.
// Isso evita o erro de "e-mail já cadastrado" quando rodamos os testes várias vezes.
export function emailUnico(): string {
  const carimbo = Date.now();
  const aleatorio = Math.floor(Math.random() * 100000);
  return `teste_${carimbo}_${aleatorio}@email.com`;
}
