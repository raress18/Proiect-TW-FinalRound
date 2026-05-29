window.addEventListener("load", function () {
    // Etapa6: Validare la schimbare range (afisarea valorii selectate - req. 63)
    //la fiecare schimbare ruleaza functia, care, apoi inlocuieste val-pret cu noua valoare de la slider
    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("val-pret-maxim").innerHTML = this.value;
    }

    // Etapa6: Validare live pentru Textarea (Floating label cu validare tip is-invalid, si corectare automata - req. 90, 94)
    const descriereTextarea = document.getElementById("inp-descriere");
    //input ruleaza functia la fiecare litera scrisa
    descriereTextarea.addEventListener("input", function () {
        let valoare = this.value.toLowerCase().trim();
        let valRaw = this.value;
        // Permite litere, cifre, spatii, cratime, virgule, puncte si diacritice romanesti
        let regex = /^[a-zA-Z0-9 \-ăâîșțĂÂÎȘȚ,.]*$/;
        //+ e cuantificator de 1 sau mai multe ori, trebuie sa introduca minim un caracter

        // Validare esuată: conține cuvântul "test", are doar 1-2 litere (dacă s-a început scrierea) sau conține caractere nepermise
        let esteInvalid = valoare.includes("test") || (valoare.length > 0 && valoare.length < 3) || !regex.test(valRaw);

        //classlist ca sa mearga .add si .remove
        if (esteInvalid) {
            this.classList.add("is-invalid");  // Bootstrap Floating label trece în stil 'invalid' roșu
        } else {
            this.classList.remove("is-invalid"); // Corectarea automată cerută
        }
    });

    // Declansare filtru la click pe iconita de search din afara filtrelor
    document.getElementById("btn-search-icon").onclick = function () {
        document.getElementById("btn-filtrare").click();
    };

    // Suport pentru tasta Enter in search bar
    document.getElementById("inp-nume").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();//anulez refreshul automat
            document.getElementById("btn-filtrare").click();
        }
    });

    // Etapa6: Buton filtrare care aplica filtrarea dupa toate inputurile activate (req. 85)
    document.getElementById("btn-filtrare").onclick = function () {
        let rawNume = document.getElementById("inp-nume").value;
        let valNume = rawNume.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let valPret = parseFloat(document.getElementById("inp-pret").value);
        let valCuloare = document.getElementById("inp-culoare").value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let radAprobat = document.querySelector('input[name="gr-rad"]:checked').value;

        let checkBoxuri = document.querySelectorAll('input[name="mat"]:checked');
        let materialeSelectate = [];
        for (let ch of checkBoxuri) {
            materialeSelectate.push(ch.value.toLowerCase());
        }

        let valDescriere = document.getElementById("inp-descriere").value.toLowerCase();

        let valCategorie = document.getElementById("inp-categorie").value;

        let selectSport = document.getElementById("inp-sport");
        let sporturiSelectate = [];
        for (let opt of selectSport.options) {
            if (opt.selected) {
                sporturiSelectate.push(opt.value.toLowerCase());
            }
        }

        // Etapa6: Validare (la click pe filtru/sortare/calcul) verificam intai ca inputurile sunt valide si oprim executia cu alert - req. 90
        if (rawNume && !/^[a-zA-Z0-9 \-ăâîșțĂÂÎȘȚ]+$/.test(rawNume)) {

            alert("Numele produsului contine caractere invalide!");
            return;
        }

        if (document.getElementById("inp-descriere").classList.contains("is-invalid")) {
            alert("Cuvintele cheie din descriere contin caractere invalide sau sunt prea scurte!");
            return;
        }

        let articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            art.style.display = "none"; // initial le ascundem

            let nume = art.querySelector("h3 a").innerHTML.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let pret = parseFloat(art.querySelector(".val-pret").innerHTML);
            let culoare = art.querySelector(".val-culoare").innerHTML.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");//de la unicode 300 la unincode 036f (virgulite caciulite)
            let aprobat = art.querySelector(".val-aprobat").innerHTML.toLowerCase() === "da" ? "da" : "nu";
            let materiale = art.querySelector(".val-materiale").innerHTML.toLowerCase();
            let descriere = art.querySelector(".val-descriere").innerHTML.toLowerCase();
            let categorie = art.querySelector(".val-categorie").innerHTML;
            let sport = art.querySelector(".val-sport").innerHTML.toLowerCase();

            let condNume = nume.includes(valNume);
            let condPret = pret <= valPret;
            let condCuloare = valCuloare === "" || culoare.includes(valCuloare);
            let condAprobat = radAprobat === "toate" || radAprobat === aprobat;
            let condCategorie = valCategorie === "toate" || valCategorie === categorie;
            let condDescriere = valDescriere === "" || descriere.includes(valDescriere);

            let condMateriale = true;
            if (materialeSelectate.length > 0) {
                condMateriale = false;
                for (let mat of materialeSelectate) {
                    if (materiale.includes(mat)) {
                        condMateriale = true;
                        break; //am gasit unul bun si produsul metrita afisat
                    }
                }
            }

            let condSport = false;
            if (sporturiSelectate.length > 0) {
                if (sporturiSelectate.includes(sport)) {
                    condSport = true;
                }
            } else {
                // daca nimic nu e selectat la multiplu (practic imposibil cu conditia de validare, dar preventiv)
                condSport = true;
            }

            if (condNume && condPret && condCuloare && condAprobat && condCategorie && condDescriere && condMateriale && condSport) {
                art.style.display = "block"; // afisam elementul
            }
        }
    }

    // Etapa6: Doua butoane de sortare dupa doua chei (raport caracteristica numerica secundara/pret si a 2a cheie categorie secundara/sport) - req. 86
    function sorteaza(semn) {
        let articole = document.getElementsByClassName("produs");
        let v_articole = Array.from(articole);

        v_articole.sort(function (a, b) {
            let greutate_a = parseInt(a.querySelector(".val-greutate").innerHTML);
            let pret_a = parseFloat(a.querySelector(".val-pret").innerHTML);
            let raport_a = pret_a > 0 ? greutate_a / pret_a : 0;

            let greutate_b = parseInt(b.querySelector(".val-greutate").innerHTML);
            let pret_b = parseFloat(b.querySelector(".val-pret").innerHTML);
            let raport_b = pret_b > 0 ? greutate_b / pret_b : 0;

            if (raport_a !== raport_b) {
                return semn * (raport_a - raport_b);
            }

            let sport_a = a.querySelector(".val-sport").innerHTML;
            let sport_b = b.querySelector(".val-sport").innerHTML;
            return semn * sport_a.localeCompare(sport_b);//locale compare returneaza 1 daca sport_a>=sport_b si -1 altfel 
        });

        for (let art of v_articole) {
            art.parentNode.appendChild(art); // re-adaugam elementul ordonat
        }
    }

    document.getElementById("btn-sort-asc").onclick = function () {
        sorteaza(1); //sortare crescatoare
    }

    document.getElementById("btn-sort-desc").onclick = function () {
        sorteaza(-1); //sortare descrescatoare
    }

    // Etapa6: Buton calculare suma afisat intr-un div cu pozitie fixa generat dinamic, dispare dupa 2 sec - req. 87
    document.getElementById("btn-calcul").onclick = function () {
        let articole = document.getElementsByClassName("produs");
        let suma = 0;
        for (let art of articole) {
            if (art.style.display !== "none") {
                suma += parseFloat(art.querySelector(".val-pret").innerHTML);
            }
        }

        let divCalcul = document.createElement("div");
        divCalcul.id = "div-calcul-dinamic";
        divCalcul.innerHTML = "Suma preturilor produselor afisate: <strong>" + suma + " RON</strong>";
        divCalcul.style.position = "fixed";
        divCalcul.style.top = "50%";
        divCalcul.style.left = "50%";
        divCalcul.style.transform = "translate(-50%, -50%)";
        divCalcul.style.backgroundColor = "white";
        divCalcul.style.border = "2px solid var(--culoare-primara)";
        divCalcul.style.padding = "20px";
        divCalcul.style.boxShadow = "0px 0px 15px rgba(0,0,0,0.5)";
        divCalcul.style.zIndex = "1000";
        divCalcul.style.borderRadius = "10px";

        document.body.appendChild(divCalcul); //il punem in document body pt a fi afisat peste restul elementelor

        setTimeout(function () {
            if (document.getElementById("div-calcul-dinamic")) {
                document.getElementById("div-calcul-dinamic").remove();
            }
        }, 2000); //2sec
    }

    // Etapa6: Resetare filtre - mesaj confirmare, intoarcere la default, reseteaza sortarea la cea initiala - req. 88, 89
    document.getElementById("btn-reset").onclick = function () {
        if (confirm("Esti sigur ca vrei sa resetezi filtrele?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = 1000;
            document.getElementById("val-pret-maxim").innerHTML = "1000";
            document.getElementById("inp-culoare").value = "";
            document.querySelector('input[name="gr-rad"][value="toate"]').checked = true;

            let checkBoxuri = document.querySelectorAll('input[name="mat"]');
            for (let ch of checkBoxuri) {
                ch.checked = false;
            }

            document.getElementById("inp-descriere").value = "";
            document.getElementById("inp-descriere").classList.remove("is-invalid");
            document.getElementById("inp-categorie").value = "toate";

            let selectSport = document.getElementById("inp-sport");
            for (let opt of selectSport.options) {
                opt.selected = true;
            }

            let articole = document.getElementsByClassName("produs");
            // reseteaza si sortarea (pentru simplitate, reincarcam pagina dar cu parametrul din query curatat, sau doar punem in ordinea ID-ului. Vom reincarca pt ordine initiala 100%)
            // cerinta zice "Se reafișează toate produsele (fără nicun filtru aplicat) și în ordinea inițială"

            // Refacem in ordinea initiala a ID-urilor daca vrem din JS:
            let v_articole = Array.from(articole);
            v_articole.sort(function (a, b) {
                let id_a = parseInt(a.id.split("_")[1]);
                let id_b = parseInt(b.id.split("_")[1]);
                return id_a - id_b;
            });

            for (let art of v_articole) {
                art.style.display = "block";
                art.parentNode.appendChild(art);
            }
        }
    }
});
