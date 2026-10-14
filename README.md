# Daily Hero

App para crianças de 4 a 10 anos, incluindo crianças autistas (leve, moderado e não verbais), que une criação de hábitos, estímulos cognitivos e acompanhamento por pais e profissionais.

Versão atual: **0.3.0 (fases 0 a 4 prontas; fase 5 é o teste com famílias)**.

## Como rodar no seu celular (Windows)

Você só faz a parte 1 uma vez.

### 1. Instalar as ferramentas

1. **Node.js (versão LTS):** baixe em https://nodejs.org e instale com as opções padrão.
2. **Git:** baixe em https://git-scm.com/download/win e instale com as opções padrão.
3. **Expo Go no celular:** instale pela Play Store ou App Store.

Para conferir, abra o **PowerShell** e rode:

```powershell
node -v
git --version
```

Se aparecerem números de versão, está tudo certo.

### 2. Baixar o projeto

```powershell
cd $HOME\Documents
git clone https://github.com/Oguipereira/DailyHero.git
cd DailyHero
npm install
```

### 3. Abrir o app

```powershell
npm start
```

Vai aparecer um **QR code** no terminal.

- **Android:** abra o Expo Go e toque em "Scan QR code".
- **iPhone:** abra a câmera e aponte para o QR code.

O celular e o computador precisam estar **no mesmo Wi-Fi**. Se não abrir, rode `npm start -- --tunnel`.

Cada vez que o código muda, o app atualiza sozinho no celular.

### 4. Pegar as mudanças mais novas

```powershell
git pull
npm install
npm start
```

## Como o projeto está organizado

```
src/
  app/                 telas (cada arquivo é uma tela)
    index.tsx          abertura com o logo girando
    login.tsx, cadastro.tsx, pin-novo.tsx, habitos.tsx   primeiro acesso
    crianca.tsx        modo criança: herói, ofensiva e PLAY
    pin.tsx            PIN da área dos adultos
    licao/             a lição diária (casa + tarefas + jogos + fim)
    (adulto)/          área dos adultos, com as 5 abas
    vincular.tsx, aprovacao.tsx   família adiciona e aprova profissional
    prof/              tudo do profissional (painel, paciente, trilha, código)
  components/          peças reutilizáveis (teclado do PIN, relatório, moldura...)
  data/
    catalogo.ts        hábitos e jogos
    relatorio.ts       contas dos relatórios
    nuvem.ts           conversa com o Supabase
    segredos.ts        PIN e senha guardados com segurança
  jogos/               os 3 jogos e as regras de nível
  state/AppState.tsx   estado do app, salvo no celular e sincronizado
  theme/tokens.ts      cores, fontes e medidas do canvas
supabase/migrations/   banco de dados e regras de acesso (LGPD)
docs/
  DECISOES.md          decisões de produto já tomadas
  SUPABASE.md          como ligar o banco na nuvem (15 minutos)
  TESTE_FECHADO.md     roteiro do teste com famílias reais
  TERMO_MODELO.md      modelo de termo de consentimento para o teste
```

## Plano de fases

| Fase | O que entra | Status |
|---|---|---|
| 0 | Projeto, cores e fontes do canvas, telas navegáveis vazias | pronta |
| 1 | Telas do canvas montadas | pronta |
| 2 | Login, cadastro, PIN e hábitos salvos de verdade | pronta (no celular; nuvem pronta para ligar) |
| 3 | Lição: casa, tarefas e os 3 jogos, coletando os dados, nível automático | pronta |
| 4 | Relatórios reais e a parte do profissional | pronta |
| 5 | Teste fechado com famílias reais | material pronto em `docs/` |

O design de referência de todas as telas está no canvas do Daily Hero.

## Modo local e modo nuvem

- **Sem configurar nada (modo local):** tudo funciona e fica salvo **só no celular**. Fechar o app não perde nada. Família e profissional usam o mesmo aparelho, o que é ótimo para demonstrar.
- **Com o Supabase ligado (modo nuvem):** cada pessoa entra no próprio celular, as lições sobem para a nuvem e o profissional vê tudo do consultório. Passo a passo em `docs/SUPABASE.md`.

## Como testar o app inteiro

1. **Primeiro acesso:** Entrar → "Primeiro acesso? Cadastrar família" → preencha → **crie o PIN** (4 números, duas vezes) → escolha os hábitos.
2. **Criança:** PLAY → casa → cada tarefa: assista e coloque os passos na ordem → 3 jogos → "como você se sentiu?". Para sair no meio, segure o X.
3. **Adultos:** cadeado → PIN. 3 erros seguidos travam por 30 s. "Esqueci o PIN" pede a senha da conta.
4. **Relatórios:** aparecem depois da primeira tarefa. Antes disso dá para ver um exemplo.
5. **Profissional (no mesmo celular, modo local):**
   - Perfil › + Profissional › "Tenho um código" → digite `DH-AB12` → Aprovar.
   - Saia da conta → login como **Profissional** → painel → toque no Theo para ver relatórios e escrever observações → Trilha.
   - Observação com "Visível para a família" desligado não aparece para os pais.
6. **Ajustes (Perfil):** animações, narração das tarefas, tempo para sair da lição, trocar PIN, apagar os dados do celular.
