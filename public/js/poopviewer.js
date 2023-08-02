async function getPoop() {
    let res = await fetch("/api/getPoop" + window.location.search);
    let resdata = await res.json();
    console.log(resdata);
    
    let data = resdata[0];
    let myhandle = resdata[1].handle;

    if (data.error) {
        if (resdata.error == "nopoop") {
            document.getElementById("error").textContent = "Couldn't find that poop. Try looking for new ones in The Sewer.";
        }
    }
    else {
        document.title = "💩 Poop by @" + data.handle + " | Buttwipe";
        
        let date = new Date(parseInt(data.timestamp));

        let liked = false;
        if (data.likes && myhandle) {
            if (data.likes.includes(myhandle)) {
                liked = true;
            }
        }

        let html;
        if (data.reply) {
            return;
        }
        else if (data.repost) {
            return;
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

        document.getElementsByClassName("feed")[0].appendChild(div);
    }
}
getPoop();

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
        button.style.backgroundColor = "#060599"
    }
    else {
        executing = false;
    }
}