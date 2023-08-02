async function getUser() {
    let res = await fetch("/api/user");
    let data = await res.json();
    if (data.handle == null) {
        document.getElementById("createaccount").style.display = "block";
        document.getElementById("login").style.display = "block"; 
    }
    else {
        document.getElementById("tissue").style.display = "block";
        document.getElementById("poop").style.display = "block";

        let elements = document.getElementsByClassName("handle");
        for (let i = 0; i < elements.length; i++) {
            elements[i].textContent = "@" + data.handle;
        }
        document.getElementById("account").style.display = "block";
    }
}
getUser();