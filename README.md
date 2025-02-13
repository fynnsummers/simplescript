# Code Executor

Eine webbasierte Umgebung zur Ausführung von benutzerdefinierten Skripten mit einfachen Befehlen, die grundlegende mathematische Ausdrücke, Kontrollstrukturen und Variablenmanipulation ermöglicht. Der Code wird in Echtzeit geparsed und ausgeführt, mit Ausgaben, die direkt im Browser angezeigt werden.

## Funktionen

- **Variablenmanipulation**: Setze, modifiziere und setze Variablen zurück.
- **Grundlegende mathematische Operationen**: Addition, Subtraktion, Multiplikation, Division, Modulus und Potenzoperationen.
- **Bedingte Anweisungen**: Führe Aktionen basierend auf Bedingungen aus.
- **Schleifen**: Wiederhole Aktionen eine bestimmte Anzahl von Malen.
- **Zeitgesteuerte Operationen**: Warte eine bestimmte Zeit oder erhöhe eine Variable in regelmäßigen Intervallen.
- **Fehlerbehebung**: Der Code wird hervorgehoben und strukturiert angezeigt, um den Nutzern zu helfen, das Skript zu verstehen.
- **Zufallszahlengenerierung**: Weist einer Variablen einen zufälligen Wert innerhalb eines angegebenen Bereichs zu.

## Unterstützte Befehle

### Variablen und Zuweisungen
- **`set <variable> <wert>`**: Setzt den Wert einer Variablen.
- **`<variable> = <ausdruck>`**: Weist das Ergebnis eines Ausdrucks einer Variablen zu.
- **`add <variable> <wert>`**: Addiert einen Wert zu einer Variablen.
- **`subtract <variable> <wert>`**: Subtrahiert einen Wert von einer Variablen.
- **`multiply <variable> <wert>`**: Multipliziert eine Variablen mit einem Wert.
- **`divide <variable> <wert>`**: Dividiert eine Variablen durch einen Wert.
- **`mod <variable> <wert>`**: Führt eine Modulo-Operation auf einer Variablen aus.
- **`power <variable> <wert>`**: Erhöht eine Variablen auf eine Potenz.

### Kontrollstrukturen
- **`if <bedingung> then <aktion>`**: Führt eine Aktion aus, wenn die Bedingung wahr ist.
- **`repeat <anzahl>`**: Wiederholt die folgende Zeile eine angegebene Anzahl von Malen.
- **`increase_every <intervall> <wert> <variable>`**: Erhöht eine Variable in regelmäßigen Intervallen.
- **`wait <zeit>`**: Wartet für eine angegebene Anzahl an Sekunden.
- **`wait_min <zeit>`**: Wartet für eine angegebene Anzahl an Minuten.
- **`stop`**: Stoppt die Ausführung von zeitgesteuerten Operationen.

### Besondere Operationen
- **`random <variable> <min> <max>`**: Weist einer Variablen eine Zufallszahl innerhalb eines angegebenen Bereichs zu.
- **`reset <variable>`**: Setzt den Wert einer Variablen auf 0 zurück.
- **`print <text>`**: Gibt den angegebenen Text in der Ausgabe aus.

## Nutzung

1. Kopiere deinen Code in den Editor auf der Webseite.
2. Klicke auf „Run“, um den Code auszuführen.
3. Die Ausgabe wird unter dem Editor angezeigt.
4. Alle Fehler oder Probleme im Code werden hervorgehoben, um die Fehlerbehebung zu erleichtern.

## Einrichtung

Um diesen Code lokal auszuführen, folge diesen Schritten:

1. **Repository klonen**:
    ```bash
    git clone https://github.com/fynnsummers/simplescript.git
    ```

2. **`index.html`** im Webbrowser öffnen, um die Code-Ausführungsumgebung zu nutzen.

### Erforderliche Dateien
- **`index.html`**: Die HTML-Datei, um den Editor und die Ausgabeoberfläche zu laden.
- **`script.js`**: Enthält die Logik zur Codeausführung (dieses Skript).

## Fehlerbehebung

- **Probleme mit der Ausgabedarstellung**: Wenn die Ausgabe nicht korrekt angezeigt wird, überprüfe die Entwicklerkonsole auf JavaScript-Fehler.
- **Befehl funktioniert nicht**: Stelle sicher, dass die Syntax der Befehle korrekt ist und dass Variablen richtig gesetzt und referenziert werden.

---
