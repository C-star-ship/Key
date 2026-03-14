// Free key module

import { randomKey } from "../utils/random.js"

const FREE_EXPIRE = 86400000 // 24h

/* tạo hoặc lấy key free */

export async function getFreeKey(device, env){

if(!device){
return {
status:"error",
message:"missing_device"
}
}

/* kiểm tra device đã có key chưa */

const deviceKey = "device:"+device

let existing = await env.KEY_DB.get(deviceKey,{type:"json"})

if(existing){

if(Date.now() < existing.expire){

return {
status:"ok",
key:existing.key,
expire:existing.expire,
type:"free"
}

}

}

/* tạo key mới */

const key = "FREE-" + randomKey(10)

const expire = Date.now() + FREE_EXPIRE

const data = {
type:"free",
device:device,
expire:expire
}

/* lưu key */

await env.KEY_DB.put(
key,
JSON.stringify(data),
{
expirationTtl:86400
}
)

/* map device → key */

await env.KEY_DB.put(
deviceKey,
JSON.stringify({
key:key,
expire:expire
}),
{
expirationTtl:86400
}
)

return {
status:"ok",
key:key,
expire:expire,
type:"free"
}

}