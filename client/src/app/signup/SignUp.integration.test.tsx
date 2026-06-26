import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUp from "./page";

// nav
const pushMock = jest.fn();
// nav push moch
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const loginMock = jest.fn();
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}));

const signUpMock = jest.fn();
jest.mock("@/service/auth/auth", () => ({
  authService: {
    signUp: (...args: unknown[]) => signUpMock(...args),
  },
}));

// troca o header por um mock vazio para não atrapalhar os testes
jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => null,
}));

// Grupo dos testes de integração da tela de cadastro.
describe("Tela de Cadastro (integração)", () => {
  // zera td antes dos test
  beforeEach(() => {
    pushMock.mockClear();
    loginMock.mockClear();
    signUpMock.mockClear();
  });

  // TESTE 1 (PASSA): dados válidos -> chama a API, faz login e redireciona para home
  it("com dados válidos, chama a API, autentica e redireciona para '/'", async () => {
    // Faço o dublê do signUp "responder com sucesso", devolvendo um usuário.
    signUpMock.mockResolvedValue({ id: 10, email: "novo@email.com" });

    render(<SignUp />);

    // Acho o campo de e-mail pelo seu placeholder ("seu@email.com").
    const emailInput = screen.getByPlaceholderText("seu@email.com");
    // Os DOIS campos de senha têm o mesmo placeholder, então pego os dois de uma vez.
    const [senhaInput, confirmarInput] =
      screen.getAllByPlaceholderText("••••••••");

    // simulacao do user
    fireEvent.change(emailInput, {
      target: { value: "novo@email.com" },
    });
  
    fireEvent.change(senhaInput, { target: { value: "Abcde1@xy" } });
    fireEvent.change(confirmarInput, { target: { value: "Abcde1@xy" } });

    // clique no criar conta
    fireEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

    // Espero (waitFor) pra chamada de rede e confirmando que a API foi chamada com os dados certos.
    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "novo@email.com",
        password: "Abcde1@xy",
      });
    });

    // Confiro que o login foi feito com o usuário devolvido pela API.
    expect(loginMock).toHaveBeenCalledWith({ id: 10, email: "novo@email.com" });
    // push pra home
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  // TESTE 2 (PASSA): senha fraca -> mostra erro de validação e NÃO chama a API.
  it("com senha fraca, exibe erro de validação e NÃO chama a API", async () => {
  
    render(<SignUp />);

    // campos do formulário (e-mail e os dois de senha).
    const emailInput = screen.getByPlaceholderText("seu@email.com");
    const [senhaInput, confirmarInput] =
      screen.getAllByPlaceholderText("••••••••");

    // email ok e senha paia
    fireEvent.change(emailInput, { target: { value: "novo@email.com" } });
   
    fireEvent.change(senhaInput, { target: { value: "abc" } });
    fireEvent.change(confirmarInput, { target: { value: "abc" } });

    // clica no criar conta
    fireEvent.click(screen.getByRole("button", { name: /Criar Conta/i }));

    // findByText espera a mensagem de erro aparecer. Uso um trecho específico (com vírgulas)
    // pra não confundir com a dica fixa "A senha deve conter:" que já existe na tela.
    expect(
      await screen.findByText(/mínimo de 8 caracteres, uma letra maiúscula/i)
    ).toBeInTheDocument();
    // Confiro que, com senha inválida, a API NÃO foi chamada.
    expect(signUpMock).not.toHaveBeenCalled();
  });
});
