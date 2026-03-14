const API_BASE = "https://YOUR-WORKER.workers.dev"

/* get free key */

async function getFreeKey(device){

const res = await fetch(API_BASE + "/api/free",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
device:device
})
})

return await res.json()

}

/* check key */

async function checkKey(device,key,time,sig){

const res = await fetch(API_BASE + "/api/check",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
device:device,
key:key,
time:time,
sig:sig
})
})

return await res.json()

}

/* stats */

async function getStats(){

const res = await fetch(API_BASE + "/api/stats")

return await res.json()

}