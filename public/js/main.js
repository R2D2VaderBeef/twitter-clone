async function getUser() {
    let res = await fetch("/api/user");
    let data = await res.json();
    if (data.handle == null) {
        document.getElementById("createaccount").style.display = "block";
        document.getElementById("login").style.display = "block"; 
    }
}
getUser();