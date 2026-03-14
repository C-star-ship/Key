function login(){

const pass = document.getElementById("password").value

if(pass === "admin123"){

localStorage.setItem("admin","true")

location.href="admin.html"

}else{

alert("Sai mật khẩu")

}

}

function isAdmin(){

return localStorage.getItem("admin") === "true"

}