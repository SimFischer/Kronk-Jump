# Kronk springt!

Ein einfaches Lern-Jump-Spiel mit dem Schulmaskottchen Kronk. Reines HTML, CSS und JavaScript, ohne Installation, Benutzerkonten, Tracking, externe Schriftarten oder kostenpflichtige Dienste. Die drei bereitgestellten PNG-Bilder werden unverändert verwendet.

## Auf GitHub veröffentlichen

1. ZIP entpacken und ein GitHub-Repository anlegen.
2. Den **Inhalt** dieses Ordners hochladen: `index.html` muss direkt im Hauptverzeichnis des Repositorys liegen. Den Ordner `assets` mit allen Bildern ebenfalls hochladen.
3. GitHub Pages für den Hauptbranch (`main`) und den Ordner `/ (root)` aktivieren. Die genaue Menüführung kann sich ändern; die Pages-Einstellungen befinden sich in den Repository-Einstellungen.
4. Nach der Veröffentlichung die von GitHub angezeigte Seitenadresse auf dem iPad in Safari öffnen. Nicht die GitHub-Dateiansicht von `index.html` verwenden.

Es ist kein Build-Schritt erforderlich. Auf dem Computer lässt sich `index.html` auch direkt öffnen. Auf dem iPad den veröffentlichten Weblink verwenden. Optional in Safari über Teilen zum Home-Bildschirm hinzufügen. Kein Offline-App-/Service-Worker-Modus implementiert.

## Spielen

Kronk springt automatisch. Links-/Rechts-Taste auf dem Bildschirm gedrückt halten; alternativ Pfeiltasten am Computer. Der rote Marker unter Kronk zeigt die für die Kollision maßgebliche Fußposition an. Richtige Antworten bringen jeweils 100 Punkte und den nächsten Sprung. Falsche Plattformen brechen weg; auch das Verfehlen der Plattform beendet den Versuch. Danach werden richtige Antworten bzw. die Erklärung angezeigt.

Oben am Sprung gibt es eine einstellbare Denkpause (1, 2, 4 oder 6 Sekunden). Währenddessen kann Kronk weiterhin seitlich bewegt werden. Nach allen Aufgaben endet die Runde erfolgreich. Pause über den Knopf oder P. Beim Verlassen des Browserfensters pausiert das Spiel automatisch.

## Aufgaben ändern: nur `aufgaben.js`

Die Beispielsammlung durch eigene Fragen ersetzen. Syntax (Anführungszeichen, Kommas und Klammern) beibehalten:

```javascript
window.KRONK_INHALTE = {
  titel: "Englisch · Klasse 5",
  mischen: true,
  fragen: [
    {
      frage: "Was bedeutet ›school‹?",
      antworten: [
        { text: "Schule", richtig: true },
        { text: "Haus", richtig: false },
        { text: "Garten", richtig: false }
      ],
      erklaerung: "School bedeutet Schule."
    }
  ]
};
```

- Pro Aufgabe 2–4 Antworten. Mindestens eine richtige Antwort, mehrere sind erlaubt.
- `mischen: true` mischt die Fragen; `false` erhält ihre Reihenfolge. Antwortpositionen werden immer gemischt.
- `erklaerung` ist optional. Ohne Erklärung zeigt das Spiel nach einem Fehler alle richtigen Antworten.
- Kurze Wörter oder Wortgruppen eignen sich am besten. Lange Antworten werden umgebrochen, können aber zu viel Platz beanspruchen. Für lange Sätze besser nur zwei Plattformen verwenden.
- Für einen anderen Kurs diese Datei austauschen oder eine Kopie des gesamten Repositorys nutzen.
- Änderungen speichern/committen und die veröffentlichte Seite neu laden.

## Dateien und Anpassung

- `index.html`: Oberfläche und Startbildschirm.
- `style.css`: Farben, Touchflächen und responsive Anordnung.
- `aufgaben.js`: Unterrichtsinhalte.
- `spiel.js`: Physik, Darstellung, Steuerung, Kollisionsprüfung und Zustände.
- `assets/`: Drei Originalbilder von Kronk (Normal, Jubel, Sprung).

Physikwerte stehen am Anfang von `spiel.js`: `GAP` (Höhenabstand), `GRAVITY` (Schwerkraft), `JUMP` (Sprungimpuls), `SPEED` (Seitwärtsgeschwindigkeit). Bei Änderungen muss die erreichbare Sprunghöhe `JUMP² / (2 × GRAVITY)` größer als `GAP` bleiben. Auch ausreichend Zeit zum seitlichen Wechsel erhalten.

## Technischer Stand und Grenzen

Grundgerüst mit festen Physikschritten (120/s), Touch-Pointer-Events, automatischer Pause, lokal geladenen Bildern und Inhaltsschema-Prüfung. Kein Backend, kein gespeicherter Lernstand, keine Bestenliste. Canvas-Spiel: keine vollständig gleichwertige Screenreader-Spielweise. Schmale oder flache Displays können Scrollen benötigen; auf dem iPad vorzugsweise Hochformat. JavaScript und die zentralen Spielzustände werden automatisiert geprüft; ein Praxistest auf echter iPad-Hardware steht noch aus.

## Rechte

Die Kronk-Bilder wurden vom Auftraggeber bereitgestellt. Es wird keine freie Lizenz für das Maskottchen behauptet. Vor einer öffentlichen Veröffentlichung die Nutzungsrechte der Schule/des Rechteinhabers klären. Keine Schülerdaten erforderlich.
