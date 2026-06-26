import { isEmailValid, getEmailValidationMessage } from "./email";

// "describe" cria um GRUPO de testes com um nome. Junta todos os testes de e-mail.
describe("isEmailValid (função pura)", () => {
  it("retorna true para e-mails bem formados", () => {

    expect(isEmailValid("usuario@dominio.com")).toBe(true);
    
    expect(isEmailValid("pedro.tonin@fag.edu.br")).toBe(true);
  }); 

  // Segundo teste: agora com e-mails ERRADOS, esperando false.
  it("retorna false para e-mails malformados", () => {
    expect(isEmailValid("")).toBe(false);              
    expect(isEmailValid("semarroba.com")).toBe(false); 
    expect(isEmailValid("sem@dominio")).toBe(false);   
    expect(isEmailValid("@dominio.com")).toBe(false);  
  }); 

  // Terceiro teste: verifica a MENSAGEM que a função devolve em cada situação.
  it("getEmailValidationMessage retorna mensagem coerente com o estado", () => {
    expect(getEmailValidationMessage("")).toBe("Email é obrigatório");      // vazio -> cobra o campo
    expect(getEmailValidationMessage("invalido")).toBe("Email inválido");   // formato errado -> avisa
    expect(getEmailValidationMessage("valido@email.com")).toBe("");         // correto -> sem mensagem ("")
  }); 
}); 
