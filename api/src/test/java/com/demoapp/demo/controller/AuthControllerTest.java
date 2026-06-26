package com.demoapp.demo.controller;

// "import static" traz métodos prontos pra usar direto pelo nome
import static org.mockito.ArgumentMatchers.anyString;                                  
import static org.mockito.Mockito.when;                                                
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post; 
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath; 
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;                                          
import org.springframework.beans.factory.annotation.Autowired;             
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest; 
import org.springframework.boot.test.mock.mockito.MockBean;                
import org.springframework.http.MediaType;                                 
import org.springframework.test.web.servlet.MockMvc;                      

import com.demoapp.demo.model.User;          
import com.demoapp.demo.service.UserService; 

// @WebMvcTest(AuthController.class): liga SÓ o controller AuthController e a parte web, SEM banco.
@WebMvcTest(AuthController.class)
class AuthControllerTest { // início da classe de testes

  @Autowired
  private MockMvc mockMvc; // o Spring me entrega o bagui que envia requisições e lê respostas

  @MockBean
  private UserService service; // mock do UserService: eu controlo o que ele responde nos testes

  // TESTE 1 (PASSA): cadastro com dados válidos deve responder 200 + usuário criado.
  @Test // marca o método abaixo como um teste
  void signup_comDadosValidos_deveRetornar200EUsuarioCriado() throws Exception {
    User criado = new User();          // crio um usuário para o mock devolver
    criado.setId(1L);                  
    criado.setEmail("novo@email.com");
    criado.setPassword("Senha@123"); 

    // Programo o mock
    when(service.isEmailValid(anyString())).thenReturn(true);    // finjo: e-mail é válido
    when(service.isPasswordValid(anyString())).thenReturn(true); // finjo: senha é forte
    when(service.findByEmail(anyString())).thenReturn(null);     // finjo: e-mail AINDA NÃO existe (null)
    when(service.createUser(anyString(), anyString())).thenReturn(criado); // finjo: criou o usuário

    // Monto o corpo da requisição em JSON (texto com e-mail e senha).
    String body = "{\"email\":\"novo@email.com\",\"password\":\"Senha@123\"}";

    mockMvc.perform(post("/auth/signup")        // envio um POST para a rota de cadastro
            .contentType(MediaType.APPLICATION_JSON) // digo que o corpo é JSON
            .content(body))                          // anexo o corpo (e-mail + senha)
        .andExpect(status().isOk())                  // ESPERO: status 200 (OK)
        .andExpect(jsonPath("$.id").value(1))        // ESPERO: a resposta tem id = 1
        .andExpect(jsonPath("$.email").value("novo@email.com")); // ESPERO: e-mail certo na resposta
  } // end

  
  // TESTE 2 (PASSA): login com credenciais inválidas deve responder 401 + mensagem certa.
  
  @Test
  void signin_comCredenciaisInvalidas_deveRetornar401EMensagemCorreta() throws Exception {
    when(service.isEmailValid(anyString())).thenReturn(true);    //  e-mail é válido
    when(service.isPasswordValid(anyString())).thenReturn(true); //  enha tem formato ok
    when(service.findByEmail(anyString())).thenReturn(null);     //  usuário NÃO existe -> credencial inválida

    // Corpo com um e-mail que "não existe" e uma senha qualquer.
    String body = "{\"email\":\"naoexiste@email.com\",\"password\":\"Senha@123\"}";

    mockMvc.perform(post("/auth/signin")        // envio um POST para a rota de login
            .contentType(MediaType.APPLICATION_JSON) // corpo em JSON
            .content(body))                          // anexo o corpo
        .andExpect(status().isUnauthorized())        // ESPERO: status 401 (não autorizado)
        .andExpect(jsonPath("$.message").value("Credenciais inválidas")); // ESPERO: a mensagem exata
  } // fim do teste 2

  
  // TESTE 3 (REGRESSÃO - bug da Atv4, agora corrigido): e-mail já cadastrado.
  // O requisito exige a mensagem "E-mail já cadastrado". O bug respondia
  // "E-mail já está em uso"; corrigimos no AuthController -> agora este teste passa.

  @Test
  void signup_comEmailJaCadastrado_deveExibirMensagemDoRequisito() throws Exception {
    User existente = new User();            // crio um usuário que "já está cadastrado"
    existente.setId(99L);                   // id qualquer
    existente.setEmail("existente@email.com"); // e-mail que já existe
    existente.setPassword("Senha@123");     // senha qualquer

    when(service.isEmailValid(anyString())).thenReturn(true);    // finjo: e-mail é válido
    when(service.isPasswordValid(anyString())).thenReturn(true); // finjo: senha é forte
    when(service.findByEmail(anyString())).thenReturn(existente); // finjo: e-mail JÁ existe (devolve o usuário)

    // Corpo com o e-mail que já está cadastrado.
    String body = "{\"email\":\"existente@email.com\",\"password\":\"Senha@123\"}";

    mockMvc.perform(post("/auth/signup")        // envio um POST para o cadastro
            .contentType(MediaType.APPLICATION_JSON) // corpo em JSON
            .content(body))                          // anexo o corpo
        .andExpect(status().isConflict())            // ESPERO: status 409 (conflito)
        // ESPERO a mensagem exigida pelo requisito; após a correção, a API responde isso.
        .andExpect(jsonPath("$.message").value("E-mail já cadastrado"));
  } // fim do teste 3 (regressão: confirma a correção do bug)
} // fim da classe de testes
