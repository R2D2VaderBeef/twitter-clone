list = [];
unique = false;
submitted = false;

async function getList() {
    let res = await fetch("/api/getAllUsers");
    let data = await res.json();
    list = data;
}
getList();

window.onload = function (event) {
    document.getElementById("signupform").addEventListener("submit", submitForm);
    document.getElementById("newhandle").addEventListener("change", checkUnique)
};

function checkUnique() {
    let handle = document.getElementById("newhandle").value.toLowerCase();
    if (list.includes(handle)) {
        document.getElementById("available").textContent = "❌ That handle is already taken.";
        unique = false;
    }
    else if (handle == "") {
        document.getElementById("available").textContent = "❌ Enter a handle.";
        unique = false;
    }
    else {
        document.getElementById("available").textContent = "✅ That handle is available."
        unique = true;
    }
}

async function submitForm(event) {
    event.preventDefault();
    if (submitted == true) return;
    submitted = true;

    let data = {handle: document.getElementById("newhandle").value.toLowerCase(), password: document.getElementById("password").value}

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    let response = await fetch('/api/signup', options);
    let resdata = await response.text();
    if (resdata.startsWith("success")) {
        document.getElementById("welcome").textContent = "Welcome to Buttwipe. Your username is " + resdata.slice(7) + ". Log in by clicking the button on the left.";
    }
}

