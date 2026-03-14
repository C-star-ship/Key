async function loadStats(){

const data = await getStats()

const ctx = document.getElementById("chart").getContext("2d")

new Chart(ctx,{
type:"line",
data:{
labels:["Users"],
datasets:[{
label:"Total Users",
data:[data.total_users],
borderColor:"#00ff9f",
fill:false
}]
}
})

}