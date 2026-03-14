export default {
async fetch(request, env) {

const url = new URL(request.url)
const path = url.pathname

if(path=="/api/check") return checkKey(request,env)
if(path=="/api/free") return freeKey(request,env)
if(path=="/api/create") return createKey(request,env)
if(path=="/api/revoke") return revokeKey(request,env)
if(path=="/api/stats") return stats(request,env)

return new Response("KEY SERVER ONLINE")

}
}

/* JSON */

function json(data){
return new Response(
JSON.stringify(data),
{headers:{"content-type":"application/json"}}
)
}

/* random key */

function random(n){

const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

let s=""

for(let i=0;i<n;i++){
s+=chars[Math.floor(Math.random()*chars.length)]
}

return s

}

/* HMAC SHA256 */

async function hmac(secret,msg){

const encoder = new TextEncoder()

const key = await crypto.subtle.importKey(
"raw",
encoder.encode(secret),
{name:"HMAC",hash:"SHA-256"},
false,
["sign"]
)

const sig = await crypto.subtle.sign(
"HMAC",
key,
encoder.encode(msg)
)

return Array.from(new Uint8Array(sig))
.map(b=>b.toString(16).padStart(2,'0'))
.join("")

}

/* rate limit */

async function rateLimit(ip,env){

let k="rate:"+ip

let count=await env.RATE_DB.get(k)

count = count ? parseInt(count)+1 : 1

await env.RATE_DB.put(k,count,{expirationTtl:60})

if(count>40){
throw new Error("limit")
}

}

/* check key */

async function checkKey(req,env){

const ip=req.headers.get("CF-Connecting-IP")

try{
await rateLimit(ip,env)
}catch{
return json({status:"rate_limit"})
}

const body=await req.json()

const key=body.key
const device=body.device
const time=body.time
const sig=body.sig

let msg=device+key+time

let expected=await hmac(env.SECRET,msg)

if(sig!=expected){

return json({
status:"bad_signature"
})

}

let data=await env.KEY_DB.get(key,{type:"json"})

if(!data){

return json({
status:"invalid"
})

}

if(Date.now()>data.expire){

return json({
status:"expired"
})

}

/* bind device */

if(data.device && data.device!=device){

return json({
status:"device_locked"
})

}

if(!data.device){

data.device=device

await env.KEY_DB.put(key,JSON.stringify(data))

}

/* log user */

await env.LOG_DB.put(
"log:"+Date.now(),
JSON.stringify({
key:key,
device:device,
ip:ip
})
)

/* update stats */

let users=await env.STATS_DB.get("users")
users = users ? parseInt(users)+1 : 1

await env.STATS_DB.put("users",users)

return json({
status:"valid",
type:data.type,
expire:data.expire
})

}

/* create vip key */

async function createKey(req,env){

const body=await req.json()

const days=body.days

let key="VIP-"+random(10)

let expire=Date.now()+days*86400000

await env.KEY_DB.put(key,JSON.stringify({
type:"vip",
expire:expire
}))

return json({
key:key,
expire:expire
})

}

/* revoke key */

async function revokeKey(req,env){

const body=await req.json()

await env.KEY_DB.delete(body.key)

return json({
status:"revoked"
})

}

/* free key */

async function freeKey(req,env){

const body=await req.json()

const device=body.device

let key="FREE-"+random(8)

let expire=Date.now()+86400000

await env.KEY_DB.put(key,JSON.stringify({
type:"free",
device:device,
expire:expire
}))

return json({
key:key,
expire:expire
})

}

/* stats */

async function stats(req,env){

let users=await env.STATS_DB.get("users")

users = users ? parseInt(users) : 0

let logs = await env.LOG_DB.list({limit:20})

return json({
total_users:users,
recent_logs:logs.keys.length
})

}