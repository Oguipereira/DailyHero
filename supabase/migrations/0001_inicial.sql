-- Daily Hero · esquema inicial (fase 2)
-- Como usar: Supabase › SQL Editor › colar este arquivo inteiro › Run.
--
-- Regras de acesso (LGPD, dado de saúde de criança):
--   * O responsável vê e altera tudo da própria criança.
--   * O profissional só vê a criança depois que o responsável aprova o vínculo.
--   * O profissional altera só a trilha de jogos e escreve observações.
--   * Observação marcada "só para o profissional" só aparece para quem escreveu.
--   * O responsável pode remover o profissional a qualquer momento.

-- ---------------------------------------------------------------- perfis
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  papel text not null check (papel in ('responsavel', 'profissional')),
  nome text not null default '',
  -- só profissional
  area text,
  conselho text,
  registro text,
  uf text,
  criado_em timestamptz not null default now()
);

-- Cria o perfil sozinho quando a conta é criada (os dados vêm do signUp).
create function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, papel, nome, area, conselho, registro, uf)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'papel', 'responsavel'),
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.raw_user_meta_data ->> 'area',
    new.raw_user_meta_data ->> 'conselho',
    new.raw_user_meta_data ->> 'registro',
    new.raw_user_meta_data ->> 'uf'
  );
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------- crianças
create table public.criancas (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references public.perfis (id) on delete cascade,
  nome text not null,
  nascimento date,
  grau text,
  habitos text[] not null default '{}',
  trilha text[] not null default '{emocoes,memoria,figuras}',
  jogos_por_dia int not null default 3 check (jogos_por_dia between 1 and 5),
  niveis jsonb not null default '{}',
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------- vínculos
create table public.vinculos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid references public.criancas (id) on delete cascade,
  profissional_id uuid references public.perfis (id) on delete cascade,
  -- convite = a família convidou por e-mail · codigo = o profissional gerou um código
  origem text not null check (origem in ('convite', 'codigo')),
  email_convidado text,
  codigo text unique,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'removido')),
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null default now() + interval '48 hours'
);

-- ---------------------------------------------------------------- lição
create table public.registros (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas (id) on delete cascade,
  dia date not null,
  atividade text not null,          -- 'tarefa:dentes', 'jogo:emocoes'
  modulo text not null,             -- hab, cog, socio, motor, ling
  nivel int not null default 1,
  acertos int not null,             -- rodadas acertadas de primeira
  rodadas int not null,
  acertou_de_primeira boolean not null,
  tentativas int not null,
  ajudas int not null,
  segundos int not null,
  criado_em timestamptz not null default now()
);
create index on public.registros (crianca_id, dia);

create table public.licoes (
  crianca_id uuid not null references public.criancas (id) on delete cascade,
  dia date not null,
  sentimento text check (sentimento in ('bem', 'mais', 'chateado')),
  concluida_em timestamptz not null default now(),
  primary key (crianca_id, dia)
);

create table public.observacoes (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade default auth.uid(),
  autor_papel text not null check (autor_papel in ('responsavel', 'profissional')),
  texto text not null check (length(texto) between 1 and 2000),
  visivel_familia boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------- quem pode o quê
create function public.eh_responsavel(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from criancas where id = c and responsavel_id = auth.uid())
$$;

create function public.eh_profissional(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from vinculos
    where crianca_id = c and profissional_id = auth.uid() and status = 'aprovado'
  )
$$;

alter table public.perfis enable row level security;
alter table public.criancas enable row level security;
alter table public.vinculos enable row level security;
alter table public.registros enable row level security;
alter table public.licoes enable row level security;
alter table public.observacoes enable row level security;

-- perfis: cada um vê e edita o seu; a família vê o nome do profissional vinculado e vice-versa
create policy "perfil proprio" on public.perfis for all using (id = auth.uid()) with check (id = auth.uid());
create policy "perfil de quem esta vinculado" on public.perfis for select using (
  exists (
    select 1 from vinculos v join criancas c on c.id = v.crianca_id
    where v.status = 'aprovado'
      and ((c.responsavel_id = auth.uid() and v.profissional_id = perfis.id)
        or (v.profissional_id = auth.uid() and c.responsavel_id = perfis.id))
  )
);

-- crianças
create policy "responsavel gerencia" on public.criancas for all
  using (responsavel_id = auth.uid()) with check (responsavel_id = auth.uid());
create policy "profissional ve" on public.criancas for select using (public.eh_profissional(id));

-- vínculos
create policy "responsavel ve os vinculos" on public.vinculos for select using (public.eh_responsavel(crianca_id));
create policy "responsavel convida" on public.vinculos for insert
  with check (public.eh_responsavel(crianca_id) and origem = 'convite');
create policy "responsavel decide" on public.vinculos for update using (public.eh_responsavel(crianca_id));
create policy "profissional ve os seus" on public.vinculos for select using (profissional_id = auth.uid());

-- registros e lições: o celular da família grava; os dois leem
create policy "familia grava registros" on public.registros for insert with check (public.eh_responsavel(crianca_id));
create policy "le registros" on public.registros for select
  using (public.eh_responsavel(crianca_id) or public.eh_profissional(crianca_id));
create policy "familia grava licoes" on public.licoes for all
  using (public.eh_responsavel(crianca_id)) with check (public.eh_responsavel(crianca_id));
create policy "profissional le licoes" on public.licoes for select using (public.eh_profissional(crianca_id));

-- observações
create policy "escreve observacao" on public.observacoes for insert with check (
  autor_id = auth.uid() and (
    (autor_papel = 'responsavel' and public.eh_responsavel(crianca_id) and visivel_familia)
    or (autor_papel = 'profissional' and public.eh_profissional(crianca_id))
  )
);
create policy "familia le as visiveis" on public.observacoes for select
  using (public.eh_responsavel(crianca_id) and (visivel_familia or autor_id = auth.uid()));
-- nota "só para o profissional" é só de quem escreveu (se houver dois profissionais, um não lê a do outro)
create policy "profissional le as suas e as visiveis" on public.observacoes for select
  using (public.eh_profissional(crianca_id) and (visivel_familia or autor_id = auth.uid()));
create policy "autor apaga a sua" on public.observacoes for delete using (autor_id = auth.uid());

-- ---------------------------------------------------------------- ações com regra própria

-- O profissional só mexe na trilha (nunca nos hábitos nem nos dados da criança).
create function public.definir_trilha(c uuid, nova_trilha text[], por_dia int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_profissional(c) then raise exception 'sem acesso a esta criança'; end if;
  update criancas set trilha = nova_trilha, jogos_por_dia = por_dia where id = c;
end $$;

-- Caminho 2: o profissional gera um código (vale 48 h).
create function public.gerar_codigo() returns text
language plpgsql security definer set search_path = public as $$
declare novo text;
begin
  if (select papel from perfis where id = auth.uid()) <> 'profissional' then
    raise exception 'só profissional gera código';
  end if;
  novo := 'DH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  insert into vinculos (profissional_id, origem, codigo) values (auth.uid(), 'codigo', novo);
  return novo;
end $$;

-- A família digita o código: o pedido fica pendente até ela aprovar.
create function public.usar_codigo(c uuid, cod text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_responsavel(c) then raise exception 'sem acesso a esta criança'; end if;
  update vinculos set crianca_id = c
  where codigo = upper(cod) and status = 'pendente' and crianca_id is null and expira_em > now();
  if not found then raise exception 'código inválido ou vencido'; end if;
end $$;

-- Caminho 1: a família convidou pelo e-mail. Quando o profissional entra com esse e-mail,
-- os convites dele viram acesso aprovado (o convite partiu da própria família).
create function public.aceitar_meus_convites() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if (select papel from perfis where id = auth.uid()) <> 'profissional' then return 0; end if;
  update vinculos set profissional_id = auth.uid(), status = 'aprovado'
  where origem = 'convite' and status = 'pendente' and profissional_id is null
    and lower(email_convidado) = lower((select email from auth.users where id = auth.uid()))
    and expira_em > now();
  get diagnostics n = row_count;
  return n;
end $$;

-- Pedidos de código que a família já digitou e ainda não aprovou (para o painel do profissional).
create function public.meus_pedidos() returns table (codigo text, crianca_nome text)
language sql stable security definer set search_path = public as $$
  select v.codigo, c.nome from vinculos v join criancas c on c.id = v.crianca_id
  where v.profissional_id = auth.uid() and v.status = 'pendente'
$$;
