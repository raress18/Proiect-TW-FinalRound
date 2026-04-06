const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.set("view engine", "ejs");

const obGlobal = {
    obErori: null
};

console.log("Folder index.js (__dirname):", __dirname);
console.log("Folder curent de lucru (process.cwd()):", process.cwd());
console.log("Cale fisier (__filename):", __filename);

// 1. Crearea automata a folderelor necesare
const vector_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vector_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

// 2. Setare folder static pentru resurse
app.use("/resurse", express.static(path.join(__dirname, "resurse")));

// 3. Initializare Erori din JSON
function initErori() {
    let caleErori = path.join(__dirname, "resurse/json/erori.json");
    if (fs.existsSync(caleErori)) {
        let continut = fs.readFileSync(caleErori).toString("utf-8");
        let erori = JSON.parse(continut);
        obGlobal.obErori = erori;
        let err_default = erori.eroare_default;
        
        // Formare cai absolute pentru imagini
        err_default.imagine = path.join(erori.cale_baza, err_default.imagine);
        for (let eroare of erori.info_erori) {
            eroare.imagine = path.join(erori.cale_baza, eroare.imagine);
        }
    } else {
        console.error("Eroare: Fisierul erori.json nu a fost gasit in resurse/json/!");
    }
}
initErori();

// 4. Functie afisare eroare pe baza template-ului EJS
function afisareEroare(res, identificator, titlu, text, imagine) {
    if (!obGlobal.obErori) {
        return res.status(500).send("Eroare interna: obErori nu este initializat.");
    }

    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator == identificator);
    let errDefault = obGlobal.obErori.eroare_default;
    
    // Statusul trebuie sa fie codul de eroare, ex 404, altfel 500 (eroare interna) sau 200 (ok) daca nu e specificat corect.
    let statusCode = (identificator && typeof identificator === 'number') ? identificator : 500;

    res.status(statusCode).render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text
    });
}

// --- RUTE ---

// Cerinta 19: Favicon 
app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico")); 
});

// Cerinta 8: Ruta acasa cu vector
app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip // Trimitem IP-ul catre EJS
    });
});

// Cerinta 9: Catch-all pentru rute dinamice
app.get("/*pagina", function (req, res) {
    // Cerinta 17: Erori folder resurse
    if (req.url.startsWith("/resurse") && path.extname(req.url) === "") {
        afisareEroare(res, 403);
        return;
    }
    // Cerinta 18: Protectie vizualizare directa cod EJS
    if (req.url.endsWith(".ejs")) {
        afisareEroare(res, 400);
        return;
    }
    
    try {
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                // Cerinta 10: Daca nu gaseste view-ul
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                    return;
                }
                afisareEroare(res); 
                return;
            }
            res.send(rezRandare);
        });
    } catch (err) {
        afisareEroare(res, 500);
    }
});

app.listen(8080, () => {
    console.log("Serverul a pornit pe portul 8080!");
});