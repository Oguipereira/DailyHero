# Ligar o banco na nuvem (Supabase)

Sem isso o app já funciona em **modo local**. Ligue o Supabase quando família e profissional precisarem usar **celulares diferentes**. Leva uns 15 minutos e é grátis para começar.

## 1. Criar o projeto

1. Entre em https://supabase.com e crie uma conta (pode ser com o GitHub).
2. **New project**:
   - **Nome:** `dailyhero`
   - **Senha do banco:** gere e guarde num lugar seguro.
   - **Região:** South America (São Paulo), para os dados ficarem no Brasil.
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Criar as tabelas e as regras de acesso

1. No menu da esquerda, abra **SQL Editor** › **New query**.
2. Abra o arquivo `supabase/migrations/0001_inicial.sql` deste projeto, copie **tudo** e cole lá.
3. Clique em **Run**. Deve aparecer "Success".

O arquivo cria as tabelas e já liga as regras da LGPD. Por exemplo: o profissional só enxerga a criança depois que a família aprova.

## 3. Ajustar o login por e-mail

Em **Authentication › Sign In / Providers › Email**:

- **Durante o teste fechado:** deixe "Confirm email" **desligado**, assim as famílias entram direto.
- **Antes de abrir para o público:** ligue de novo.

## 4. Colocar as chaves no app

1. Abra **Project Settings › API** (ou **Data API**).
2. Na pasta do projeto, copie o arquivo `.env.example` com o nome `.env`.
3. Preencha:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

A chave "anon public" pode ficar no app, porque quem protege os dados são as regras do passo 2. **Nunca** coloque a chave `service_role` no app.

4. Pare o Expo (Ctrl+C) e rode `iniciar.bat` de novo.

Na tela de login, a frase "Modo local: os dados ficam só neste celular" deve sumir. Se ainda aparecer, o app não leu o `.env`.

## Como conferir que está funcionando

1. No celular A, cadastre uma família com o e-mail do profissional no passo 3. Faça uma tarefa da lição.
2. No celular B, crie a conta do profissional **com aquele e-mail**.
3. No painel do profissional, a criança aparece. Toque nela: a tarefa feita está no relatório.
4. No Supabase, em **Table Editor › registros**, a linha da tarefa aparece.
