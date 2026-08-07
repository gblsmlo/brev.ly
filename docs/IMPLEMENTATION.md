# Plano de implementação

## Fase 1 — Fundação e contratos

- Inicializar Git e workspaces `web` e `server`.
- Configurar React SPA, Fastify, CORS, TypeScript, scripts e Dockerfile.
- Registrar requisitos, contrato HTTP, arquitetura e decisões.
- Validar instalação, lint, tipos, testes, builds e configuração Docker.

**Sucesso:** primeiro commit autocontido e verificável.

## Fase 2 — Persistência e API de links

- Criar testes das regras e endpoints.
- Modelar tabela e migration Drizzle.
- Implementar criação, conflito, resolução, exclusão, incremento atômico e paginação.

**Sucesso:** migrations executadas em PostgreSQL e contrato principal coberto por testes.

## Fase 3 — Jornada React SPA

- Implementar o Style Guide do Figma.
- Criar formulário, listagem, estados de carregamento/vazio/erro e exclusão.
- Integrar redirecionamento, incremento e página não encontrada.
- Verificar responsividade mobile-first.

**Sucesso:** jornadas obrigatórias passam em testes e no navegador.

## Fase 4 — CSV e CDN

- Gerar CSV com os quatro campos obrigatórios.
- Enviar objeto com UUID para Cloudflare R2.
- Expor download na interface e testar falhas da integração.

**Sucesso:** CSV acessível pela URL pública retornada pela API.

## Fase 5 — Aceitação e entrega

- Executar a matriz completa de requisitos.
- Construir e executar a imagem Docker.
- Revisar variáveis, README, acessibilidade, desempenho e escopo da branch principal.
- Publicar repositório e registrar evidências finais.

**Sucesso:** todos os requisitos obrigatórios possuem evidência reproduzível.

