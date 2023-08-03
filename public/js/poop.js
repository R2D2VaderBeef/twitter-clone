let array = window.location.search.slice(1).split("=");
let action = "poop";
let related_id = null;

if (array[0] != "") {
    if (array[0] == "fartback") {
        action = "fartback";
    }
    else if (array[0] == "smear") {
        action = "smear";
    }
    related_id = array[1];
    renderPoop(related_id);
}

window.onload = function (event) {
    if (action != "poop") {
        let span = document.getElementById("purpose")
        if (action == "fartback") span.textContent = "Fart back";
        else if (action == "smear") span.textContent = "Smear";
    }
};

let executing = false;
async function newPoop() {
    if (executing) return;
    executing = true;

    let data = {poop: document.getElementById("poopcontent").value, action: action}

    if (action != "poop") {
        data.related_id = related_id;
    }

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
        let id = resdata.slice(8);
        let url = "/poops?id=" + id;
        setTimeout(function() {window.location.href = url}, 500);
    }
    else {
        executing = false;
    }
}

async function renderPoop(id) {
    let res = await fetch("/api/getPoop?id=" + id);
    let resdata = await res.json();
    console.log(resdata);

    let data = resdata[0];

    if (data.error) {
        if (data.error == "nopoop") {
            document.getElementById("display").innerHTML = "<p> Couldn't find that poop. Try interacting with new ones in The Sewer. </p>";
            executing = true;
        }
    }
    else {      
        let date = new Date(parseInt(data.timestamp));

        let html;
        if (data.reply) {
            let res2 = await fetch("/api/getPoopAuthor?id=" + data.related_id);
            let data2 = await res2.text();

            html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> farted back at <a href="/tissue?handle=${data2}"><span class="poophandle">@${data2}</span></a> at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
            `
        }
        else if (data.repost) {
            let res2 = await fetch("/api/getPoop?id=" + data.related_id);
            let resdata2 = await res2.json();
            let data2 = resdata2[0];

            let date2 = new Date(parseInt(data2.timestamp));

            let action = "pooped"
            let originalPostOrNot = "";
            if (data2.reply) {
                let res3 = await fetch("/api/getPoopAuthor?id=" + data2.related_id);
                let data3 = await res3.text();
                action = `farted back at <a href="/tissue?handle=${data3}"><span class="poophandle">@${data3}</span></a>`
                originalPostOrNot = `<p><a href="/poops?id=${data2.related_id}">View original poop</a></p>`
            }

            html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> smeared at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
                <div class="originalPoop">
                    <p><a href="/tissue?handle=${data2.handle}"><span class="poophandle">@${data2.handle}</span></a> ${action} at ${date2.toLocaleTimeString()} on ${date2.toLocaleDateString()}</p>
                    <p class="poopcontent">${data2.content}</p>
                    ${originalPostOrNot}
                </div>
            `
        }
        else {
            html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> pooped at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
            `
        }

        let div = document.createElement("div");
        div.className = "poop";
        div.id = "poop" + data.id.toString();
        div.innerHTML = html;

        document.getElementById("display").appendChild(div);
    }
}