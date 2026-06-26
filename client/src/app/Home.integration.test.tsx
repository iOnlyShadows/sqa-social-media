import { render, screen } from "@testing-library/react";
import Home from "./page";

// push mock
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// mock deslogado
// (isLoading=false), que é o estado que faz a Home disparar a busca dos posts.
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,            
    isAuthenticated: false, 
    isLoading: false,       // autenticação já terminou de carregar
  }),
}));

// mock dos posts
const getPostsMock = jest.fn();
// Dublê do serviço de posts: getPosts usa meu getPostsMock; toggleLikePost é só um falso.
jest.mock("@/service/posts/posts", () => ({
  postsService: {
    getPosts: (...args: unknown[]) => getPostsMock(...args),
    toggleLikePost: jest.fn(),
  },
}));


describe("Página principal / Feed de posts (integração)", () => {
  // TESTE (PASSA)
  it("renderiza um card para cada post retornado pela API", async () => {
    // mock devolve 2 posts
    getPostsMock.mockResolvedValue({
      posts: [
        { id: 1, title: "Primeiro post", body: "Corpo 1", liked: false },
        { id: 2, title: "Segundo post", body: "Corpo 2", liked: false },
      ],
      total: 2, // total de posts
      skip: 0,  // quantos pulou (paginação)
      limit: 10, // quantos por página
    });

    //  vai chamar o getPosts mockado ao montar
    render(<Home />);

  
    expect(await screen.findByText("Primeiro post")).toBeInTheDocument();
    expect(await screen.findByText("Segundo post")).toBeInTheDocument();
    
    expect(screen.getByText("Corpo 1")).toBeInTheDocument();

    // getAllByRole pega TODOS os botões "Curtir" da tela (um por post).
    const botoesCurtir = screen.getAllByRole("button", { name: /Curtir/i });
    // Confiro que há exatamente 2 botões "Curtir" (porque vieram 2 posts).
    expect(botoesCurtir).toHaveLength(2);
  }); 
}); 
