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
console.log("Folder curent de lucru (process.cwd()):", process.cwd());
console.log("Cale fisier (__filename):", __filename);

// --- 1. Crearea automata a folderelor necesare ---
const vector_foldere = [
    "temp", "logs", "backup", "fisiere_uploadate",
    obGlobal.folderScss,
    obGlobal.folderCss,
    path.join(obGlobal.folderBackup, 'resurse', 'css')
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

        // ==========================================
        // BONUS 4 (0.025): Suport pentru nume de fisiere cu puncte
        // Extragem extensia exacta si o scoatem din nume, pastrand restul fisierului intact
        // ==========================================
        let extensie = path.extname(drumScss);
        let numeFisierScss = path.basename(drumScss, extensie);

        let drumCss = caleCss ?
            (path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss)) :
            path.join(obGlobal.folderCss, numeFisierScss + '.css');

        if (fs.existsSync(drumCss)) {
            // ==========================================
            // BONUS 3 (0.05): Nume backup cu format fisier_timestamp.css
            // ==========================================
            let timestamp = new Date().getTime();
            let numeBazaCss = path.basename(drumCss, '.css'); // scoatem extensia .css
            let numeBackup = `${numeBazaCss}_${timestamp}.css`; // formam noul nume cerut
            let caleBackup = path.join(obGlobal.folderBackup, 'resurse', 'css', numeBackup);

            try {
                fs.copyFileSync(drumCss, caleBackup);
            } catch (errBackup) {
                console.error(`Eroare Backup pentru ${drumCss}:`, errBackup.message);
            }
        }

        const rezultat = sass.compile(drumScss);
        fs.writeFileSync(drumCss, rezultat.css);
        console.log(`[SCSS] Compilat cu succes: ${path.basename(drumScss)} -> ${path.basename(drumCss)}`);

    } catch (err) {
        console.error(`[Eroare SASS] la compilarea ${caleScss}:`, err.message);
    }
}

if (fs.existsSync(obGlobal.folderScss)) {
    fs.readdirSync(obGlobal.folderScss).forEach(fisier => {
        if (fisier.endsWith('.scss')) {
            compileazaScss(fisier);
        }
    });

    fs.watch(obGlobal.folderScss, (eveniment, fisier) => {
        if (fisier && fisier.endsWith('.scss')) {
            setTimeout(() => {
                compileazaScss(fisier);
            }, 100);
        }
    });
}

// ==========================================
// BONUS 5: Verificare date din JSON galerie la pornirea serverului
// ==========================================
function verificaDateGalerie() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    if (!fs.existsSync(caleJson)) {
        console.error("Eroare: Fișierul galerie.json nu a fost găsit.");
        return;
    }

    const dateGalerie = JSON.parse(fs.readFileSync(caleJson, 'utf8'));
    const folderGalerie = path.join(__dirname, dateGalerie.cale_galerie);

    if (!fs.existsSync(folderGalerie)) {
        console.error(`Eroare BONUS 5: Folderul specificat în cale_galerie ('${dateGalerie.cale_galerie}') nu există în sistemul de fișiere!`);
    } else {
        dateGalerie.imagini.forEach(img => {
            let caleImagineFizica = path.join(folderGalerie, img.cale_fisier);
            if (!fs.existsSync(caleImagineFizica)) {
                console.error(`Eroare BONUS 5: Fișierul imagine '${img.cale_fisier}' specificat în lista din galerie.json nu a fost găsit pe disc!`);
            }
        });
    }
}
verificaDateGalerie();

// --- 3. Generare Galerie Statica ---
function initGalerie() {
    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    if (!fs.existsSync(caleJson)) return [];

    const dateGalerie = JSON.parse(fs.readFileSync(caleJson, 'utf8'));

    const folderGalerie = path.join(__dirname, dateGalerie.cale_galerie);

    const vectLuni = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
    const lunaCurenta = vectLuni[new Date().getMonth()];
    const anotimpCurent = dateGalerie.anotimpuri[lunaCurenta];

    let imaginiFiltrate = dateGalerie.imagini
        .filter(img => img.anotimp === anotimpCurent)
        .slice(0, 13);

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

        img.cale_web_mare = path.posix.join(dateGalerie.cale_galerie, img.cale_fisier);
        img.cale_web_medie = path.posix.join(dateGalerie.cale_galerie, 'mediu', `${numeFaraExtensie}.webp`);
        img.cale_web_mica = path.posix.join(dateGalerie.cale_galerie, 'mic', `${numeFaraExtensie}.webp`);

        if (!fs.existsSync(caleFisierMic)) {
            sharp(caleOriginala).resize(150).webp().toFile(caleFisierMic).catch(err => console.error(err));
        }
        if (!fs.existsSync(caleFisierMediu)) {
            sharp(caleOriginala).resize(300).webp().toFile(caleFisierMediu).catch(err => console.error(err));
        }
    });

    return imaginiFiltrate;
}

// --- Generare Galerie Animată ---
function initGalerieAnimata() {
    const puteri = [2, 4, 8, 16];
    const nrImaginiAleator = puteri[Math.floor(Math.random() * puteri.length)];

    const caleJson = path.join(__dirname, "resurse", "json", "galerie.json");
    if (!fs.existsSync(caleJson)) return [];

    const dateGalerie = JSON.parse(fs.readFileSync(caleJson, 'utf8'));

    let imaginiDistincte = [];
    let setCai = new Set();

    dateGalerie.imagini.forEach((img, index) => {
        if (index % 2 === 0 && !setCai.has(img.cale_fisier)) {
            let imgFormatata = {
                ...img,
                cale_web: path.posix.join(dateGalerie.cale_galerie, img.cale_fisier)
            };
            imaginiDistincte.push(imgFormatata);
            setCai.add(img.cale_fisier);
        }
    });

    let imaginiSelectate = imaginiDistincte.slice(0, nrImaginiAleator);
    const nrFinal = imaginiSelectate.length;

    const caleScssVar = path.join(obGlobal.folderScss, "_galerie_variabile.scss");
    try {
        fs.writeFileSync(caleScssVar, `$nr-imagini: ${nrFinal === 0 ? 1 : nrFinal};\n`);
        compileazaScss("galerie_animata.scss");
    } catch (err) {
        console.error("Eroare SASS la inițializarea galeriei animate:", err);
    }

    return imaginiSelectate;
}


// --- 4. Setari Express & Erori ---
app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function initErori() {
    let caleErori = path.join(__dirname, "resurse/json/erori.json");

    if (!fs.existsSync(caleErori)) {
        console.error("Eroare CRITICĂ: Fișierul erori.json nu a fost găsit. Aplicația se va închide.");
        process.exit(1);
    }

    let continut = fs.readFileSync(caleErori).toString("utf-8");

    let blockRegex = /\{([^{}]*)\}/g;
    let match;
    while ((match = blockRegex.exec(continut)) !== null) {
        let block = match[1];
        let keys = [...block.matchAll(/"([^"]+)"\s*:/g)].map(m => m[1]);
        if (keys.length !== new Set(keys).size) {
            console.error("Eroare BONUS: O proprietate este specificată de mai multe ori în interiorul aceluiași obiect în erori.json!");
        }
    }

    let continutFaraBlocuriInterioare = continut.replace(/\{[^{}]*\}/g, '{}');
    let topKeys = [...continutFaraBlocuriInterioare.matchAll(/"([^"]+)"\s*:/g)].map(m => m[1]);
    if (topKeys.length !== new Set(topKeys).size) {
        console.error("Eroare BONUS: O proprietate principală este specificată de mai multe ori la nivel de root în erori.json!");
    }

    let erori;
    try {
        erori = JSON.parse(continut);
    } catch (err) {
        console.error("Eroare la parsarea JSON-ului erori.json:", err.message);
        return;
    }

    if (!erori.info_erori || !erori.cale_baza || !erori.eroare_default) {
        console.error("Eroare BONUS: Lipsește info_erori, cale_baza sau eroare_default!");
    } else {
        if (!erori.eroare_default.titlu || !erori.eroare_default.text || !erori.eroare_default.imagine) {
            console.error("Eroare BONUS: Pentru eroare_default lipsește titlu, text sau imagine!");
        }

        let caleBazaCompleta = path.join(__dirname, erori.cale_baza);
        if (!fs.existsSync(caleBazaCompleta)) {
            console.error(`Eroare BONUS: Folderul specificat în cale_baza ('${erori.cale_baza}') nu există!`);
        } else {
            let verificaExistentaImagine = (numeImagine, context) => {
                if (numeImagine && !fs.existsSync(path.join(caleBazaCompleta, numeImagine))) {
                    console.error(`Eroare BONUS: Fișierul imagine '${numeImagine}' pentru ${context} nu există!`);
                }
            };

            verificaExistentaImagine(erori.eroare_default.imagine, "eroare_default");
            erori.info_erori.forEach(err => verificaExistentaImagine(err.imagine, `identificatorul ${err.identificator}`));
        }

        let aparitiiId = {};
        erori.info_erori.forEach(err => {
            if (err.identificator !== undefined) {
                aparitiiId[err.identificator] = (aparitiiId[err.identificator] || 0) + 1;
            }
        });

        erori.info_erori.forEach(err => {
            if (aparitiiId[err.identificator] > 1) {
                const { identificator, ...proprietatiFaraId } = err;
                console.error(`Eroare BONUS: Identificatorul '${identificator}' este duplicat. Detalii:`, proprietatiFaraId);
                aparitiiId[err.identificator] = 0;
            }
        });

        obGlobal.obErori = erori;
        let err_default = erori.eroare_default;

        if (err_default && err_default.imagine) {
            err_default.imagine = path.join(erori.cale_baza, err_default.imagine).replace(/\\/g, '/');
        }
        if (erori.info_erori) {
            for (let eroare of erori.info_erori) {
                if (eroare.imagine) {
                    eroare.imagine = path.join(erori.cale_baza, eroare.imagine).replace(/\\/g, '/');
                }
            }
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

app.get(["/", "/index", "/home"], function (req, res) {
    const dateGalerie = initGalerie();
    const imaginiGalerieAnimata = initGalerieAnimata();

    res.render("pagini/index", {
        ip: req.ip,
        imaginiGalerie: dateGalerie,
        imaginiGalerieAnimata: imaginiGalerieAnimata
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