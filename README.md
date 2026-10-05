# Estoque Fácil

Sistema acadêmico demonstrativo para controle de estoque com abas e perfis de acesso.

## Visão geral

Este projeto é uma aplicação web estática em HTML, CSS e JavaScript para gerenciamento básico de estoque, com autenticação local, organização por perfis de usuário e módulos operacionais para consulta, inventário, pedidos, faturamento, cadastro de produtos e gestão de usuários.

A aplicação foi desenvolvida como demonstração acadêmica e persiste seus dados no navegador usando `localStorage`, sem backend ou banco de dados externo.

## Funcionalidades

- Login e cadastro inicial de administrador
- Controle de acesso por perfil de usuário
- Consulta de estoque
- Inventário
- Pedidos e orçamentos
- Faturamento
- Cadastro de produtos
- Gestão de usuários
- Interface por abas dentro do sistema

## Tecnologias

- HTML5
- CSS3
- JavaScript
- localStorage para persistência do estado

## Estrutura do projeto

```text
.
├── index.html              # tela de login/cadastro
├── sistema.html            # painel principal do sistema
├── css/                    # estilos do projeto
├── js/                     # lógica da aplicação
│   ├── auth.js             # autenticação e sessão
│   ├── estoque.js          # regras de estoque
│   └── app.js              # funcionamento da interface e módulos
├── abas/                   # páginas internas por funcionalidade
└── README.md               # documentação do projeto
```

## Como executar

### Opção 1: abrir direto no navegador

1. Clone o repositório ou baixe os arquivos.
2. Abra o arquivo `index.html` em um navegador.
3. Na primeira execução, cadastre o administrador inicial.
4. Faça login para acessar o sistema.

### Opção 2: usar um servidor local

Você pode servir a pasta localmente com qualquer servidor estático. Exemplo usando Python:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Observações

- Os dados são armazenados no navegador do usuário (`localStorage`).
- Este é um projeto de demonstração acadêmica, então não deve ser usado como solução de produção.
- Não utilize senhas reais em ambiente de teste.

## Fluxo principal

1. O usuário acessa `index.html`.
2. Cria o administrador inicial ou faz login.
3. Ao autenticar, é redirecionado para `sistema.html`.
4. O sistema carrega as abas e módulos disponíveis conforme o perfil do usuário.

## Licença

Este projeto não especifica uma licença explícita no repositório. Caso queira reutilizar ou adaptar o código, verifique antes com o responsável pelo projeto.
