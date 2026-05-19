# Security Policy

[🇮🇹 Italiano](#italiano) · [🇬🇧 English](#english)

---

## Italiano

### Versioni supportate

Riceve patch di sicurezza solo l'ultima versione minore rilasciata sul branch `master`.

| Versione | Supportata |
|---|---|
| 1.0.x   | ✅ |
| < 1.0   | ❌ |

### Come segnalare una vulnerabilità

**Non aprire una issue pubblica** per problemi di sicurezza: la descrizione del problema sarebbe immediatamente visibile a chiunque.

Sono disponibili due canali privati:

1. **GitHub Private Security Advisory** (preferito) — dalla tab **Security** del repository, clicca su *"Report a vulnerability"*. Solo i maintainer e te potranno vedere la segnalazione finché non viene risolta e divulgata.
2. **Email** — scrivi a entrambi gli indirizzi:
   - Marco Negroni (proprietario dell'organizzazione Brera-Digital-Humanities) — `marconegroni@fadbrera.edu.it`
   - Loretta Borrelli (manutentrice del codice) — `lorettaborrelli@fadbrera.edu.it`

### Cosa includere nella segnalazione

- Descrizione del problema e tipologia (XSS, SQL injection, CSRF, escalation di privilegi, deserialization, ecc.)
- Versione del tema, di WordPress e dei plugin coinvolti (ACF, ACF Extended, Polylang)
- Passi riproducibili o proof-of-concept
- Eventuale impatto stimato (chi è esposto, in quali condizioni)
- Suggerimenti di mitigazione, se ne hai

### Tempi di risposta

- **Conferma di ricezione**: entro 5 giorni lavorativi
- **Valutazione iniziale e classificazione**: entro 15 giorni lavorativi
- **Patch o piano di mitigazione**: comunicato appena disponibile, tipicamente entro 30-60 giorni a seconda della gravità

I tempi sono indicativi: trattandosi di un progetto accademico con risorse limitate, segnalazioni critiche vengono prioritizzate ma può servire più tempo per quelle minori. Verrai tenuto/a aggiornato/a sullo stato.

### Divulgazione coordinata

Chiediamo di non divulgare pubblicamente il problema finché:
- non è stata rilasciata una versione patchata, **oppure**
- sono passati 90 giorni dalla segnalazione iniziale senza risposta da parte nostra (in tal caso sei libero/a di pubblicare).

Eventuali ringraziamenti pubblici nei changelog di release sono concordati con il segnalatore.

### Cosa non rientra in questa policy

- Vulnerabilità nel **core di WordPress** → vanno segnalate a https://wordpress.org/about/security/
- Vulnerabilità in **plugin di terze parti** (ACF, ACF Extended, Polylang, Leaflet, ecc.) → vanno segnalate ai rispettivi maintainer
- Problemi di configurazione **del singolo sito** che usa questo tema → spetta all'amministratore del sito

---

## English

### Supported versions

Security patches are provided only for the latest minor release on the `master` branch.

| Version | Supported |
|---|---|
| 1.0.x   | ✅ |
| < 1.0   | ❌ |

### How to report a vulnerability

**Do not open a public issue** for security problems: the description would be immediately visible to anyone.

Two private channels are available:

1. **GitHub Private Security Advisory** (preferred) — from the **Security** tab of the repository, click *"Report a vulnerability"*. Only the maintainers and you will be able to see the report until it is resolved and disclosed.
2. **Email** — write to both addresses:
   - Marco Negroni (owner of the Brera-Digital-Humanities organization) — `marconegroni@fadbrera.edu.it`
   - Loretta Borrelli (code maintainer) — `lorettaborrelli@fadbrera.edu.it`

### What to include in the report

- Description of the issue and category (XSS, SQL injection, CSRF, privilege escalation, deserialization, etc.)
- Theme, WordPress and plugin versions involved (ACF, ACF Extended, Polylang)
- Reproducible steps or proof-of-concept
- Estimated impact (who is exposed, under what conditions)
- Mitigation suggestions, if you have any

### Response timeline

- **Acknowledgement of receipt**: within 5 business days
- **Initial assessment and classification**: within 15 business days
- **Patch or mitigation plan**: communicated as soon as available, typically within 30–60 days depending on severity

Timelines are indicative: since this is an academic project with limited resources, critical reports are prioritized but minor ones may take longer. You will be kept up to date on the status.

### Coordinated disclosure

We ask you not to disclose the issue publicly until:
- a patched version has been released, **or**
- 90 days have passed since the initial report with no response from us (in which case you are free to publish).

Any public credit in release changelogs is agreed with the reporter.

### What is out of scope for this policy

- Vulnerabilities in **WordPress core** → report to https://wordpress.org/about/security/
- Vulnerabilities in **third-party plugins** (ACF, ACF Extended, Polylang, Leaflet, etc.) → report to their respective maintainers
- Configuration issues on **individual sites** using this theme → the site administrator's responsibility
