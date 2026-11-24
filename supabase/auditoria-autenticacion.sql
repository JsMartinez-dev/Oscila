-- Solo lectura. Ejecutar con acceso administrativo; conservar resultados en privado.
begin transaction read only;

select count(*) as cuentas,
       count(*) filter (where email_confirmed_at is not null) as correo_confirmado,
       count(*) filter (where email_confirmed_at is null) as correo_sin_confirmar
from auth.users;

select provider, count(*) as identidades, count(distinct user_id) as cuentas
from auth.identities
group by provider
order by provider;

select n.nspname as esquema, c.relname as tabla, co.conname as restriccion,
       pg_get_constraintdef(co.oid) as definicion
from pg_constraint co
join pg_class c on c.oid = co.conrelid
join pg_namespace n on n.oid = c.relnamespace
where co.contype = 'f' and co.confrelid = 'auth.users'::regclass
order by 1, 2, 3;

select table_schema, table_name, column_name, data_type
from information_schema.columns
where table_schema not in ('pg_catalog', 'information_schema', 'auth')
  and column_name in ('user_id', 'owner_id', 'owner', 'created_by', 'account_id')
order by 1, 2, 3;

select n.nspname as esquema, c.relname as tabla,
       c.relrowsecurity as rls, c.relforcerowsecurity as rls_forzada
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r', 'p')
  and n.nspname not in ('pg_catalog', 'information_schema', 'auth')
  and n.nspname not like 'pg_%'
order by 1, 2;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname not in ('pg_catalog', 'information_schema', 'auth')
order by 1, 2, 3;

rollback;
