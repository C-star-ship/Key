// VIP key module

import { randomKey } from "../utils/random.js"

/* tạo key VIP */

export async function createVipKey(days, env){

if(!days || days <= 0){

return {
status:"error",
message:"invalid_days"
}

}

const key = "VIP-" + randomKey(12)

const expire = Date.now() + (days * 86400000)

const data = {
type:"vip",
device:null,
expire:expire,
created:Date.now()
}

await env.KEY_DB.put(
key,
JSON.stringify(data),
{
expirationTtl: days * 86400
}
)

return {
status:"ok",
key:key,
expire:expire,
type:"vip"
}

}

/* check key VIP */

export async function checkVipKey(key, device, env){

const data = await env.KEY_DB.get(key,{type:"json"})

if(!data){

return {
status:"invalid"
}

}

/* kiểm tra expire */

if(Date.now() > data.expire){

return {
status:"expired"
}

}

/* bind device */

if(data.device && data.device !== device){

return {
status:"device_locked"
}

}

/* bind lần đầu */

if(!data.device){

data.device = device

await env.KEY_DB.put(
key,
JSON.stringify(data)
)

}

return {
status:"valid",
type:"vip",
expire:data.expire
}

}

/* revoke key */

export async function revokeVipKey(key, env){

await env.KEY_DB.delete(key)

return {
status:"revoked",
key:key
}

}