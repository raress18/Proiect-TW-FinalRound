-- Etapa6: Creare utilizator, baza de date, tabel (req. 7, 9)
-- CREATE DATABASE magazin_contact;
-- CREATE USER user_magazin WITH ENCRYPTED PASSWORD 'parola123';
-- GRANT ALL PRIVILEGES ON DATABASE magazin_contact TO user_magazin;

-- conectare la baza de date magazin_contact si rulare script:

DROP TABLE IF EXISTS produse CASCADE;
DROP TYPE IF EXISTS categorie_echipament;

-- Etapa6: Categorie mare ca enumeratie (req. 15)
CREATE TYPE categorie_echipament AS ENUM('manusi', 'protectie', 'imbracaminte', 'antrenament', 'accesorii');

CREATE TABLE produse (
    id SERIAL PRIMARY KEY, -- Etapa6: id (req. 11)
    nume VARCHAR(100) NOT NULL, -- Etapa6: nume, descriere, imagine (req. 12-14)
    descriere TEXT NOT NULL,
    imagine VARCHAR(255) NOT NULL,
    categorie categorie_echipament NOT NULL,
    tip_sport VARCHAR(50) NOT NULL, -- Etapa6: mod categorizare secundar (req. 16)
    pret NUMERIC(8, 2) NOT NULL, -- Etapa6: pret (req. 17)
    greutate INTEGER NOT NULL, -- Etapa6: a doua caracteristica numerica (req. 18)
    data_adaugare DATE NOT NULL DEFAULT CURRENT_DATE, -- Etapa6: data calendaristica (req. 19)
    culoare VARCHAR(30) NOT NULL, -- Etapa6: o singura valoare (req. 20)
    materiale VARCHAR(255) NOT NULL, -- Etapa6: mai multe valori, separate prin virgula (req. 21)
    aprobat_competitie BOOLEAN NOT NULL -- Etapa6: caracteristica booleana (req. 22)
);

-- Etapa6: Inserare 15-20 entitati (req. 25)
INSERT INTO produse (nume, descriere, imagine, categorie, tip_sport, pret, greutate, data_adaugare, culoare, materiale, aprobat_competitie) VALUES
('Mănuși Box Elite 14oz', 'Mănuși de box din piele naturală, ideale pentru sparring.', 'galerie/manusi_box.jpg', 'manusi', 'Box', 280.00, 396, '2023-05-10', 'Negru', 'Piele naturala,Spuma cu densitate tripla', true),
('Mănuși MMA Sparring', 'Mănuși cu degete libere, padding gros pe monturi.', 'galerie/manusi_mma.jpg', 'manusi', 'MMA', 190.50, 113, '2023-06-22', 'Negru', 'Piele sintetica,Gel', false),
('Tibiere Kickboxing', 'Tibiere ușoare, asigură mobilitate și protecție maximă.', 'galerie/tibiere_mma.jpg', 'protectie', 'Kickboxing', 210.00, 350, '2022-11-15', 'Negru', 'Piele sintetica,Spuma EVA,Elastan', true),
('Cască Protecție Full-Face', 'Cască cu protecție extra pentru pomeți și bărbie.', 'galerie/casca_protectie.jpg', 'protectie', 'Box', 320.00, 450, '2023-01-05', 'Negru', 'Piele naturala,Spuma', false),
('Proteză Dentară Gel', 'Proteză termomodelabilă pentru potrivire perfectă.', 'galerie/proteza_dentara.jpg', 'protectie', 'General', 45.00, 30, '2021-08-30', 'Negru', 'Silicon,Gel', true),
('Sac de Box 40kg', 'Sac greu pentru antrenament de forță și rezistență.', 'galerie/sac_box.jpg', 'antrenament', 'Box', 450.00, 40000, '2022-03-10', 'Negru', 'Piele sintetica,Material textil presat', false),
('Rashguard BJJ Maneca Lunga', 'Tricou de compresie pentru antrenamente la sol.', 'galerie/rashguard.jpg', 'imbracaminte', 'BJJ', 150.00, 180, '2023-04-18', 'Negru', 'Poliester,Spandex', true),
('Pantaloni Fight Shorts', 'Pantaloni scurți cu fante laterale adânci.', 'galerie/pantaloni_scurti.jpg', 'imbracaminte', 'MMA', 140.00, 150, '2022-07-25', 'Negru', 'Poliester,Microfibra', true),
('Kimono BJJ Competitie', 'Gi rezistent cu tesatura pearl weave.', 'galerie/gi_bjj.jpg', 'imbracaminte', 'BJJ', 490.00, 1600, '2023-02-28', 'Alb', 'Bumbac', true),
('Fașe Box 4.5m', 'Fașe elastice pentru încheieturi sigure.', 'galerie/fase_box.jpg', 'accesorii', 'General', 30.00, 50, '2021-12-01', 'Negru', 'Bumbac,Elastan', true),
('Coardă Viteză Rulmenți', 'Coardă subțire cu rulmenți pentru joc de picioare.', 'galerie/coarda_viteza.jpg', 'antrenament', 'General', 65.00, 120, '2022-05-14', 'Negru', 'Otel,Plastic', false),
('Tricou Compresie', 'Tricou mulat pentru eliminarea transpiratiei.', 'galerie/tricou_compresie.jpg', 'imbracaminte', 'General', 120.00, 150, '2023-03-12', 'Negru', 'Poliester,Elastan', true),
('Cochilie Protecție', 'Protecție inghinală cu margini flexibile.', 'galerie/cochilie_protectie.jpg', 'protectie', 'MMA', 85.00, 90, '2022-09-08', 'Alb', 'Plastic dur,Silicon', true),
('Mănuși Sac', 'Mănuși subțiri, doar pentru antrenamentul la sac.', 'galerie/manusi_sac.jpg', 'manusi', 'Box', 120.00, 200, '2021-10-10', 'Negru', 'Piele sintetica', false),
('Geantă Echipament', 'Geantă mare ventilată pentru tot echipamentul.', 'galerie/geanta_sport.jpg', 'accesorii', 'General', 180.00, 800, '2023-07-02', 'Negru', 'Nylon,Plasa', false),
('Cremă Încălzire Musculară', 'Cremă pentru pregătirea mușchilor înainte de efort.', 'galerie/crema_incalzire.jpg', 'accesorii', 'General', 55.00, 150, '2023-08-11', 'Negru', 'Extracte naturale,Mentol', true);

-- Bonus 17: Seturi de produse
DROP TABLE IF EXISTS asociere_set;
DROP TABLE IF EXISTS seturi;

CREATE TABLE seturi (
    id SERIAL PRIMARY KEY,
    nume_set VARCHAR(100) NOT NULL,
    descriere_set TEXT NOT NULL
);

CREATE TABLE asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INTEGER NOT NULL REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INTEGER NOT NULL REFERENCES produse(id) ON DELETE CASCADE
);

INSERT INTO seturi (nume_set, descriere_set) VALUES
('Set Începător Box', 'Echipament complet pentru începători la box (mănuși și protecție).'),
('Set Pro MMA', 'Echipament avansat pentru MMA (mănuși, rashguard, pantaloni).'),
('Set Sparring', 'Set pentru antrenament cu partener (tibiere, cască, mănuși, proteză).'),
('Set Echipament BJJ', 'Tot ce ai nevoie pentru antrenamentele de BJJ.'),
('Set Antrenament Acasă', 'Pentru antrenamente solo (sac, mănuși sac, coardă).');

INSERT INTO asociere_set (id_set, id_produs) VALUES
(1, (SELECT id FROM produse WHERE nume = 'Mănuși Box Elite 14oz' LIMIT 1)),
(1, (SELECT id FROM produse WHERE nume = 'Proteză Dentară Gel' LIMIT 1)),
(1, (SELECT id FROM produse WHERE nume = 'Fașe Box 4.5m' LIMIT 1)),
(2, (SELECT id FROM produse WHERE nume = 'Mănuși MMA Sparring' LIMIT 1)),
(2, (SELECT id FROM produse WHERE nume = 'Rashguard BJJ Maneca Lunga' LIMIT 1)),
(2, (SELECT id FROM produse WHERE nume = 'Pantaloni Fight Shorts' LIMIT 1)),
(3, (SELECT id FROM produse WHERE nume = 'Tibiere Kickboxing' LIMIT 1)),
(3, (SELECT id FROM produse WHERE nume = 'Cască Protecție Full-Face' LIMIT 1)),
(3, (SELECT id FROM produse WHERE nume = 'Mănuși Box Elite 14oz' LIMIT 1)),
(3, (SELECT id FROM produse WHERE nume = 'Proteză Dentară Gel' LIMIT 1)),
(4, (SELECT id FROM produse WHERE nume = 'Kimono BJJ Competitie' LIMIT 1)),
(4, (SELECT id FROM produse WHERE nume = 'Rashguard BJJ Maneca Lunga' LIMIT 1)),
(5, (SELECT id FROM produse WHERE nume = 'Sac de Box 40kg' LIMIT 1)),
(5, (SELECT id FROM produse WHERE nume = 'Mănuși Sac' LIMIT 1)),
(5, (SELECT id FROM produse WHERE nume = 'Coardă Viteză Rulmenți' LIMIT 1));
