// Ontvangt inschrijvingen van lennhetboek.nl, zet ze in deze spreadsheet
// en stuurt een bevestiging vanaf jouw eigen Gmail-adres.

var PRIJS = 35;
var AFZENDER_NAAM = "Félix — Lenn het boek";
var TABBLAD = "Inschrijvingen";
var KOLOMMEN = ["Datum", "Naam", "E-mail", "Telefoon", "Straat en huisnummer", "Postcode", "Woonplaats", "Aantal", "Bedrag", "Opmerking", "Betaalverzoek verstuurd", "Betaald", "Verzonden"];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Spamval: dit veld is onzichtbaar voor echte bezoekers
  if (p.website) return antwoord({ ok: true });

  var verplicht = ["naam", "email", "telefoon", "straat", "postcode", "woonplaats", "aantal"];
  for (var i = 0; i < verplicht.length; i++) {
    if (!String(p[verplicht[i]] || "").trim()) return antwoord({ ok: false, fout: "Veld ontbreekt: " + verplicht[i] });
  }
  var aantal = parseInt(p.aantal, 10);
  if (!(aantal >= 1 && aantal <= 50)) return antwoord({ ok: false, fout: "Ongeldig aantal" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return antwoord({ ok: false, fout: "Ongeldig e-mailadres" });

  var bedrag = aantal * PRIJS;
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var blad = tabblad();
    // Een apostrof ervoor voorkomt dat Sheets telefoonnummers als getal of formule leest
    blad.appendRow([new Date(), schoon(p.naam), schoon(p.email), "'" + schoon(p.telefoon), schoon(p.straat), schoon(p.postcode), schoon(p.woonplaats), aantal, bedrag, schoon(p.opmerking), false, false, false]);
    blad.getRange(blad.getLastRow(), 11, 1, 3).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }

  stuurBevestiging(p, aantal, bedrag);
  stuurMeldingAanMij(p, aantal, bedrag);
  return antwoord({ ok: true });
}

function stuurBevestiging(p, aantal, bedrag) {
  var voornaam = String(p.naam).trim().split(/\s+/)[0];
  var tekst =
    "Beste " + voornaam + ",\n\n" +
    "Dank je wel voor je inschrijving voor het boek Lenn.\n\n" +
    "Je hebt ingeschreven voor: " + aantal + (aantal === 1 ? " boek" : " boeken") + " (€" + bedrag + ")\n" +
    "Verzendadres: " + p.straat + ", " + p.postcode + " " + p.woonplaats + "\n" +
    "Telefoon voor het betaalverzoek: " + p.telefoon + "\n\n" +
    "Hoe gaat het verder?\n" +
    "Zodra de inschrijfronde is afgerond, ontvang je een betaalverzoek via WhatsApp of sms. " +
    "Na betaling worden de boeken gedrukt en opgestuurd. De levertijd is ongeveer vijf tot zes weken.\n\n" +
    "De opbrengst gaat, na aftrek van de drukkosten, naar het Amalia Kinderfonds van het Radboudumc.\n\n" +
    "Klopt er iets niet? Beantwoord dan gewoon deze e-mail.\n\n" +
    "Hartelijke groet,\nFélix";

  MailApp.sendEmail({
    to: p.email,
    subject: "Je inschrijving voor het boek Lenn",
    body: tekst,
    name: AFZENDER_NAAM
  });
}

function stuurMeldingAanMij(p, aantal, bedrag) {
  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    replyTo: p.email,
    subject: "Nieuwe inschrijving: " + p.naam + " (" + aantal + "x)",
    body: p.naam + "\n" + p.email + "\n" + p.telefoon + "\n" + p.straat + "\n" + p.postcode + " " + p.woonplaats +
      "\n\nAantal: " + aantal + " (€" + bedrag + ")" + (p.opmerking ? "\nOpmerking: " + p.opmerking : ""),
    name: "lennhetboek.nl"
  });
}

function tabblad() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var blad = ss.getSheetByName(TABBLAD);
  if (!blad) {
    blad = ss.insertSheet(TABBLAD);
    blad.appendRow(KOLOMMEN);
    blad.setFrozenRows(1);
    blad.getRange(1, 1, 1, KOLOMMEN.length).setFontWeight("bold");
  }
  return blad;
}

// Voorkomt dat ingevulde tekst als formule wordt uitgevoerd (bijv. "=HYPERLINK(...)")
function schoon(waarde) {
  var s = String(waarde || "").trim().slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function antwoord(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Voer deze functie één keer handmatig uit in de editor om toestemming te geven
// voor Gmail en Sheets, en om het tabblad aan te maken.
function instellen() {
  tabblad();
  Logger.log("Klaar. Inschrijvingen komen in tabblad '" + TABBLAD + "'.");
}
