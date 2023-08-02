async function getProfile() {
    let res = await fetch("/api/getProfile" + window.location.search);
    let data = await res.json();
    if (data.error) {
        if (data.error == "nouser") {
            document.getElementById("error").textContent = "Couldn't find that user. Try looking for people in The Sewer.";
            document.getElementById("profile").style.display = "none";
        }
    }
    else {
        document.getElementById("tissue-handle").textContent = data.handle;
        document.title = "💩 " + data.handle + " | Buttwipe"

        if (data.bio) {
            document.getElementById("biobody").textContent = data.bio;
        }
        else {
            document.getElementById("biobody").textContent = "There's nothing here yet, but we're sure they're amazing!"
        }
        
        if (data.self) {
            document.getElementById("newbio").value = data.bio;
            document.getElementById("edit").style.display = "block";
        }
    }
}
getProfile();

let executing = false;
async function updateBio() {
    if (executing) return;
    executing = true;

    let data = {newbio: document.getElementById("newbio").value }

    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    let response = await fetch('/api/setBio', options);
    let resdata = await response.text();
    if (resdata.startsWith("success")) {
        document.getElementById("error").textContent = "Bio updated successfully. Reloading...";
        document.getElementById("edit").style.display = "none";
        setTimeout(function() {window.location.reload()}, 500);
    }
    else {
        executing = false;
    }
}