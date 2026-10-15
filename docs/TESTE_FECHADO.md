# Teste fechado com famílias (fase 5)

**Objetivo:** descobrir se a lição diária funciona na rotina real de casa, para crianças típicas e autistas, sem virar vício nem obrigação pesada. Não é pesquisa clínica, é teste de produto.

## Quem participa

- **5 a 8 famílias**, com crianças de 4 a 10 anos, misturando:
  - autismo leve, moderado e não verbal
  - pelo menos 1 criança sem diagnóstico (para comparar a usabilidade)
- **2 profissionais** (psicologia, fono ou TO) que já acompanhem alguma dessas crianças.
- **Duração:** 2 semanas.

## Antes de começar

- [ ] Supabase ligado (`docs/SUPABASE.md`), região São Paulo, "Confirm email" desligado.
- [ ] Gerar uma versão instalável (sem o computador ligado):
  - `npx eas build --profile preview`
  - É preciso uma conta Expo. Para iPhone, também uma conta Apple Developer.
  - Sem isso, dá para testar pelo Expo Go, com o computador ligado na mesma rede.
- [ ] Termo de consentimento assinado por cada responsável. Use `TERMO_MODELO.md` e passe por um advogado antes.
- [ ] Grupo de contato com as famílias, só com os responsáveis.
- [ ] Combinar com cada profissional o que ele vai olhar: só observar, sem mudar a terapia por causa do app.

## Semana 0 · instalação (30 min por família, de preferência junto)

1. Instalar o app e fazer o cadastro com a família.
2. Criar o PIN e mostrar que a criança não sai do jogo sem ele.
3. Escolher 3 a 5 hábitos. Menos é melhor no começo.
4. Fazer a primeira lição **junto com a criança**, observando em silêncio.
5. Convidar o profissional pelo e-mail.

## O que observar na primeira lição (anotar na hora)

| Pergunta | Anotação |
|---|---|
| A criança entendeu o PLAY sem ajuda? | |
| Entendeu "assista e depois coloque na ordem"? | |
| Em qual jogo travou ou pediu ajuda? | |
| Tentou sair da lição? Conseguiu? | |
| Quanto tempo levou a lição inteira? | |
| Reação no fim (comemoração, indiferença, frustração)? | |
| Algum som, cor ou animação incomodou? (importante no autismo) | |

## Durante as 2 semanas

O app já registra sozinho, por dia: tarefas, jogos, tempo, tentativas, ajudas, acertos de primeira, nível de cada jogo e como a criança se sentiu. Não precisa pedir planilha às famílias.

**Uma mensagem curta no dia 4 e no dia 10:**

> Oi! Como estão as lições? Tem algo chato, confuso ou que a criança amou? Pode mandar áudio.

## Entrevista final (20 min com o responsável, 15 min com o profissional)

**Responsável**
1. Em quantos dias vocês fizeram a lição? O que fez pular os outros?
2. A criança pedia para jogar ou precisava ser chamada?
3. Mudou alguma coisa na rotina de casa (escovar dentes, se arrumar...)?
4. O relatório ajudou? Entendeu as cores (bem, em evolução, precisa reforço)?
5. A aba **Falar** foi usada? Em que situação?
6. Pagaria por isso? Quanto parece justo por mês?
7. Recomendaria para outra família? De 0 a 10.

**Profissional**
1. Os relatórios mostraram algo que você não via nas sessões?
2. Montou a trilha de algum paciente? Foi fácil?
3. As observações "só para o profissional" fizeram falta ou sobraram?
4. Que informação faltou para usar isso na sessão?

## Como decidir o próximo passo

| Sinal | Meta para seguir em frente |
|---|---|
| Lições por criança | 8 ou mais em 14 dias |
| Lição inteira em | menos de 15 minutos |
| Famílias que recomendariam (nota 9 ou 10) | metade ou mais |
| Profissionais que usariam com outros pacientes | 1 de 2 |
| Problemas que impedem o uso | nenhum sem solução |

## Cuidados

- **Nunca** apresentar o app como tratamento ou diagnóstico.
- Se a criança ficar frustrada de forma repetida, pausar o teste daquela família e conversar.
- Os dados do teste ficam só no projeto do Supabase. Ao final, perguntar a cada família se quer que eles sejam apagados.
