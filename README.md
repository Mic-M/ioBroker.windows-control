![Logo](admin/windows-control_90.png)
# ioBroker.windows-control

[![NPM version](http://img.shields.io/npm/v/iobroker.windows-control.svg)](https://www.npmjs.com/package/iobroker.windows-control)
[![Downloads](https://img.shields.io/npm/dm/iobroker.windows-control.svg)](https://www.npmjs.com/package/iobroker.windows-control)
![Number of Installations (latest)](http://iobroker.live/badges/windows-control-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/windows-control-stable.svg)
[![Dependency Status](https://img.shields.io/david/Mic-M/iobroker.windows-control.svg)](https://david-dm.org/Mic-M/iobroker.windows-control)
[![Known Vulnerabilities](https://snyk.io/test/github/Mic-M/ioBroker.windows-control/badge.svg)](https://snyk.io/test/github/Mic-M/ioBroker.windows-control)

[![NPM](https://nodei.co/npm/iobroker.windows-control.png?downloads=true)](https://nodei.co/npm/iobroker.windows-control/)

**Tests:** [![Travis-CI](http://img.shields.io/travis/Mic-M/ioBroker.windows-control/master.svg)](https://travis-ci.org/Mic-M/ioBroker.windows-control)

## Adapter to control Windows devices

This adapter provides controlling Microsoft Windows devices. It is requried the tool GetAdmin being installed on every Windows device which you want to control.
<br>
<strong>Many thanks to [Vladimir Vilisov](https://blog.instalator.ru) for his tool GetAdmin!</strong> 

## NOTE: THIS ADAPTER IS FOR TESTING ONLY

Please note that this adapter is for testing only at this time. Some text is still in German here, and will be translated later.

## Tool GetAdmin
Für diesen Adapter benötigt ihr GetAdmin auf jedem Windows-Rechner, den ihr mit ioBroker steuern möchtet. GetAdmin ist eine einzelne 776 kB große (bzw. kleine) exe-Datei, die von Vladimir Vilisov in Delphi geschrieben und er [auf seinem Blog instalator.ru](https://blog.instalator.ru/archives/47) veröffentlicht hat.
Download:
 1. Primäre Quelle: https://blog.instalator.ru/archives/47
 2. Falls nicht (mehr) verfügbar, ist eine Kopie hier auf Github unter "files" abgelegt.

### Einrichtung
Die `GetAdmin.exe` in einem beliebigen Verzeichnis speichern und ausführen. Dann folgendes einstellen:
1. Ganz oben links unter "Server":
    * IP: die IP-Adresse der ioBrokers eintragen
    * Port: Den Standard-Port 8585 kann man so lassen
2. Oben unter "Options" Haken bei Minimize und Startup setzen, damit sich GetAdmin bei jedem Neustart minimiert ausgeführt wird.
3. Mit "Save" bestätigen.

 ### Beispiele für individuelle Einträge in GetAdmin Command list:
* Ruhezustand: 
    * in Spalte `Command` z.B. `m_hibernate` eintragen
    * in Spalte `PATH or URL` eintragen: `shutdown`
    * in Spalte `PARAMETERS` eintragen: `-h`
* Energie sparen:
    * in Spalte `Command` z.B. `m_sleep` eintragen
    * in Spalte `PATH or URL` eintragen: `rundll32.exe`
    * in Spalte `PARAMETERS` eintragen: `powrprof.dll,SetSuspendState`

Weitere mögliche Parameter am besten googlen ;)


### Weitere Infos zu GetAdmin und den Einstellungen
* ioBroker Forum-Thread [Windows-Steuerung (GetAdmin)](https://forum.iobroker.net/topic/1570/windows-steuerung)
* Der [Blogartikel](https://blog.instalator.ru/archives/47) der GetAdmin-Veröffentlichung. Ist in russisch, ggf. mit Google Translate oder ähnlichem arbeiten.


### ioBroker-Adaper-Einstellungen

Mein Anspruch ist, dass diese selbsterklärend sind. Ich werde die Beschreiben noch erweitern. Bei Fragen, Anregungen, Verbesserungsvorschläge: sehr gerne bitte im ioBroker-Forum.


## Changelog

### 0.1.0
* (Mic-M) Add states "_processGetStatus" and "_processGetStatusResult" to check if a Windows process (like Chrome browser) is running or not

### 0.0.3
* (Mic-M) Fix `io-package.json` (removed one redundand comma, not sure why node.js is not able to autocorrect such minor issue)

### 0.0.2
* (Mic-M) Fixed sendkey issue
* (Mic-M) State _sendKey: provide all supported keys as dropdown and no longer as open text field.
* (Mic-M) Renamed states: sendKey -> _sendKey, connected -> _connection

### 0.0.1
* (Mic-M) Initial release

## License
MIT License

Copyright (c) 2020 Mic-M

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.