// Run locally only. Never upload .env or service-role keys to Netlify/GitHub.
import { createClient } from '@supabase/supabase-js';
const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your LOCAL terminal');
const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const accounts=[
 ['applicant1@gmail.com','applicant@1','applicant'],
 ['applicant2@gmail.com','applicant@2','applicant'],
 ['employee1@gmail.com','employee@1','employee'],
 ['employee2@gmail.com','employee@2','employee'],
 ['hrdept1@gmail.com','hrdept@1','hr'],
 ['hrdept2@gmail.com','hrdept@2','hr'],
 ['itdept1@gmail.com','hrdept@1','it'],
 ['itdept2@gmail.com','hrdept@2','it'],
 ['supervisor1@gmail.com','supervisor @1','supervisor'],
 ['supervisor2@gmail.com','supervisor@2','supervisor'],
];
let page=1,existing=[];
while(true){const {data,error}=await admin.auth.admin.listUsers({page,perPage:100});if(error)throw error;existing.push(...data.users);if(data.users.length<100)break;page++}
for(const [email,password,role] of accounts){
 const name=email.split('@')[0];
 const found=existing.find(u=>u.email?.toLowerCase()===email);
 if(found){console.log('SKIP existing:',email,'(password unchanged)');continue}
 const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:name},app_metadata:{hrims_role:role}});
 if(error){console.error('FAILED:',email,error.message);continue}
 const {error:roleError}=await admin.auth.admin.updateUserById(data.user.id,{app_metadata:{hrims_role:role}});
 if(roleError)console.error('ROLE UPDATE FAILED:',email,roleError.message);
 else console.log('CREATED:',email,'role:',role);
}
console.log('Done. Remove temporary environment variables after use. Change these demo passwords before using the site with real people.');
