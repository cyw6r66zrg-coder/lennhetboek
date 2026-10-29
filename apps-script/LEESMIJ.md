# Het inschrijfformulier koppelen (eenmalig, ±10 minuten)

Het formulier op de site stuurt inschrijvingen naar een Google Spreadsheet.
Het script hieronder zet elke inschrijving in een regel en stuurt de
bevestigingsmail vanaf jouw eigen Gmail-adres.

1. Ga naar <https://sheets.new> en noem de spreadsheet bijvoorbeeld **Lenn — inschrijvingen**.
2. Kies in het menu **Extensies → Apps Script**.
3. Verwijder de voorbeeldcode en plak de volledige inhoud van `Code.gs` erin. Klik op het opslagicoon.
4. Kies bovenaan de functie **instellen** en klik op **Uitvoeren**. Google vraagt om toestemming:
   kies je account → *Geavanceerd* → *Ga naar (projectnaam)* → *Toestaan*.
   (De waarschuwing komt doordat het je eigen, niet door Google gecontroleerde script is.)
5. Klik rechtsboven op **Implementeren → Nieuwe implementatie**.
   - Type: **Web-app**
   - Uitvoeren als: **Ik**
   - Wie heeft toegang: **Iedereen**
6. Klik op **Implementeren** en kopieer de **web-app-URL** (eindigt op `/exec`).
7. Geef die URL aan Claude, of zet hem zelf in `config.js` bij `formulierUrl`.

## Goed om te weten

- **Limiet:** een gewoon Gmail-account mag ongeveer 100 mails per dag via een script versturen.
  Elke inschrijving kost er 2 (bevestiging + melding aan jou). Haal je meer dan ±50 inschrijvingen
  per dag, verwijder dan de regel `stuurMeldingAanMij(...)` uit `doPost`.
- **Script aangepast?** Kies dan *Implementeren → Implementaties beheren → bewerken (potlood) →
  Versie: Nieuwe versie*. Anders blijft de oude versie draaien. De URL blijft hetzelfde.
- De kolommen *Betaalverzoek verstuurd*, *Betaald* en *Verzonden* zijn vinkjes, zodat je per
  inschrijving kunt bijhouden waar die staat.
