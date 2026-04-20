const express = require("express");
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const sharp = require("sharp");

const app = express();
app.set("view engine", "ejs");

const obGlobal = {
    obErori: null,
    folderScss: path.join(__dirname, 'resurse', 'scss'),
    folderCss: path.join(__dirname, 'resurse', 'css'),
    folderBackup: path.join(__dirname, 'backup')
};

console.log("Folder index.js (__dirname):", __dirname);

// --- 1. Crearea automata a folderelor necesare ---
const vector_foldere = [
    "temp", "logs", "backup", "fisiere_uploadate", 
    obGlobal.folderScss, 
    obGlobal.folderCss, 
    path.join(obGlobal.folderBackup, 'resurse', 'css') // Subcalea pentru backup CSS
];

for (let folder of vector_foldere) {
    let caleFolder = path.isAbsolute(folder) ? folder : path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
    }
}

// --- 2. Compilare SASS si Backup ---
function compileazaScss(caleScss, caleCss) {
    try {
        let drumScss = path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
        let numeFisierScss = path.basename(drumScss, '.scss');
        
        let drumCss = caleCss ? 
            (path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss)) : 
            path.join(obGlobal.folderCss, numeFisierScss + '.css');

        // Salvare în backup ÎNAINTE de compilare
        if (fs.existsSync(drumCss)) {
            let timestamp = new Date().getTime();
            let numeBackup = `${timestamp}_${path.basename(drumCss)}`;
            let caleBackup = path.join(obGlobal.folderBackup, 'resurse', 'css', numeBackup);
            
            try {
                fs.copyFileSync(drumCss, caleBackup);
            } catch (errBackup) {
                console.error(`Eroare Backup pentru ${drumCss}:`, errBackup.message);
            }
        }

        // Compilare si scriere in fisier
        const rezultat = sass.compile(drumScss);
        fs.writeFileSync(drumCss, rezultat.css);
        console.log(`[SCSS] Compilat cu succes: ${path.basename(drumScss)} -> ${path.basename(drumCss)}`);

    } catch (err) {
        console.error(`[Eroare SASS] la compilarea ${caleScss}:`, err.message);
    }
}

// Compilare inițială la pornirea serverului
if (fs.existsSync(obGlobal.folderScss)) {
    fs.readdirSync(obGlobal.folderScss).forEach(fisier => {
        if (fisier.endsWith('.scss')) {
            compileazaScss(fisier);
        }
    });

    // Urmarirea modificarilor (Watch)
    fs.watch(obGlobal.folderScss, (eveniment, fisier) => {
        if (fisier && fisier.endsWith('.scss')) {
            setTimeout(() => {
                compileazaScss(fisier);
            }, 100);
        }
    });
}

// --- 3. Generare Galerie Statica ---
function initGalerie() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    if (!fs.existsSync(caleJson)) return [];

    const dateGalerie = JSON.parse(fs.readFileSync(caleJson, 'utf8'));
    
    // Determinare anotimp
    const vectLuni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
    const lunaCurenta = vectLuni[new Date().getMonth()];
    const anotimpCurent = dateGalerie.anotimpuri[lunaCurenta];

    // Filtrare si limitare la 10
    let imaginiFiltrate = dateGalerie.imagini
        .filter(img => img.anotimp === anotimpCurent)
        .slice(0, 13);

    const folderGalerie = path.join(__dirname, dateGalerie.cale_galerie);
    const folderMic = path.join(folderGalerie, "mic");
    const folderMediu = path.join(folderGalerie, "mediu");

    [folderMic, folderMediu].forEach(f => {
        if (!fs.existsSync(f)) fs.mkdirSync(f, { recursive: true });
    });

    imaginiFiltrate.forEach(img => {
        let caleOriginala = path.join(folderGalerie, img.cale_fisier);
        
        if (!fs.existsSync(caleOriginala)) return;

        let numeFaraExtensie = path.basename(img.cale_fisier, path.extname(img.cale_fisier));
        
        let caleFisierMic = path.join(folderMic, `${numeFaraExtensie}.webp`);
        let caleFisierMediu = path.join(folderMediu, `${numeFaraExtensie}.webp`);

        // Formam caile web (inlocuim backslash cu slash pt browsere)
        img.cale_web_mare = path.posix.join(dateGalerie.cale_galerie, img.cale_fisier);
        img.cale_web_medie = path.posix.join(dateGalerie.cale_galerie, 'mediu', `${numeFaraExtensie}.webp`);
        img.cale_web_mica = path.posix.join(dateGalerie.cale_galerie, 'mic', `${numeFaraExtensie}.webp`);

        // Procesare cu Sharp
        if (!fs.existsSync(caleFisierMic)) {
            sharp(caleOriginala).resize(150).webp().toFile(caleFisierMic).catch(err => console.error(err));
        }
        if (!fs.existsSync(caleFisierMediu)) {
            sharp(caleOriginala).resize(300).webp().toFile(caleFisierMediu).catch(err => console.error(err));
        }
    });

    return imaginiFiltrate;
}


// --- 4. Setari Express & Erori ---
app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function initErori() {
    let caleErori = path.join(__dirname, "resurse/json/erori.json");
    if (fs.existsSync(caleErori)) {
        let continut = fs.readFileSync(caleErori).toString("utf-8");
        let erori = JSON.parse(continut);
        obGlobal.obErori = erori;
        let err_default = erori.eroare_default;
        
        err_default.imagine = path.join(erori.cale_baza, err_default.imagine).replace(/\\/g, '/');
        for (let eroare of erori.info_erori) {
            eroare.imagine = path.join(erori.cale_baza, eroare.imagine).replace(/\\/g, '/');
        }
    }
}
initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
    if (!obGlobal.obErori) {
        return res.status(500).send("Eroare interna: obErori nu este initializat.");
    }
    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator == identificator);
    let errDefault = obGlobal.obErori.eroare_default;
    let statusCode = (identificator && typeof identificator === 'number') ? identificator : 500;

    res.status(statusCode).render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text
    });
}

// --- RUTE ---
app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico")); 
});

// Trimitem datele galeriei catre ruta /
app.get(["/", "/index", "/home"], function (req, res) {
    const dateGalerie = initGalerie();
    res.render("pagini/index", {
        ip: req.ip,
        imaginiGalerie: dateGalerie
    });
});

app.get("/*pagina", function (req, res) {
    if (req.url.startsWith("/resurse") && path.extname(req.url) === "") {
        afisareEroare(res, 403);
        return;
    }
    if (req.url.endsWith(".ejs")) {
        afisareEroare(res, 400);
        return;
    }
    
    try {
        // Daca pagina e 'despre', trimitem si galeria catre ea
        let parametriiRandare = {};
        if (req.url === "/despre") {
            parametriiRandare.imaginiGalerie = initGalerie();
        }

        res.render("pagini" + req.url, parametriiRandare, function (err, rezRandare) {
            if (err) {
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