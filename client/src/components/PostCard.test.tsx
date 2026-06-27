import { render, screen, fireEvent } from "@testing-library/react";
import PostCard from "./PostCard";
import { Post } from "@/service/types";

// Grupo de testes do componente PostCard.
describe("<PostCard /> (componente isolado)", () => {
  // post teste
  const post: Post = {
    id: 1,                               
    title: "Título de exemplo",          
    body: "Corpo do post de exemplo.",   
    liked: false,                        
  };

  // TESTE: o card deve mostrar o título, o corpo e o botão curtir.
  it("renderiza título, corpo e o botão Curtir", () => {
    // Desenha o PostCard na tela virtual, passando o post e dizendo que o usuário NÃO está logado.
    render(
      <PostCard post={post} isAuthenticated={false} onLike={jest.fn()} />
    );

    // getByText acha o elemento pelo texto. toBeInTheDocument confere que ele está na tela.
    expect(screen.getByText("Título de exemplo")).toBeInTheDocument();        
    expect(screen.getByText("Corpo do post de exemplo.")).toBeInTheDocument();
    // getByRole("button", {name:/Curtir/i}) acha o botão escrito "Curtir".
    expect(
      screen.getByRole("button", { name: /Curtir/i })
    ).toBeInTheDocument();
  }); 

  // TESTE: usuário DESLOGADO clicando em Curtir -> mostra alerta e NÃO curte.
  it("usuário deslogado: ao clicar em Curtir, exibe alert e NÃO chama onLike", () => {
    // função falsa para o "onLike"
    const onLike = jest.fn();
    // Substituo o alerta de verdade
    const alertMock = jest
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    // card como deslogado
    render(<PostCard post={post} isAuthenticated={false} onLike={onLike} />);

    // simula clique no like
    fireEvent.click(screen.getByRole("button", { name: /Curtir/i }));

    // ver se o alerta ta certo
    expect(alertMock).toHaveBeenCalledWith(
      "Você precisa estar autenticado para curtir posts!"
    );
    // ve se a função de curtir NÃO foi chamada
    expect(onLike).not.toHaveBeenCalled();

    
    alertMock.mockRestore();
  });

  // TESTE (Atividade 6): o card deve exibir a contagem de likes e dislikes.
  it("exibe o número de likes e dislikes do post", () => {
    const postComReacoes: Post = {
      id: 2,
      title: "Post com reações",
      body: "Corpo",
      liked: false,
      reactions: { likes: 42, dislikes: 5 },
    };

    render(
      <PostCard post={postComReacoes} isAuthenticated={false} onLike={jest.fn()} />
    );

    // Os números de likes e dislikes devem aparecer na tela.
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
