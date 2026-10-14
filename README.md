# Daily Hero

App para crianças de 4 a 10 anos, incluindo crianças autistas (leve, moderado e não verbais), que une criação de hábitos, estímulos cognitivos e acompanhamento por pais e profissionais.

Versão atual: **0.2.0 (fase 1, todas as telas navegáveis com dados de exemplo)**.

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
    index.tsx          modo criança: onde o app abre (só o PLAY)
    pin.tsx            PIN da área dos adultos
    licao/             a lição diária (casa + jogos)
    (adulto)/          área dos adultos, com as 5 abas
  components/          peças reutilizáveis (botão PLAY, moldura de tela...)
  theme/tokens.ts      cores, fontes e medidas do canvas
docs/
  DECISOES.md          decisões de produto já tomadas
```

## Plano de fases

| Fase | O que entra | Status |
|---|---|---|
| 0 | Projeto, cores e fontes do canvas, telas navegáveis vazias | pronta |
| 1 | Telas do canvas montadas, ainda sem banco de dados | pronta |
| 2 | Login, cadastro, PIN e hábitos salvos de verdade (Supabase) | |
| 3 | Lição: casa, tarefas com animação e os 3 jogos, coletando os dados | |
| 4 | Relatórios e a parte do profissional | |
| 5 | Teste fechado com famílias reais | |

O design de referência de todas as telas está no canvas do Daily Hero.

## Como navegar na fase 1

Os dados ainda são de exemplo e ficam só na memória: fechar o app zera tudo.

- **Criança:** abertura → Entrar → tela do Theo → **PLAY** → casa com as tarefas → jogos → como você se sentiu.
  Para sair da lição no meio, segure o **X** por 3 segundos.
- **Adultos:** na tela do Theo, toque no cadeado → digite **qualquer PIN de 4 dígitos** → abas Início, Jogos, Relatórios, Falar e Perfil.
- **Profissional:** no login, escolha **Profissional** → Entrar → painel de pacientes → Trilha.
- **Telas de teste:** em Perfil, no fim da página, há atalhos para a tela de erro, o convite do profissional e a abertura.

Esta fase adicionou o pacote `expo-speech` (a voz da aba Falar). Depois de baixar a atualização, rode `npm install` uma vez.
