// Rate limit module

const WINDOW = 60      // thời gian window (giây)
const MAX_REQUEST = 40 // tối đa request mỗi window

/* kiểm tra rate limit */

export async function checkRateLimit(ip, env){

const key = "rate:" + ip

let count = await env.RATE_DB.get(key)

count = count ? parseInt(count) : 0

if(count >= MAX_REQUEST){

return {
allowed:false,
limit:MAX_REQUEST
}

}

count++

await env.RATE_DB.put(
key,
count.toString(),
{
expirationTtl:WINDOW
}
)

return {
allowed:true,
remaining:MAX_REQUEST-count
}

}