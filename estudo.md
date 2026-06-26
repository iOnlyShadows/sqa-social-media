---
title: Guia de Estudo Completo — Entendendo o Código dos Testes
disciplina: Qualidade de Software — FAG
objetivo: Compreender de verdade cada ferramenta, conceito e linha dos testes
---

# 📚 Guia de Estudo Completo — Código dos Testes

> [!abstract] Para que serve este guia
> O professor quer avaliar se você **entende o que fez**. Então este documento não é "decoreba": ele explica **o que foi usado, por que foi usado, e o que cada parte faz**. Leia na ordem — cada seção constrói a próxima.

---

## PARTE 1 — As ferramentas (o que foi usado e por quê)

### Por que testar de duas formas diferentes?

O sistema tem duas metades em linguagens diferentes, e cada linguagem tem seu ecossistema de testes:

| Onde | Linguagem | Ferramenta | Para que serve |
| --- | --- | --- | --- |
| Backend (`api/`) | Java + Spring Boot | **JUnit 5** | Estrutura e executa os testes em Java. |
| Backend | Java | **Mockito** (`when`, `@MockBean`) | Cria dublês (mocks) das dependências. |
| Backend | Java | **Spring MockMvc** | Simula requisições HTTP à API sem subir servidor. |
| Frontend (`client/`) | TypeScript/React | **Jest** | Estrutura e executa os testes em JS. Tem mocks embutidos. |
| Frontend | React | **Testing Library** | Desenha componentes e simula o usuário (clicar, digitar). |
| Frontend | React | **jest-dom** | Adiciona verificações de tela (`toBeInTheDocument`). |

> [!info] Por que essas e não outras?
> Foram as ferramentas **já presentes no projeto** (estão no `pom.xml` do backend e no `package.json` do frontend). São também o padrão do mercado: JUnit é o padrão de testes Java; Jest + Testing Library é o padrão recomendado pela própria documentação do React/Next.js.

---

## PARTE 2 — Conceitos fundamentais (entenda isto e o resto flui)

### 2.1 — A anatomia de qualquer teste: padrão AAA

Quase todo teste segue 3 passos (Arrange–Act–Assert):

1. **Arrange (preparar):** monto o cenário (dados, mocks).
2. **Act (agir):** executo a ação que quero testar (chamo a função, clico no botão, envio a requisição).
3. **Assert (verificar):** confiro se o resultado é o esperado.

> [!example] Exemplo mínimo
> ```js
> // Arrange: preparo a entrada
> const senha = "Abcde1@xy";
> // Act: executo a função
> const resultado = isPasswordValid(senha);
> // Assert: verifico o resultado
> expect(resultado).toBe(true);
> ```

### 2.2 — `describe` e `it` (organização)

- `describe("nome", () => {...})` → **agrupa** testes relacionados (uma "pasta" de testes).
- `it("descrição", () => {...})` → **um teste individual**. A descrição diz o que ele verifica. (`test` é sinônimo de `it`.)

### 2.3 — `expect` e os *matchers* (a verificação)

`expect(valor).matcher(esperado)` = "eu **espero** que `valor` satisfaça `matcher`". Os que usei:

| Matcher | Significa |
| --- | --- |
| `.toBe(x)` | é exatamente igual a `x` (valores simples: número, texto, booleano). |
| `.toContain("txt")` | o texto/lista **contém** aquilo. |
| `.toBeInTheDocument()` | o elemento **está na tela** (vem do jest-dom). |
| `.toHaveBeenCalledWith(...)` | a função (dublê) **foi chamada** com aqueles argumentos. |
| `.not.X` | inverte: nega a verificação (ex.: `.not.toHaveBeenCalled()`). |
| `.toHaveLength(n)` | tem `n` itens. |

### 2.4 — Mock / dublê (o conceito mais cobrado)

> [!important] O que é um mock
> Um **mock** (ou "dublê") é um **substituto falso e controlado** de uma peça real do sistema, usado só durante o teste.

**Por que usar?**
1. **Isolar** — quero testar só uma peça; troco as outras por dublês pra elas não interferirem.
2. **Velocidade** — dublê responde na hora; banco/rede de verdade são lentos.
3. **Controle** — eu programo o dublê pra simular qualquer cenário (sucesso, erro, "e-mail já existe").
4. **Previsibilidade** — o resultado é sempre o mesmo, não depende de internet/banco.

**Os tipos de dublê que usei:**

| Código | Onde | O que faz |
| --- | --- | --- |
| `jest.fn()` | Frontend | Cria uma função falsa que registra se/como foi chamada. |
| `jest.spyOn(obj, "metodo")` | Frontend | Substitui um método existente (ex.: `window.alert`) por um dublê. |
| `jest.mock("modulo", factory)` | Frontend | Substitui um **módulo inteiro** (ex.: a navegação, a chamada de rede). |
| `@MockBean` | Backend | Substitui um serviço do Spring por um dublê. |
| `when(x).thenReturn(y)` | Backend (Mockito) | Programa o dublê: "quando chamarem `x`, responda `y`". |

### 2.5 — Síncrono vs. assíncrono (`async` / `await` / `waitFor`)

Algumas ações **demoram** (chamadas de rede, carregar posts). Elas são *assíncronas*. Para esperar elas terminarem antes de verificar, uso:
- `async` na função do teste + `await` na espera.
- `waitFor(() => {...})` → repete a verificação até ela passar (ou estourar o tempo).
- `findByText(...)` → como `getByText`, mas **espera** o elemento aparecer.

---

## PARTE 3 — Frontend, arquivo por arquivo

### 3.1 — `utils/email.test.ts` (função pura)

> [!note] O que é testado
> A função `isEmailValid`, que decide se um e-mail tem formato válido, e `getEmailValidationMessage`, que devolve a mensagem de erro adequada. São **funções puras**: entra um texto, sai um resultado, sem tela nem banco.

**Estrutura:**
- `import { isEmailValid, getEmailValidationMessage } from "./email";` → traz as funções do arquivo real `email.ts`.
- `describe(...)` agrupa; cada `it(...)` é um caso.
- **Teste 1:** e-mails bem formados → espero `true`.
- **Teste 2:** e-mails ruins (sem `@`, sem domínio) → espero `false`.
- **Teste 3:** confiro as **mensagens** retornadas (vazio → "Email é obrigatório"; inválido → "Email inválido"; válido → "").

**Por que existe:** valida que a regra de e-mail funciona — é um teste de **regressão** (se alguém quebrar a validação, este teste acusa).

### 3.2 — `utils/password.test.ts` (função pura) — contém o BUG

> [!note] O que é testado
> `isPasswordValid` (decide se a senha é forte) e `getPasswordValidationMessage` (lista o que falta).

**Os 4 testes:**
1. **(passa)** Senhas que faltam um critério (sem especial, sem maiúscula, etc.) → `false`.
2. **(passa)** Senha forte de 9 caracteres → `true`.
3. **(FALHA — captura o bug)** Senha `"Abcde1@x"`, de **exatamente 8 caracteres**, cumprindo tudo → eu espero `true`, mas o código devolve `false`.
4. **(passa)** A mensagem de erro lista os critérios faltantes (uso `.toContain`).

> [!bug] Por que o teste 3 falha
> O requisito diz "mínimo 8 caracteres", logo 8 é válido. Mas o código usa `password.length <= 8`, que rejeita o 8. Eu escolhi a senha `"Abcde1@x"` de propósito: ela cumpre maiúscula, minúscula, número e especial, então **o único motivo possível dela ser rejeitada é o bug do limite**. Isso se chama **isolar o bug**.

### 3.3 — `components/PostCard.test.tsx` (componente)

> [!note] O que é testado
> O componente `PostCard` (o cartão de um post) de forma **isolada**.

**Ferramentas novas aqui:**
- `render(<PostCard .../>)` → desenha o componente numa **tela virtual** (o jsdom, um navegador simulado na memória).
- `screen.getByText(...)` / `getByRole("button", {name:/Curtir/i})` → **encontram** elementos na tela.
- `fireEvent.click(...)` → **simula o clique** do usuário.

**Os 2 testes:**
1. **(passa)** O card mostra título, corpo e o botão "Curtir".
2. **(passa)** Usuário **deslogado** clica em "Curtir" → confiro **duas coisas**: (a) o `alert` aparece com a mensagem certa, e (b) a função `onLike` **não** é chamada (deslogado não pode curtir).

**Dublês usados:** `jest.fn()` para o `onLike` (pra espionar se foi chamado) e `jest.spyOn(window, "alert")` para o alerta (pra não abrir popup e poder verificar).

> [!tip] Por que `isAuthenticated={false}`?
> Porque o requisito tem comportamento diferente pra logado e deslogado. Passando `false`, eu testo justamente o caminho do visitante.

### 3.4 — `components/Header.test.tsx` (componente)

> [!note] O que é testado
> O `Header` (cabeçalho), que mostra botões diferentes conforme o login.

**Por que tem mocks no topo?**
O Header usa dois "hooks" externos: `useRouter` (navegação do Next) e `useAuth` (estado de login). Eu os substituo por dublês com `jest.mock(...)` para **controlar o cenário**:
- `useAuthMock.mockReturnValue({ isAuthenticated: false })` → finjo deslogado.
- `useAuthMock.mockReturnValue({ isAuthenticated: true })` → finjo logado.

**Os 2 testes:**
1. **(passa)** Deslogado → aparecem "Entrar" e "Criar Conta"; "Sair" **não** aparece (`queryByText(...).not.toBeInTheDocument()`).
2. **(passa)** Logado → aparecem "Posts Curtidos" e "Sair"; e clicar no título "SQA Social Media" chama `pushMock` com `"/"` (confere a navegação).

> [!info] `getByText` vs `queryByText`
> `getByText` dá erro se não achar (uso quando o elemento **deve** existir). `queryByText` devolve `null` se não achar (uso quando quero confirmar que algo **não** existe).

### 3.5 — `app/signup/SignUp.integration.test.tsx` (integração)

> [!note] O que é testado
> A **tela de cadastro inteira** funcionando como um fluxo: página + campos (Input) + botão + validação (utils) + chamada ao serviço.

**O que é mockado (só as bordas):**
- `next/navigation` → o `push` (navegação).
- `@/contexts/AuthContext` → o `login`.
- `@/service/auth/auth` → o `signUp` (a chamada de rede).
- `@/components/Header` → trocado por vazio, porque ele também tem um botão "Criar Conta" e deixaria a busca **ambígua**.

**Os 2 testes:**
1. **(passa)** Dados válidos → preencho e-mail, senha e confirmação (`fireEvent.change`), clico em "Criar Conta", e com `await waitFor(...)` confiro que: a API foi chamada com os dados certos, o `login` foi feito e houve redirecionamento para `"/"`.
2. **(passa)** Senha fraca → confiro que aparece a mensagem de erro e que a API **não** foi chamada.

> [!info] Por que `fireEvent.change`
> Ele simula o usuário **digitando** num campo. O `{ target: { value: "..." } }` é o texto que está sendo digitado.

> [!info] Por que `getAllByPlaceholderText("••••••••")`
> Os dois campos de senha (senha e confirmação) têm o **mesmo placeholder**, então uso `getAll...` (devolve uma lista) e pego os dois de uma vez.

### 3.6 — `app/Home.integration.test.tsx` (integração)

> [!note] O que é testado
> A **página principal** (feed) montando os posts vindos da API.

**O que é mockado:** a navegação, o contexto de auth (finjo deslogado e já carregado, `isLoading: false`, que é o estado que dispara a busca) e o `postsService.getPosts` (faço devolver 2 posts de mentira).

**O teste (passa):** desenho a Home, e com `await screen.findByText(...)` confiro que os títulos "Primeiro post" e "Segundo post" aparecem; depois confiro que há **2 botões "Curtir"** (`getAllByRole(...).toHaveLength(2)`), um por post.

> [!info] Por que `findByText` e não `getByText` aqui
> Porque a busca dos posts é **assíncrona** — os posts não estão na tela no instante zero. `findByText` **espera** eles aparecerem.

---

## PARTE 4 — Backend: `AuthControllerTest.java`

> [!note] O que é testado
> O `AuthController` (cadastro, login) na camada web, com o serviço mockado.

### O cabeçalho (vale para os 3 testes)

```java
@WebMvcTest(AuthController.class)   // sobe só este controller + a parte web, SEM banco
class AuthControllerTest {
  @Autowired private MockMvc mockMvc;   // ferramenta que envia requisições de teste e lê respostas
  @MockBean  private UserService service; // dublê do serviço (eu controlo as respostas)
```

| Peça | O que faz | Por que |
| --- | --- | --- |
| `@WebMvcTest(AuthController.class)` | Carrega só o controller e a infraestrutura web. | Teste **rápido e focado**, sem depender do banco. |
| `@Autowired MockMvc mockMvc` | O Spring me entrega o "carteiro" de requisições. | É como eu chamo a API dentro do teste. |
| `@MockBean UserService service` | Dublê do serviço real. | Pra **isolar** o controller e **simular** cenários. |

> [!info] `import static`
> No topo há vários `import static` (`post`, `status`, `jsonPath`, `when`, `anyString`). Eles permitem usar esses métodos **direto pelo nome**, deixando o teste mais limpo.

### Os 3 testes

**1. (passa) `signup_comDadosValidos...`** — programo o dublê: e-mail válido, senha forte e `findByEmail` retorna `null` (e-mail ainda não existe). Envio um POST com `mockMvc.perform(post(...))` e espero `status 200` + o usuário no corpo (`jsonPath("$.id").value(1)`).

> [!important] Por que `findByEmail` retorna `null` é crucial
> `null` representa "esse e-mail **não existe** no banco". É essa condição que permite o cadastro prosseguir. Se devolvesse um usuário, o controller trataria como duplicado e responderia erro.

**2. (passa) `signin_comCredenciaisInvalidas...`** — `findByEmail` retorna `null` (usuário não existe) → espero `status 401` + mensagem "Credenciais inválidas".

**3. (FALHA — captura o bug) `signup_comEmailJaCadastrado...`** — `findByEmail` retorna um usuário (e-mail **já existe**). Envio o cadastro e verifico:
- `status().isConflict()` (409) → **passa** (status certo).
- `jsonPath("$.message").value("E-mail já cadastrado")` → **falha**, porque a API responde "E-mail já está em uso". É o bug sendo capturado.

> [!info] O que é `jsonPath("$.message")`
> A resposta da API é um JSON, tipo `{"message": "...", "status": 409}`. O `jsonPath("$.message")` **lê o campo `message`** desse JSON pra eu poder verificá-lo.

---

## PARTE 5 — Perguntas que avaliam ENTENDIMENTO (treine estas)

> [!question] "Por que você mockou o UserService em vez de usar o real?"
> Pra isolar o controller e controlar os cenários sem depender do banco. Assim o teste é rápido, previsível e testa só a lógica do controller.

> [!question] "Qual a diferença entre `getByText` e `findByText`?"
> `getByText` busca **imediatamente** (uso quando o elemento já está na tela). `findByText` **espera** o elemento aparecer (uso para conteúdo assíncrono, como posts vindos da API).

> [!question] "Por que o teste de bug usa uma senha com exatamente 8 caracteres e todos os critérios?"
> Pra **isolar o bug**: garantindo todos os outros critérios, o único motivo possível de rejeição é o erro do limite (`<= 8`). Assim a falha aponta exatamente para o bug.

> [!question] "O que `render` e `fireEvent` fazem por baixo dos panos?"
> `render` monta o componente React num DOM virtual (jsdom). `fireEvent` dispara eventos nesse DOM (clique, digitação), como se o usuário tivesse feito.

> [!question] "O que é `@WebMvcTest` e por que não testou com o sistema todo?"
> Ele sobe só a camada web do controller, sem banco nem o resto da aplicação. Testar a fatia certa deixa o teste rápido e o erro fácil de localizar.

> [!question] "Esses testes de bug falhando não são um problema na sua entrega?"
> Não — são intencionais e exigidos pelo enunciado. A falha é a **evidência** do bug. Os testes que passam é que protegem contra regressões.

> [!question] "Se você fosse corrigir os bugs, o que mudaria?"
> No frontend, trocaria `password.length <= 8` por `< 8`. No backend, trocaria a string para "E-mail já cadastrado". Aí os testes de bug passariam a verde.
