-- SubjectReport test data cleanup
-- Run in Supabase SQL Editor after signing in as project owner/admin.

begin;

delete from public.athletes
where id like 'ath_cloudok_%'
   or id like 'ath_final_%'
   or id like 'ath_ui_%'
   or email like 'cloudok%@example.com'
   or email like 'final%@example.com'
   or email like 'ui%@example.com';

commit;

-- Optional: see remaining newest records
select id, first_name, last_name, email, status, created_at
from public.athletes
order by created_at desc
limit 25;
