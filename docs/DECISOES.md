# Decisões de produto

Registro das decisões já tomadas. Quando algo mudar, atualize aqui e anote a data.

## Estrutura do app (14/10)

- O app tem dois mundos: o **modo criança**, onde o app abre e só tem o PLAY e a lição, e a **área dos adultos**, atrás de um **PIN de 4 números**.
- A área dos adultos tem 5 abas: Início, Jogos, Relatórios, Falar (PECS) e Perfil.
- A lição diária tranca a tela. Para sair antes do fim, é preciso **segurar o X por 3 segundos**.
- Sem mascote por enquanto. O herói da lição é a própria criança.
- A lição é curta de propósito, como uma "lição de casa", para não viciar. No fim, gera o relatório e soma a ofensiva (dias seguidos).

## Lição diária (14/10)

1. **Tasks obrigatórias (casa):** os hábitos escolhidos e ordenados pelos pais. Cada tarefa é um **estímulo dentro do jogo**, não a ação real: a criança assiste a uma animação ou vídeo curto da ação (modelação por vídeo) e depois faz uma interação simples, como pôr os passos em ordem.
2. **Trilha de estímulos:** 3 jogos, um por módulo, 5 rodadas cada.

| Jogo | Módulo | Níveis |
|---|---|---|
| Emoções | Socioemocional | 2 opções com rostos marcados · 3 opções mais sutis · cena e emoção |
| Memória | Cognitivo e memória | 4 · 6 · 8 cartas, com objetos da casa |
| Montar figuras | Motor fino e coordenação | 2 · 4 · 6 peças |

Linguagem e comunicação fica para a versão 2.

## O que medir em cada atividade (14/10)

Tudo automático:

- **Acerto de primeira:** medida principal.
- **Tentativas** até acertar.
- **Ajuda:** dica pedida ou dica automática depois de um tempo parado.
- **Tempo de resposta:** só como tendência. Não entra na nota.
- **Pausas e saídas.**
- **Como se sentiu:** no fim da lição, a criança escolhe entre 3 carinhas. Nada de câmera.

O status de cada módulo (bem / em evolução / precisa reforço) compara **a criança com ela mesma** ao longo das semanas, nunca com outras crianças. Os limites das faixas são ajustáveis pelo profissional. Valores provisórios: 70% ou mais de acerto de primeira = bem; de 40% a 69% = em evolução; abaixo de 40% = precisa reforço.

## Pais e profissionais (14/10)

- Cada pessoa tem o **próprio login**.
- O vínculo profissional ↔ criança pode começar pelos dois lados: o pai convida por e-mail, ou o profissional gera um **código de vínculo** que o pai aprova.
- A aprovação é **tudo ou nada**: o pai vê a lista fixa do que o profissional acessa e aprova ou recusa. Ele pode remover o profissional no Perfil, mas nunca bloqueia partes.
- As escolhas finas ficam com o profissional: quais jogos entram na trilha, quantos por dia e quais observações ficam visíveis para a família.
- Um profissional pode acompanhar **várias crianças** na mesma conta.
- Dados de saúde de criança são sensíveis (LGPD): sempre com autorização do responsável.

## Segurança e dados (14/10)

- **PIN** de 4 números criado no cadastro, guardado só como resumo criptográfico no cofre do celular. Bloqueia sequências fáceis (1234, 0000). 3 erros travam o teclado por 30 s. "Esqueci o PIN" exige a senha da conta.
- O app funciona **sem internet**: tudo fica no celular e sobe para a nuvem quando der.
- No banco, as **regras de acesso** ficam no próprio Supabase (não só no app): o profissional só lê crianças com vínculo aprovado e só mexe na trilha.
- Pedimos **só o necessário** no cadastro (o CPF saiu: não é usado para nada).
- A família pode **apagar todos os dados** do celular no Perfil.

## Nível dos jogos (14/10)

- Começa no nível 1. Sobe quando a criança acerta 80% ou mais de primeira e sem ajuda; desce quando acerta menos de 40%. Vai de 1 a 3.
- Os relatórios usam **% de acertos de primeira** e comparam a criança só com ela mesma.
- Alerta de reforço quando um módulo cai 15 pontos ou mais nos últimos 3 dias.

## Preciso de pausa (15/10)

- A pausa fica **dentro da lição**: um botão "pausa" sempre visível no topo, ao lado do progresso.
- Abre a respiração guiada (o círculo cresce e diminui, 4 s cada) e volta exatamente de onde parou, sem perder nada.
- É diferente do X de sair, que pede para segurar e serve para encerrar a lição.
- No Início da família, o atalho virou "Relatório de hoje". O "Quero falar" continua lá, porque o pai usa com a criança fora do jogo.

## Em aberto

- Planta definitiva da casa.
- Conferir ou não o número do conselho do profissional (hoje é só digitado).
- Sons e música na lição.
- Jogos marcados como "em breve" no catálogo.
- Animações e vídeos finais das tarefas.
