submitted = false;

window.onload = function (event) {
    document.getElementById("loginform").addEventListener("submit", submitForm);
};


async function submitForm(event) {
    event.preventDefault();
    if (submitted == true) return;
    submitted = true;

    let data = {handle: document.getElementById("handle").value.toLowerCase(), password: document.getElementById("password").value}

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response = await fetch('/api/login', options);
    let resdata = await response.text();
    if (resdata.startsWith("success")) {
        document.getElementById("welcome").textContent = "Welcome back, " + resdata.slice(7) + ". Redirecting...";
        setTimeout(function() {window.location.href = "/sewer"}, 600);
    }
    else if (resdata == "error nouser"){
        document.getElementById("error").textContent = "That account does not exist.";
        submitted = false;
    }
}

