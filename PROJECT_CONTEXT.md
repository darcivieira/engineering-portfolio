# Contexto do portfólio

Portfólio profissional de Darci Vieira em português e inglês, com foco em engenharia de software, arquitetura pragmática, consultoria PJ, contratos internacionais e oportunidades CLT. Python é sua principal especialidade e a linguagem usada nas ilustrações de código.

Preservar a identidade visual existente. Os projetos em destaque são Crucible, Kanbanize SDK, Financial Transfer Challenge e RAG AI Agent. GitHub: https://github.com/darcivieira. LinkedIn: https://www.linkedin.com/in/darcivieira/.

## Desenvolvimento

Requer Node.js 20+ e Python 3. Não há dependências npm externas.

```bash
npm run build
npm test
npm run preview
```

A prévia serve `dist/` em `http://localhost:4173/` e `http://localhost:4173/en/`. Reexecutar o build após editar. Não editar `dist/` diretamente; os arquivos gerados são ignorados pelo Git.

- `content/site.json`: apresentação pessoal, textos PT/EN, identidade e contatos.
- `content/projects.json`: projetos em destaque.
- `content/experience.json`: empresas, períodos e entregas PT/EN.
- `src/main.css` e `src/main.js`: estilos e interações.
- `scripts/build.mjs`: templates HTML.
- `public/data/github-activity.json`: snapshot das contribuições e atividade pública.

## Trajetória aprovada

Manter esta ordem: Aurum Softwares; Cubo Tecnologia → OneGlobal; Involves; Panteu Tecnologia em Seguros.

- A entrada da Involves reúne as passagens de Redes/DevOps (2018–2022) e SRE (2024–2025), preservando os períodos separados.
- Cubo foi a contratante para atendimento à OneGlobal/OneSurety. A integração conectou o CRM de seguro garantia a cerca de dez seguradoras; a quantidade foi informada como aproximada.
- A infraestrutura em Docker Swarm atendia à integração e a outros serviços da empresa.
- O microsserviço de IA tratava e convertia PDFs de apólices, minutas e boletos para extrair dados.
- Zoe era um agente em validação em sandbox, com futura integração ao produto. Seu escopo dependia do perfil de corretor ou cliente; reconhecia informações de propostas e documentos judiciais para criar demandas de seguro garantia e consultar/acompanhá-las. Não apresentar como recurso já lançado em produção.
- Não inventar métricas, resultados ou detalhes de clientes ao complementar as entregas.

## GitHub

O painel representa contribuições do perfil em diferentes projetos, não somente commits dos repositórios em destaque. Exibe 30 dias, total de contribuições, contribuições privadas anônimas e dias com atividade.

A coleta consulta apenas números e datas do calendário para o resumo. O feed detalhado usa o endpoint público sem autenticação e exige `public: true`. Não consultar nem publicar nomes, títulos, links ou conteúdo de projetos privados. Contagens privadas dependem da disponibilidade e das configurações do perfil; o calendário não representa todas as ações feitas na plataforma.

```bash
npm run sync:github
npm run build
```

A coleta local reutiliza a autenticação de `gh` quando não há token no ambiente. O workflow usa `GITHUB_TOKEN`, com `CONTRIBUTIONS_TOKEN` opcional. Credenciais nunca entram nos arquivos gerados. Falhas preservam o snapshot anterior; o site informa o período efetivamente coletado.

## Publicação

Destino previsto: Cloudflare Pages. Comando de build: `npm run build`; diretório de saída: `dist`. E-mail de contato ainda não configurado. O LinkedIn foi confirmado pelo proprietário.

## Validação

Build e testes de páginas bilingues, conteúdo, coleta, exclusão de detalhes privados, paginação e preservação do snapshot. Layout verificado em celular e desktop, com navegação, filtros, expansão das entregas e links de contato.
