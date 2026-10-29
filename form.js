(function () {
  var config = window.LENN_CONFIG || {};
  var prijs = config.prijs || 35;

  var form = document.getElementById("inschrijving");
  var aantal = document.getElementById("aantal");
  var totaal = document.getElementById("totaal");
  var status = document.getElementById("form-status");
  var bedankt = document.getElementById("bedankt");
  var knop = form.querySelector('button[type="submit"]');

  var foutmeldingen = {
    naam: "Vul je naam in.",
    email: "Vul een geldig e-mailadres in.",
    telefoon: "Vul een geldig telefoonnummer in.",
    straat: "Vul je straat en huisnummer in.",
    postcode: "Vul een geldige postcode in, bijvoorbeeld 1234 AB.",
    woonplaats: "Vul je woonplaats in.",
    aantal: "Kies een aantal tussen 1 en 50."
  };

  function euro(bedrag) {
    return "€" + bedrag.toLocaleString("nl-NL");
  }

  function aantalWaarde() {
    var n = parseInt(aantal.value, 10);
    return isNaN(n) ? 0 : n;
  }

  function werkTotaalBij() {
    var n = aantalWaarde();
    totaal.textContent = n > 0 ? euro(n * prijs) : "—";
    totaal.classList.remove("tik");
    void totaal.offsetWidth;
    totaal.classList.add("tik");
  }

  form.querySelectorAll(".qty button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var n = aantalWaarde() + parseInt(btn.dataset.step, 10);
      aantal.value = Math.min(50, Math.max(1, n));
      werkTotaalBij();
    });
  });
  aantal.addEventListener("input", werkTotaalBij);
  werkTotaalBij();

  function toonFout(veld, tekst) {
    veld.classList.add("invalid");
    veld.setAttribute("aria-invalid", "true");
    var melding = document.createElement("span");
    melding.className = "field-error";
    melding.id = veld.id + "-fout";
    melding.textContent = tekst;
    veld.setAttribute("aria-describedby", melding.id);
    veld.closest(".field").appendChild(melding);
  }

  function wisFouten() {
    form.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
    form.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    });
  }

  function controleer() {
    wisFouten();
    var eersteFout = null;
    Object.keys(foutmeldingen).forEach(function (naam) {
      var veld = form.elements[naam];
      veld.value = veld.value.trim();
      if (!veld.checkValidity()) {
        toonFout(veld, foutmeldingen[naam]);
        eersteFout = eersteFout || veld;
      }
    });
    if (eersteFout) eersteFout.focus();
    return !eersteFout;
  }

  function zetStatus(tekst, fout) {
    status.textContent = tekst;
    status.classList.toggle("error", !!fout);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    zetStatus("");
    if (!controleer()) return;

    if (!config.formulierUrl) {
      zetStatus("Dit is een voorbeeldversie: het formulier is nog niet gekoppeld.", true);
      return;
    }

    var gegevens = new URLSearchParams(new FormData(form));
    gegevens.set("postcode", form.elements.postcode.value.toUpperCase().replace(/\s+/g, " "));

    knop.disabled = true;
    knop.textContent = "Bezig met versturen…";

    fetch(config.formulierUrl, { method: "POST", body: gegevens })
      .then(function (res) { return res.json(); })
      .then(function (antwoord) {
        if (!antwoord.ok) throw new Error(antwoord.fout || "Onbekende fout");
        form.hidden = true;
        bedankt.hidden = false;
        bedankt.focus();
      })
      .catch(function () {
        zetStatus("Het versturen is niet gelukt. Probeer het over een paar minuten opnieuw.", true);
        knop.disabled = false;
        knop.textContent = "Ik schrijf me in";
      });
  });
})();
