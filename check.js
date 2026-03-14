async function sha256(text){

const encoder = new TextEncoder();
const data = encoder.encode(text);

const hash = await crypto.subtle.digest("SHA-256", data);

return Array.from(new Uint8Array(hash))
.map(b => b.toString(16).padStart(2,'0'))
.join('');

}

async function checkKey(){

const params = new URLSearchParams(location.search);
const key = params.get("key");

let result = {status:"invalid"};

const SECRET = "H-TOOL-PRIVATE";

/* tạo key free hôm nay */

let d = new Date();

let date =
d.getFullYear() +
String(d.getMonth()+1).padStart(2,'0') +
String(d.getDate()).padStart(2,'0');

let hash = await sha256(SECRET + date);

let freeKey = "FREE-" + hash.slice(0,8).toUpperCase();

if(key == freeKey){

result = {
status:"valid",
type:"free"
};

}

/* check VIP */

let vip = await fetch("check.json").then(r=>r.json());

if(vip[key]){

let now = new Date();
let exp = new Date(vip[key]);

if(now <= exp){

result = {
status:"valid",
type:"vip",
expire:vip[key]
};

}

}

document.body.innerText = JSON.stringify(result);

}

checkKey();