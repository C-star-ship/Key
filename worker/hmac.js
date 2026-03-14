// HMAC SHA256 module

const encoder = new TextEncoder()

/* tạo HMAC */

export async function createHmac(secret, message){

const key = await crypto.subtle.importKey(
"raw",
encoder.encode(secret),
{
name:"HMAC",
hash:"SHA-256"
},
false,
["sign"]
)

const signature = await crypto.subtle.sign(
"HMAC",
key,
encoder.encode(message)
)

return bufferToHex(signature)

}

/* verify HMAC */

export async function verifyHmac(secret, message, signature){

const expected = await createHmac(secret, message)

return timingSafeEqual(expected, signature)

}

/* buffer → hex */

function bufferToHex(buffer){

return Array.from(new Uint8Array(buffer))
.map(b => b.toString(16).padStart(2,"0"))
.join("")

}

/* chống timing attack */

function timingSafeEqual(a,b){

if(a.length !== b.length){
return false
}

let result = 0

for(let i=0;i<a.length;i++){

result |= a.charCodeAt(i) ^ b.charCodeAt(i)

}

return result === 0

}