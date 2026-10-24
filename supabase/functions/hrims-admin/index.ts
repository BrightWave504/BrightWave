// Supabase Edge Function: deploy with JWT verification enabled (default).
// SUPABASE_SERVICE_ROLE_KEY stays server-side. NEVER add it to the website.
import { createClient } from 'npm:@supabase/supabase-js@2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const roles = ['applicant','employee','hr','it','supervisor'];
Deno.serve(async req => {
 if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
 if (req.method !== 'POST') return reply({error:'Method not allowed'},405);
 try {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = (req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  if (!token) return reply({error:'Authentication required'},401);
  const publicClient = createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError} = await publicClient.auth.getUser(token);
  if (authError||!user) return reply({error:'Invalid session'},401);
  if (user.app_metadata?.hrims_role !== 'it') return reply({error:'IT Administrator permission required'},403);
  const admin = createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const body = await req.json();
  if(body.action === 'list') {
    let page=1; const users=[];
    while(page<=20){const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});if(error)throw error;
      users.push(...data.users.map(u=>({id:u.id,email:u.email,name:u.user_metadata?.full_name||'',role:u.app_metadata?.hrims_role||'',last_sign_in_at:u.last_sign_in_at,banned_until:u.banned_until})));if(data.users.length<100)break;page++;
    }
    return reply({users});
  }
  if(body.action === 'create') {
    const email=String(body.email||'').trim().toLowerCase(),password=String(body.password||''),role=String(body.role||''),name=String(body.name||'').trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||password.length<12||!roles.includes(role)||!name)return reply({error:'Valid email, name, role and password (12+ characters) required'},400);
    const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:name},app_metadata:{hrims_role:role}});
    if(error)throw error;
    // BEFORE INSERT applicant trigger is intentionally overridden for admin-created roles by an admin update.
    const {error:updateError}=await admin.auth.admin.updateUserById(data.user.id,{app_metadata:{hrims_role:role}});
    if(updateError)throw updateError;
    return reply({id:data.user.id});
  }
  if(body.action === 'set_password') {
    const userId=String(body.user_id||''),password=String(body.password||'');
    if(!/^[0-9a-f-]{36}$/i.test(userId)||password.length<12)return reply({error:'Valid user ID and password (12+ characters) required'},400);
    // IT must not reset another IT account via this UI, reducing administrator takeover risk.
    const {data:target,error:getError}=await admin.auth.admin.getUserById(userId);
    if(getError||!target.user)return reply({error:'User not found'},404);
    if(target.user.app_metadata?.hrims_role==='it'&&target.user.id!==user.id)return reply({error:'IT-to-IT password reset is disabled'},403);
    const {error}=await admin.auth.admin.updateUserById(userId,{password});if(error)throw error;
    return reply({ok:true});
  }
  return reply({error:'Unknown action'},400);
 } catch(e){return reply({error:e instanceof Error?e.message:'Server error'},500)}
});
