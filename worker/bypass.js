// Bypass / token verification module

import { randomKey } from "../utils/random.js"

const TOKEN_EXPIRE = 300 // 5 phút

/* tạo token redirect */

export async function createBypassToken(device, env){

if(!device){
return {
status:"error",
message:"missing_device"
}
}

const token = "T-" + randomKey(20)

const data = {
device:device,
time:Date.now()
}

/* lưu token */

await env.TOKEN_DB.put(
token,
JSON.stringify(data),
{
expirationTtl:TOKEN_EXPIRE
}
)

return {
status:"ok",
token:token,
redirect:`https://your-site.pages.dev/redirect.html?token=${token}`
}

}

/* verify token sau khi user quay lại */

export async function verifyBypassToken(token, device, env){

const data = await env.TOKEN_DB.get(token,{type:"json"})

if(!data){

return {
status:"invalid_token"
}

}

/* kiểm tra device */

if(data.device !== device){

return {
status:"device_mismatch"
}

}

/* token dùng 1 lần */

await env.TOKEN_DB.delete(token)

return {
status:"ok"
}

}