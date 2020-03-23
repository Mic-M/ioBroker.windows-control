/*global systemDictionary:true */
'use strict';

systemDictionary = {
    'Windows Control adapter settings': {
        'en': 'Adapter settings for Windows Control',
        'de': 'Adaptereinstellungen für Windows Control',
        'ru': 'Настройки адаптера для Windows Control',
        'pt': 'Configurações do adaptador para Windows Control',
        'nl': 'Adapterinstellingen voor Windows Control',
        'fr': "Paramètres d'adaptateur pour Windows Control",
        'it': "Impostazioni dell'adattatore per Windows Control",
        'es': 'Ajustes del adaptador para Windows Control',
        'pl': 'Ustawienia adaptera dla Windows Control',
        'zh-cn': 'Windows Control的适配器设置'
    },
    'Adapter: Windows Control': {
        'en': 'Adapter: Windows Control',
        'de': 'Adapter: Windows Control',
    },
    'To use this adapter, the tool GetAdmin is required. Download and setup instructions: see <a href="https://github.com/Mic-M/ioBroker.windows-control/blob/master/README.md" target="_blank">Adapter documentation on Github.</a>': {
        'en': 'To use this adapter, the tool GetAdmin is required. Download and setup instructions: see <a href="https://github.com/Mic-M/ioBroker.windows-control/blob/master/README.md" target="_blank">Adapter documentation on Github.</a>',
        'de': 'Für diesen Adapter ist das Tool <strong>GetAdmin</strong> erforderlich. Zum Download und zur Einrichtung: siehe die <a href="https://github.com/Mic-M/ioBroker.windows-control/blob/master/README.md" target="_blank">Adapter-Dokumentation auf Github.</a>',
    },
    'Your own GetAdmin Commands': {
        'en': 'Your own GetAdmin Commands',
        'de': 'Deine eigenen GetAdmin-Commands',
    },
    'Enter your own commands, which you entered in the GetAdmin software in column "Command". No spaces please. Separate multiple values with comma.<br>Leave this field empty, if you have not (yet) defined any commands.': {
        'en': 'Enter your own commands, which you entered in the GetAdmin software in column "Command". No spaces please. Separate multiple values with comma.<br>Leave this field empty, if you have not (yet) defined any commands.',
        'de': 'Hier die Commands eintragen, die du in der GetAdmin-Software in der Spalte "Commands" definiert hast. Diese Commands bitte ohne Leerzeichen. Mehrere Werte mit Komma trennen.<br>Falls du (noch) keine eigenen Commands definiert hast, lässt du das einfach leer.',
    },
    'GetAdmin Commands (comma separated)': {
        'en': 'GetAdmin Commands (comma separated)',
        'de': 'GetAdmin-Commands (mit Komma trennen)',
    },
    'Update Interval': {
        'en': 'Update Interval',
        'de': 'Aktualisierungs-Intervall',
    },	
    'If activated, a state ".connected" is being created for each device. These states will be updated every number of seconds as set in the below field and will indicate if the device is connected. 0 disables this function.': {
        'en': 'If activated, a state ".connected" is being created for each device. These states will be updated every number of seconds as set in the below field and will indicate if the device is connected. 0 deactivates this function.',
        'de': 'Falls aktiviert, wird zu jedem Gerät ein Datenpunkt ".connected" angelegt. Dieser wird innerhalb der angegebenen Sekunden aktualisiert und zeigt dann jeweils an, ob das Windows-Gerät erreichbar ist. Die Angabe von 0 deaktiviert die automatischen Aktualisierungen.<br><strong>Achtung: </strong> Werte kleiner als 60-120 Sekunden sind i.d.R. nicht notwendig, und etwa alle 10 Minuten (=600s) reicht oftmals.',
    },	
    's (0 = disabled)': {
        'en': 's (0 = disabled)',
        'de': 's (0 = deaktiviert)',
    },	
	
    'Windows devices you want to control': {
        'en': 'Windows devices you want to control',
        'de': 'Zu steuernde Windows-Geräte',
    },
    'Add your Windows devices, which you want to control. On each of these devices, the software "Get Admin" must be installed. "Device Name" will be used as part of the states. You can also (temporarily) de-activate devices if you want.': {
        'en': 'Add your Windows devices, which you want to control. On each of these devices, the software "Get Admin" must be installed. "Device Name" will be used as part of the states. You can also (temporarily) de-activate devices if you want.',
        'de': 'Hier fügst du deine Windows-Geräte hinzu, die du steuern möchtest. Auf jedem dieser Windows-Geräte muss die Software "GetAdmin" eingerichtet sein. "Name des Gerätes" wird dabei als Teil der Datenpunkte verwendet. Du kannst auch vorübergehend Geräte auf Wunsch deaktivieren.',
    },
    'Device Name': {
        'en': 'Device Name',
        'de': 'Name des Gerätes',
    },
    'Device IP Address': {
        'en': 'Device IP Address',
        'de': 'IP-Adresse des Gerätes',
    },
    'Port': {
        'en': 'Port',
        'de': 'Port',
    },
    'Active?': {
        'en': 'Active?',
        'de': 'Aktiviert?',
    },    
};