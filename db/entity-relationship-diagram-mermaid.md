```mermaid
erDiagram
Nutzer }|..|{ Nutzer : leitet
Nutzer }|--|{ Kategorien : zugeordnet
Kategorien }|--|| Kategorieebene : zugeordnet
Rueckmeldungen }|--|| Nutzer : bearbeitet
Rueckmeldungen ||--|{ Kategorien : zugeordnet
```
