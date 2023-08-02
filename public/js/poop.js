let executing = false;
async function newPoop() {
    if (executing) return;
    executing = true;

    let data = {poop: document.getElementById("poopcontent").value }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    let response = await fetch('/api/newPoop', options);
    let resdata = await response.text();
    if (resdata.startsWith("success")) {
        document.getElementById("status").textContent = "Pooped successfully. Redirecting...";
        let id = resdata.slice(7);
        let url = "/poops?id=" + id;
        setTimeout(function() {window.location.href = url}, 500);
    }
    else {
        executing = false;
    }
}