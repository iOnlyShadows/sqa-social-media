import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";

// uma função falsa para o "push"
const pushMock = jest.fn();
// Substituo o módulo de navegação
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// uma função para estado de autenticação
const useAuthMock = jest.fn();
// Substituo o contexto de autenticação por um mock: useAuth devolve o que eu mandar.
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("<Header /> (componente isolado)", () => {
  // beforeEach roda ANTES de cada teste. Aqui zero o registro de chamadas do pushMock.
  beforeEach(() => {
    pushMock.mockClear();
  });

  // TESTE 1: usuário DESLOGADO
  it("usuário deslogado: exibe os botões 'Entrar' e 'Criar Conta'", () => {
    // mock pra deslogado
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    });

  
    render(<Header />);

    // Confiro que os botões de visitante aparecem.
    expect(screen.getByText("Entrar")).toBeInTheDocument();       // ver se entrar aparwce
    expect(screen.getByText("Criar Conta")).toBeInTheDocument();  // ver se criar conta aparece
    // queryByText devolve null se não achar
    expect(screen.queryByText("Sair")).not.toBeInTheDocument();
  }); 

  // TESTE 2: usuário LOGADO deve ver post curdos logout; e o título leva pra home.
  it("usuário logado: exibe 'Posts Curtidos' e 'Sair', e o título leva para '/'", () => {
    // mock pra logado
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    });

  
    render(<Header />);

    // botoa enquanto ta logado
    expect(screen.getByText("Posts Curtidos")).toBeInTheDocument(); // botão "Posts Curtidos"?
    expect(screen.getByText("Sair")).toBeInTheDocument();           // botão "Sair"?

    expect(screen.queryByText("Entrar")).not.toBeInTheDocument();

    // Simulo clique no título "SQA Social Media".
    fireEvent.click(screen.getByText("SQA Social Media"));
    // Confiro que isso disparou a navegação para a página principal ("/").
    expect(pushMock).toHaveBeenCalledWith("/");
  }); // fim do teste 2
}); // fim do grupo de testes
