# Invictus 2011 – web pro GitHub Pages

Hotová jednostránková prezentace klubu. Web nevyžaduje instalaci ani sestavení.

## Nasazení

Nahrajte obsah této složky do kořene repozitáře GitHub Pages:

- `index.html`
- `style.css`
- `script.js`
- složku `assets`

## Snadné úpravy

- Texty a sekce: `index.html`
- Hráči a názvy fotografií: začátek `script.js`
- Statistiky hráčů: generovaný soubor `players-data.js`
- Barvy a vzhled: proměnné na začátku `style.css`
- Fotografie galerie: složka `assets` a sekce `gallery-grid` v `index.html`

## Automatický Instagram feed

Workflow `.github/workflows/update-instagram-feed.yml` každé dvě hodiny načte posledních pět příspěvků profilu `@futsalinvictus2011` a aktualizuje `instagram-feed.json`.

V nastavení repozitáře je nutné vytvořit Actions secret `INSTAGRAM_ACCESS_TOKEN` s dlouhodobým tokenem profesionálního Instagram účtu a oprávněním `instagram_business_basic`. Token se používá pouze v GitHub Actions. Aktualizační skript jej průběžně obnovuje a aktuální hodnotu ukládá do repozitáře pouze v zašifrované podobě.

Workflow lze po přidání secretu poprvé spustit ručně v záložce Actions. Když Instagram API selže, poslední funkční obsah souboru zůstane beze změny.

## Obsah k doplnění

Kontaktní e-mail zatím není uvedený. Klubový Instagram je propojený.
