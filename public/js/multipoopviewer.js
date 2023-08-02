async function paginate() {
    let array = window.location.search.slice(1).split("=")
    let page = "1";
    if (array[0] == "page") {
        page = array[1];
    }

    let res0 = await fetch("/api/getSewerPosts?number=4&page=" + page);
    let resdata0 = await res0.json();

    let myhandle = resdata0[resdata0.length - 1].handle;

    for (let i = 0; i < resdata0.length - 1; i++) {
        await renderPoop(resdata0[i], myhandle);
    }
}
paginate();

async function renderPoop(data, myhandle) {
    let date = new Date(parseInt(data.timestamp));

    let liked = false;
    if (data.likes && myhandle) {
        if (data.likes.includes(myhandle)) {
            liked = true;
        }
    }

    let html;
    if (data.reply) {
        let res2 = await fetch("/api/getPoopAuthor?id=" + data.related_id);
        let data2 = await res2.text();

        html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> farted back at <a href="/tissue?handle=${data2}"><span class="poophandle">@${data2}</span></a> at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
                <p><a href="/poops?id=${data.related_id}">View original poop</a></p>
                <div class="poopActions">
                    <button onclick="like(${data.id.toString()})" id="likebtn${data.id.toString()}" ${liked ? 'disabled style="background-color: #060599"' : ""}><span class="poopIcon">👃</span>Sniff<span class="sniffCounter" id="likes${data.id.toString()}">${data.likes ? data.likes.length : 0}</span></button>
                    <button onclick="reply(${data.id.toString()})"><span class="poopIcon">💨</span>Fart Back</button>
                    <button onclick="repost(${data.id.toString()})"><span class="poopIcon">🧻</span>Smear</button>
                </div>
            `
    }
    else if (data.repost) {
        let res2 = await fetch("/api/getPoop?id=" + data.related_id);
        let resdata2 = await res2.json();
        let data2 = resdata2[0];

        let date2 = new Date(parseInt(data2.timestamp));

        let liked2 = false;
        if (data2.likes && myhandle) {
            if (data2.likes.includes(myhandle)) {
                liked2 = true;
            }
        }

        let action = "pooped"
        let originalPostOrNot = "";
        if (data2.reply) {
            let res3 = await fetch("/api/getPoopAuthor?id=" + data2.related_id);
            let data3 = await res3.text();
            action = `farted back at <a href="/tissue?handle=${data3}"><span class="poophandle">@${data3}</span></a>`;
            originalPostOrNot = `<p><a href="/poops?id=${data2.related_id}">View original poop</a></p>`;
        }
        else if (data2.repost) {
            let res3 = await fetch("/api/getPoopAuthor?id=" + data2.related_id);
            let data3 = await res3.text();
            action = `smeared <a href="/tissue?handle=${data3}"><span class="poophandle">@${data3}</span></a>`;
            originalPostOrNot = `<p><a href="/poops?id=${data2.related_id}">View smeared poop</a></p>`;
        }

        html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> smeared at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
                <div class="poopActions">
                    <button onclick="like(${data.id.toString()})" id="likebtn${data.id.toString()}" ${liked ? 'disabled style="background-color: #060599"' : ""}><span class="poopIcon">👃</span>Sniff<span class="sniffCounter" id="likes${data.id.toString()}">${data.likes ? data.likes.length : 0}</span></button>
                    <button onclick="reply(${data.id.toString()})"><span class="poopIcon">💨</span>Fart Back</button>
                    <button onclick="repost(${data.id.toString()})"><span class="poopIcon">🧻</span>Smear</button>
                </div>
                <div class="originalPoop">
                    <p><a href="/tissue?handle=${data2.handle}"><span class="poophandle">@${data2.handle}</span></a> ${action} at ${date2.toLocaleTimeString()} on ${date2.toLocaleDateString()}</p>
                    <p class="poopcontent">${data2.content}</p>
                    ${originalPostOrNot}
                    <div class="poopActions">
                        <button onclick="like(${data2.id.toString()})" id="likebtn${data2.id.toString()}" ${liked2 ? 'disabled style="background-color: #060599"' : ""}><span class="poopIcon">👃</span>Sniff<span class="sniffCounter" id="likes${data2.id.toString()}">${data2.likes ? data2.likes.length : 0}</span></button>
                        <button onclick="reply(${data2.id.toString()})"><span class="poopIcon">💨</span>Fart Back</button>
                        <button onclick="repost(${data2.id.toString()})"><span class="poopIcon">🧻</span>Smear</button>
                    </div>
                </div>
            `
    }
    else {
        html = `
                <p><a href="/tissue?handle=${data.handle}"><span class="poophandle">@${data.handle}</span></a> pooped at ${date.toLocaleTimeString()} on ${date.toLocaleDateString()}</p>
                <p class="poopcontent">${data.content}</p>
                <div class="poopActions">
                    <button onclick="like(${data.id.toString()})" id="likebtn${data.id.toString()}" ${liked ? 'disabled style="background-color: #060599"' : ""}><span class="poopIcon">👃</span>Sniff<span class="sniffCounter" id="likes${data.id.toString()}">${data.likes ? data.likes.length : 0}</span></button>
                    <button onclick="reply(${data.id.toString()})"><span class="poopIcon">💨</span>Fart Back</button>
                    <button onclick="repost(${data.id.toString()})"><span class="poopIcon">🧻</span>Smear</button>
                </div>
            `
    }

    let div = document.createElement("div");
    div.className = "poop";
    div.id = "poop" + data.id.toString();
    div.innerHTML = html;

    document.getElementById("feed-inset").appendChild(div);
}

let executing = false;
async function like(id) {
    if (executing) return;
    executing = true;

    let data = { "id": id }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    let response = await fetch('/api/likePoop', options);
    let resdata = await response.text();
    if (resdata.startsWith("success")) {
        let numLikes = resdata.slice(8);
        document.getElementById("likes" + id).textContent = numLikes;
        let button = document.getElementById("likebtn" + id);
        button.disabled = true;
        button.style.backgroundColor = "#060599";
        executing = false;
    }
    else {
        executing = false;
    }
}

async function reply(id) {
    window.location.href="/poop?fartback=" + id;
}

async function repost(id) {
    window.location.href="/poop?smear=" + id;
}

function nextPage() {
    let array = window.location.search.slice(1).split("=")
    let page = "1";
    if (array[0] == "page") {
        page = array[1];
    }
    pageInt = parseInt(page);
    newPage = pageInt + 1;
    window.location.href = "/sewer?page=" + newPage.toString();
}

function previousPage() {
    let array = window.location.search.slice(1).split("=")
    let page = "1";
    if (array[0] == "page") {
        page = array[1];
    }
    pageInt = parseInt(page);
    newPage = pageInt - 1;
    if (newPage < 1) return;
    window.location.href = "/sewer?page=" + newPage.toString();
}