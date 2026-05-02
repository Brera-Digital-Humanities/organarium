# Repertorio dell'Organo antico

Child theme WordPress di **Twenty Twenty-Five** per la catalogazione e presentazione del repertorio musicale dell'organo antico. Il tema integra due blocchi Gutenberg custom che utilizzano la **WordPress Interactivity API** per offrire esperienze interattive senza dipendenze JavaScript esterne.

---

## Requisiti

- WordPress 6.5+
- Parent theme: **Twenty Twenty-Five**
- Plugin: **Advanced Custom Fields (ACF)**
- Node.js 18+ e npm (per la compilazione)

---

## Struttura del progetto

```
jerus-organo/
├── src/
│   ├── featured-zoom/     # Blocco zoom immagine in evidenza
│   └── timeline/          # Blocco timeline/griglia post
├── build/                 # File compilati (generati da wp-scripts)
├── functions.php          # Registrazione blocchi e shortcode ACF
├── style.css              # Header child theme
└── package.json
```

---

## Build

**Prerequisito:** il progetto richiede Node.js 20. Attivare la versione corretta con nvm prima di qualsiasi altro comando:

```bash
nvm use 20
```

Installare le dipendenze e compilare:

```bash
npm install
npm run build      # build di produzione
npm run start      # watch mode per lo sviluppo
```

Il flag `--experimental-modules` abilita i moduli ES6; `--blocks-manifest` genera automaticamente `build/blocks-manifest.php`.

> I file nella cartella `build/` sono il risultato della compilazione e non vanno modificati a mano: le sorgenti si trovano in `src/`.

---

## Blocchi custom

### 1. Featured Image Zoom (`ttf-child/featured-zoom`)

Visualizza la **featured image** del post con controlli di zoom e trascinamento gestiti interamente tramite la WordPress Interactivity API.

**Funzionalità:**
- Zoom in/out con pulsanti (+/−) sovrapposti all'immagine
- Trascinamento dell'immagine ingrandita (drag) con calcolo dei limiti sulla viewport
- Transizioni CSS fluide tramite `transform: translate3d` + `scale`
- Cursore contestuale (`grab` / `grabbing`)
- Didascalia opzionale tramite campo ACF `didascalia_foto_in_primo_piano`

**Interactivity API — store `featured-zoom`:**

| Elemento | Descrizione |
|---|---|
| context `scale` | Livello di zoom corrente (default 1) |
| context `translateX/Y` | Offset di trascinamento |
| context `isDragging` | Stato drag in corso |
| action `zoomIn/zoomOut` | Incremento/decremento scala di 0.5 |
| action `startDrag/drag/stopDrag` | Gestione trascinamento con limiti |
| callback `imageStyle` | Binding dello stile transform sull'`<img>` |
| callback `containerStyle` | Binding del cursore sul container |

**Supporto editor:**
Nel Site Editor il blocco mostra un segnaposto; l'interattività è disponibile solo nel frontend.

---

### 2. Timeline 3D (`ttf-child/timeline`)

Presenta i post in **due modalità di visualizzazione** selezionabili dall'utente: un carousel 3D con effetto prospettico e una griglia CSS. Supporta filtri multipli basati su campi ACF e ordinamento per data.

**Funzionalità:**

*Vista Timeline*
- Carousel 3D con prospettiva CSS (`perspective: 500vw`) e fino a 5 card visibili simultaneamente (attiva, prev/next, prev2/next2)
- Navigazione con pulsanti freccia e tastiera (←/→)
- Scrubber timeline trascinabile (desktop) con marker per ogni post e label con l'anno

*Vista Griglia*
- CSS Grid responsive (`auto-fill`, colonne da 360 px min)
- Ordine dinamico delle card basato sull'indice calcolato lato client

*Filtri*
- Pannello filtri a scomparsa con pill selezionabili per:
  - **Categoria** (campo ACF `categorie_generali`)
  - **Materiale** (campo ACF `materiale`)
  - **Tecnica** (campo ACF `tecnica`)
- Badge filtri attivi con rimozione singola o globale
- Indicatore contatore post visibili

*Ordinamento*
- Toggle ascendente/discendente con animazione FLIP basata su `sort_key` (campo ACF `data_per_la_timeline`)

**Attributi del blocco (configurabili dal Site Editor):**

| Attributo | Valori | Descrizione |
|---|---|---|
| `postSource` | `all` / `current_category` | Sorgente post da mostrare |
| `allowedViews` | `both` / `timeline` / `grid` | Viste disponibili per l'utente |

**Interactivity API — store `timeline-3d`:**

| Elemento | Descrizione |
|---|---|
| state `visiblePosts` | Post filtrati e ordinati |
| state `isViewTimeline/isViewGrid` | Modalità di vista attiva |
| state `filtersOpen` | Apertura pannello filtri |
| state `cardOffset/isActive/isPrev/isNext...` | Posizione card nel carousel |
| state `markerLeft/scrubberThumbLeft` | Posizionamento scrubber |
| action `toggleFilters/clearFilters/togglePill` | Gestione filtri |
| action `setViewTimeline/setViewGrid` | Cambio vista |
| action `toggleSort` | Inversione ordinamento con FLIP |
| action `next/prev` | Navigazione carousel |
| action `scrubberPointerDown/Move` | Drag scrubber |
| action `goToMarker` | Navigazione diretta da marker |
| callback `init` | Setup navigazione da tastiera |

---

## Shortcode ACF

Registrati in `functions.php` per visualizzare i campi ACF nelle template:

| Shortcode | Campo ACF | Tipo |
|---|---|---|
| `[acf_data]` | `data` | Testo |
| `[acf_ubicazione]` | `ubicazione` | Testo |
| `[acf_autore]` | `autore` | Testo |
| `[acf_tecnica]` | `tecnica_e_materiali` | Testo |
| `[acf_dimensioni]` | `dimensioni` | Testo |
| `[acf_provenienza]` | `provenienza` | Rich text (WYSIWYG) |
| `[acf_fonti]` | `fonti` | Link |

---

## Tecnologie

- **WordPress Interactivity API** (`@wordpress/interactivity`) — stato reattivo e binding dichiarativo senza framework JS
- **wp-scripts 32** — build toolchain (Webpack, SCSS, ESM modules)
- **CSS 3D transforms** — effetto prospettico del carousel timeline
- **Advanced Custom Fields** — metadati estesi dei post
