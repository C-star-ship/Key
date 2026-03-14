function getDeviceID(){

let id = localStorage.getItem("device_id")

if(!id){

id = "dev-" + Math.random().toString(36).substring(2,12)

localStorage.setItem("device_id",id)

}

return id

}