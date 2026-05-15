-- Creare baza de date si utilizator (se vor executa cu un user admin, de ex. postgres)
-- CREATE DATABASE magazin_contact;
-- CREATE USER user_magazin WITH ENCRYPTED PASSWORD 'parola123';
-- GRANT ALL PRIVILEGES ON DATABASE magazin_contact TO user_magazin;

-- conectare la baza de date magazin_contact si rulare script:

DROP TABLE IF EXISTS produse;
DROP TYPE IF EXISTS categorie_echipament;

CREATE TYPE categorie_echipament AS ENUM('manusi', 'protectie', 'imbracaminte', 'antrenament', 'accesorii');

CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere TEXT NOT NULL,
    imagine VARCHAR(255) NOT NULL,
    categorie categorie_echipament NOT NULL,
    tip_sport VARCHAR(50) NOT NULL, -- ex: Box, MMA, BJJ, General
    pret NUMERIC(8, 2) NOT NULL,
    greutate INTEGER NOT NULL, -- greutate in grame
    data_adaugare DATE NOT NULL DEFAULT CURRENT_DATE,
    culoare VARCHAR(30) NOT NULL,
    materiale VARCHAR(255) NOT NULL, -- separate prin virgula
    aprobat_competitie BOOLEAN NOT NULL
);

-- Inserare 16 produse cu date variate pentru a putea fi testate sortarile si filtrarile
INSERT INTO produse (nume, descriere, imagine, categorie, tip_sport, pret, greutate, data_adaugare, culoare, materiale, aprobat_competitie) VALUES
('Mănuși Box Elite 14oz', 'Mănuși de box din piele naturală, ideale pentru sparring.', 'manusi_box.jpg', 'manusi', 'Box', 280.00, 396, '2023-05-10', 'Rosu', 'Piele naturala,Spuma cu densitate tripla', true),
('Mănuși MMA Sparring', 'Mănuși cu degete libere, padding gros pe monturi.', 'manusi_mma.jpg', 'manusi', 'MMA', 190.50, 113, '2023-06-22', 'Negru', 'Piele sintetica,Gel', false),
('Tibiere Kickboxing', 'Tibiere ușoare, asigură mobilitate și protecție maximă.', 'tibiere.jpg', 'protectie', 'Kickboxing', 210.00, 350, '2022-11-15', 'Albastru', 'Piele sintetica,Spuma EVA,Elastan', true),
('Cască Protecție Full-Face', 'Cască cu protecție extra pentru pomeți și bărbie.', 'casca_protectie.jpg', 'protectie', 'Box', 320.00, 450, '2023-01-05', 'Negru', 'Piele naturala,Spuma', false),
('Proteză Dentară Gel', 'Proteză termomodelabilă pentru potrivire perfectă.', 'proteza.jpg', 'protectie', 'General', 45.00, 30, '2021-08-30', 'Transparent', 'Silicon,Gel', true),
('Sac de Box 40kg', 'Sac greu pentru antrenament de forță și rezistență.', 'sac_box.jpg', 'antrenament', 'Box', 450.00, 40000, '2022-03-10', 'Negru', 'Piele sintetica,Material textil presat', false),
('Rashguard BJJ Maneca Lunga', 'Tricou de compresie pentru antrenamente la sol.', 'rashguard.jpg', 'imbracaminte', 'BJJ', 150.00, 180, '2023-04-18', 'Negru', 'Poliester,Spandex', true),
('Pantaloni Fight Shorts', 'Pantaloni scurți cu fante laterale adânci.', 'shorts.jpg', 'imbracaminte', 'MMA', 140.00, 150, '2022-07-25', 'Rosu', 'Poliester,Microfibra', true),
('Kimono BJJ Competitie', 'Gi rezistent cu tesatura pearl weave.', 'kimono_bjj.jpg', 'imbracaminte', 'BJJ', 490.00, 1600, '2023-02-28', 'Alb', 'Bumbac', true),
('Fașe Box 4.5m', 'Fașe elastice pentru încheieturi sigure.', 'fase.jpg', 'accesorii', 'General', 30.00, 50, '2021-12-01', 'Galben', 'Bumbac,Elastan', true),
('Coardă Viteză Rulmenți', 'Coardă subțire cu rulmenți pentru joc de picioare.', 'coarda.jpg', 'antrenament', 'General', 65.00, 120, '2022-05-14', 'Negru', 'Otel,Plastic', false),
('Pernuțe Focus (Palmare)', 'Palmare ușoare pentru antrenamentul preciziei.', 'palmare.jpg', 'antrenament', 'Box', 175.00, 250, '2023-03-12', 'Rosu', 'Piele sintetica,Spuma densa', false),
('Cochilie Protecție', 'Protecție inghinală cu margini flexibile.', 'cochilie.jpg', 'protectie', 'MMA', 85.00, 90, '2022-09-08', 'Alb', 'Plastic dur,Silicon', true),
('Mănuși Sac', 'Mănuși subțiri, doar pentru antrenamentul la sac.', 'manusi_sac.jpg', 'manusi', 'Box', 120.00, 200, '2021-10-10', 'Negru', 'Piele sintetica', false),
('Geantă Echipament', 'Geantă mare ventilată pentru tot echipamentul.', 'geanta.jpg', 'accesorii', 'General', 180.00, 800, '2023-07-02', 'Gri', 'Nylon,Plasa', false),
('Cremă Încălzire Musculară', 'Cremă pentru pregătirea mușchilor înainte de efort.', 'crema.jpg', 'accesorii', 'General', 55.00, 150, '2023-08-11', 'Alb', 'Extracte naturale,Mentol', true);
