let versets = [];
let score = 0;
let tentatives = 0;

// Charger le JSON
fetch("versets.json")
    .then(response => response.json())
    .then(data => {
        versets = data;
        afficherVerset();
    });

function afficherVerset() {
    let index = Math.floor(Math.random() * versets.length);
    window.currentVerset = versets[index];
    document.getElementById("verset").innerText = window.currentVerset.contenu;
}

document.getElementById("submit").addEventListener("click", () => {
    let livre = document.getElementById("livre").value.trim().toUpperCase();
    let chapitre = document.getElementById("chapitre").value.trim();
    let versetNum = document.getElementById("versetNum").value.trim();

    tentatives++;

    if (
        livre === window.currentVerset.livre.toUpperCase() &&
        chapitre === window.currentVerset.chapitre &&
        versetNum === window.currentVerset.verset
    ) {
        document.getElementById("result").innerText = "✅ Bonne réponse !";
        score++;
    } else {
        document.getElementById("result").innerText = 
            `❌ Faux ! La réponse était : ${window.currentVerset.livre} ${window.currentVerset.chapitre}:${window.currentVerset.verset}`;
    }

    document.getElementById("score").innerText = score;
    afficherVerset();
});