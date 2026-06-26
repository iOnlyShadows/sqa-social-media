import { isPasswordValid, getPasswordValidationMessage } from "./password";

// Grupo de testes da função isPasswordValid
describe("isPasswordValid (função pura)", () => {
  
  it("rejeita senha que não cumpre os critérios (sem caractere especial)", () => {
    expect(isPasswordValid("Senha1234")).toBe(false); // falta caractere especial -> inválida
    expect(isPasswordValid("senha@123")).toBe(false); // falta letra maiúscula -> inválida
    expect(isPasswordValid("SENHA@123")).toBe(false); // falta letra minúscula -> inválida
    expect(isPasswordValid("Senha@abc")).toBe(false); // falta número -> inválida
  });

  // TESTE (PASSA)
  it("aceita senha forte com mais de 8 caracteres", () => {
    // tem 9 caracteres + maiúscula + minúscula + número + especial -> da bom
    expect(isPasswordValid("Abcde1@xy")).toBe(true);
  });

  // TESTE DE REGRESSÃO (bug da Atv4, agora corrigido):
  it("aceita senha forte com exatamente 8 caracteres", () => {
    // "Abcde1@x" tem EXATAMENTE 8 caracteres e cumpre todos os critérios.
    // O requisito é "mínimo 8", então deve ser aceita.
    // O bug usava "<= 8" (rejeitava o 8); corrigimos para "< 8" -> agora passa.
    expect(isPasswordValid("Abcde1@x")).toBe(true);
  });

  // TESTE (PASSA): a mensagem de erro deve listar os critérios que faltaram.
  it("getPasswordValidationMessage informa todos os critérios faltantes", () => {
    expect(getPasswordValidationMessage("")).toBe("Senha é obrigatória"); // vazio -> pede algo na senha
    const msg = getPasswordValidationMessage("abc"); // abc falta td
    expect(msg).toContain("uma letra maiúscula");    // a mensagem deve citar falta de maiúscula
    expect(msg).toContain("um número");              // e falta de número
    expect(msg).toContain("um caractere especial");  // e falta de caractere especial
  });
});
