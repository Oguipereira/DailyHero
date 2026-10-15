# Daily Hero — guia para o Claude

- App em **React Native com Expo** (expo-router, TypeScript). Telas em `src/app`.
- **Idioma:** textos do app, comentários e mensagens de commit em português do Brasil.
- **Cores, fontes e medidas:** sempre de `src/theme/tokens.ts`. Nunca escrever cores soltas.
- **Acessibilidade é obrigatória:** área de toque de no mínimo 44 pontos, `accessibilityRole` e `accessibilityLabel` em botões só com ícone, contraste de texto 4.5:1. Toda animação respeita "reduzir movimento".
- **Público sensível:** crianças autistas. Nada de sons ou animações bruscas, nada de mensagens de erro assustadoras para a criança, nada que incentive jogar por muito tempo.
- **Decisões de produto:** ler `docs/DECISOES.md` antes de mudar regras do app.
- **Quem está aprendendo:** o Guilherme acompanha o desenvolvimento e está aprendendo. Explique o que mudou e por quê, em linguagem simples, em cada pull request.
- Antes de abrir PR: `npx tsc --noEmit` precisa passar.
