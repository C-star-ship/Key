// Stats module

/* tăng request */

export async function addRequest(env){

let count = await env.STATS_DB.get("requests")

count = count ? parseInt(count) : 0

count++

await env.STATS_DB.put("requests", count.toString())

}

/* tăng user online */

export async function addUser(device, env){

if(!device) return

const key = "online:" + device

/* lưu user online 60s */

await env.STATS_DB.put(
key,
Date.now().toString(),
{
expirationTtl:60
}
)

}

/* log user */

export async function logUser(device, key, ip, env){

const logKey = "log:" + Date.now()

const data = {
device:device,
key:key,
ip:ip,
time:Date.now()
}

await env.LOG_DB.put(
logKey,
JSON.stringify(data)
)

}

/* lấy thống kê */

export async function getStats(env){

/* total request */

let requests = await env.STATS_DB.get("requests")
requests = requests ? parseInt(requests) : 0

/* user online */

const online = await env.STATS_DB.list({
prefix:"online:"
})

/* log gần nhất */

const logs = await env.LOG_DB.list({
limit:20
})

let recent = []

for(const item of logs.keys){

let data = await env.LOG_DB.get(item.name,{type:"json"})

if(data) recent.push(data)

}

return {
requests:requests,
online_users:online.keys.length,
recent_logs:recent
}

}