-- Aureza — Estudos Fundiários — schema, RLS e vista pública.
-- Execute este arquivo inteiro no SQL Editor do painel Supabase (Project > SQL Editor > New query).

-- ============================================================
-- PROFILES (papéis de usuário)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'incorporador' check (role in ('admin', 'incorporador')),
  created_at timestamptz not null default now()
);

-- Cria automaticamente um perfil (role='incorporador' por padrão) quando um novo usuário se registra.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- TERRENOS (dossiê completo, uso interno/admin)
-- ============================================================
create table if not exists terrenos (
  id uuid primary key default gen_random_uuid(),
  nome text,
  municipio text,
  bairro text,
  endereco text,
  lat double precision,
  lng double precision,
  poligono jsonb,
  area_poligono_m2 numeric,
  superficie_m2 numeric,
  preco_pedido numeric,
  matricula text,
  zoneamento text,
  infra_agua boolean not null default false,
  infra_luz boolean not null default false,
  infra_esgoto boolean not null default false,
  infra_asfalto boolean not null default false,
  notas text,
  analise text,
  status text not null default 'bruto' check (status in ('bruto', 'estudo', 'pronto')),
  publicado boolean not null default false,
  exibir_preco boolean not null default false,
  resumo_publico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- Mantém updated_at em dia a cada alteração.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists terrenos_set_updated_at on terrenos;
create trigger terrenos_set_updated_at
  before update on terrenos
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table terrenos enable row level security;

-- Função auxiliar: o usuário autenticado é admin?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Cada usuário só pode ler o próprio perfil.
drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
  for select using (id = auth.uid());

-- Somente admin tem acesso total (CRUD) à tabela terrenos.
-- Nenhuma policy é criada para incorporador: RLS nega por padrão (deny-by-default).
drop policy if exists terrenos_admin_all on terrenos;
create policy terrenos_admin_all on terrenos
  for all using (is_admin()) with check (is_admin());

-- Defesa em profundidade para usuários anônimos (nunca devem tocar a tabela base).
-- Não revogar de "authenticated": o próprio admin é um usuário "authenticated" e
-- precisa do grant de tabela — é a policy is_admin() acima que já restringe as
-- linhas visíveis; incorporador (também "authenticated") continua sem acesso a
-- nenhuma linha porque nenhuma policy o contempla (deny-by-default do RLS).
revoke all on terrenos from anon;
grant select, insert, update, delete on terrenos to authenticated;

-- ============================================================
-- VISTA PÚBLICA (catálogo) — somente colunas sanitizadas, somente publicados
-- ============================================================
create or replace view terrenos_publicos as
  select
    id,
    nome,
    municipio,
    bairro,
    endereco,
    lat,
    lng,
    poligono,
    area_poligono_m2,
    superficie_m2,
    zoneamento,
    infra_agua,
    infra_luz,
    infra_esgoto,
    infra_asfalto,
    resumo_publico,
    status,
    case when exibir_preco then preco_pedido else null end as preco_pedido
  from terrenos
  where publicado = true;
-- matricula, notas e analise nunca são selecionadas aqui (omissão, não mascaramento).

alter view terrenos_publicos set (security_invoker = false);
grant select on terrenos_publicos to authenticated;

-- ============================================================
-- PRIMEIRO ADMINISTRADOR
-- ============================================================
-- 1. Crie sua própria conta pela tela /login do site (ela falhará até você existir como
--    usuário — na verdade, para o primeiro acesso, crie o usuário pelo painel Supabase:
--    Authentication > Users > Add user > preencha e-mail/senha).
-- 2. Depois, rode este comando (troque o e-mail) para virar admin:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'seu-email@exemplo.com');
