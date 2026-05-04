# Repertorio dell'Organo antico

Child theme WordPress di **Twenty Twenty-Five** per la catalogazione e presentazione del repertorio musicale dell'organo antico. Il tema integra tre blocchi Gutenberg custom: i primi due utilizzano la **WordPress Interactivity API**, il terzo integra **Leaflet.js** per la visualizzazione cartografica interattiva.

---

## Requisiti

- WordPress 6.5+
- Parent theme: **Twenty Twenty-Five**
- Plugin: **Advanced Custom Fields (ACF)** + **ACF Extended** (per il campo Open Street Map)
- Node.js 18+ e npm (per la compilazione)

---

## Struttura del progetto

```
jerus-organo/
├── src/
│   ├── featured-zoom/        # Blocco zoom immagine in evidenza
│   ├── timeline/             # Blocco timeline/griglia post
│   └── mappa-interattiva/    # Blocco mappa Leaflet con pin geolocalizzati
├── build/                    # File compilati (generati da wp-scripts)
├── functions.php             # Registrazione blocchi e shortcode ACF
├── style.css                 # Header child theme
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

### 3. Mappa Interattiva (`ttf-child/mappa-interattiva`)

Visualizza una **mappa Leaflet.js** con pin geolocalizzati per ogni articolo che ha il campo ACF `posizione_per_mappa` compilato. I pin aprono una popup con thumbnail, ubicazione e titolo linkato. Il filtro colore del layer tile è scelto dal redattore nel pannello del Site Editor; l'utente frontend non può cambiarlo.

**Funzionalità:**

- Pin SVG circolari (28×28 px: cerchio con punto centrale) con colori fissi indipendenti dalla categoria
- **Raggruppamento coordinate**: più articoli con le stesse coordinate condividono un unico marker; la popup mostra tutte le card in sequenza separate da un divisore orizzontale
- Popup card con thumbnail, campo `ubicazione` e titolo linkato (colore `accent-3 #6b2a0b`)
- Sidebar filtri sempre visibile (350 px) con pill per **Categoria**, **Materiale** e **Tecnica** — stessa logica della timeline (pill disabilitate per combinazioni non disponibili, badge filtri attivi con rimozione singola o globale)
- Viewport automatico: `fitBounds` sui marker filtrati o vista sull'Italia intera se non ci sono dati
- 4 stili CartoDB con CSS filter applicato al tile pane: `natural`, `warm`, `teal`, `dark`

**Stili mappa disponibili:**

| Chiave | Nome | Tile base | Filtro CSS |
|---|---|---|---|
| `natural` | Chiaro naturale | CartoDB light | sepia(25%) saturate(0.9) brightness(1.02) hue-rotate(5deg) |
| `warm` | Caldo bruciato | CartoDB light | sepia(45%) saturate(1.1) brightness(0.98) hue-rotate(-5deg) |
| `teal` | Freddo teal | CartoDB light | sepia(10%) saturate(0.8) brightness(1.03) hue-rotate(140deg) |
| `dark` | Scuro terroso | CartoDB dark | sepia(35%) saturate(0.7) brightness(0.85) hue-rotate(5deg) |

**Attributi del blocco (configurabili dal Site Editor):**

| Attributo | Valori | Descrizione |
|---|---|---|
| `postSource` | `all` / `current_category` / `fixed_category` | Sorgente post da mostrare |
| `selectedCategory` | ID categoria | Categoria fissa (se `fixed_category`) |
| `mapHeight` | 300–900 px | Altezza del canvas mappa |
| `mapStyle` | `natural` / `warm` / `teal` / `dark` | Stile cromatico del layer tile |

**Campi ACF richiesti:**

| Campo | Tipo | Uso |
|---|---|---|
| `posizione_per_mappa` | Open Street Map (ACF Extended) | Coordinate del marker — letto con `get_post_meta()` per ottenere i dati grezzi anziché l'HTML del widget |
| `ubicazione` | Testo | Mostrato nella popup al posto della data |
| `categorie_generali` | Select | Filtro Categoria |
| `materiale` | Select multipla | Filtro Materiale |
| `tecniche` | Select multipla | Filtro Tecnica |

**Architettura:**
- Leaflet.js (v1.9.4) è **bundlato** direttamente in `view.js` tramite npm/webpack — nessuna dipendenza CDN per il JS
- Il CSS di Leaflet è incluso in `style-index.css` via `@import url()` (CDN jsDelivr)
- Nessuna dipendenza dalla WordPress Interactivity API: i filtri e la mappa sono gestiti da Leaflet e vanilla JS
- Il campo `posizione_per_mappa` è letto con `get_post_meta()` (non `get_field()`) perché ACF Extended con `return_format: leaflet` restituisce HTML anziché i dati grezzi delle coordinate

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

- **WordPress Interactivity API** (`@wordpress/interactivity`) — stato reattivo e binding dichiarativo (blocchi featured-zoom e timeline)
- **Leaflet.js 1.9.4** — mappa interattiva con pin, popup e layer tile (blocco mappa-interattiva, bundlato via npm)
- **wp-scripts 32** — build toolchain (Webpack, SCSS, ESM modules, `--experimental-modules`)
- **CSS 3D transforms** — effetto prospettico del carousel timeline
- **Advanced Custom Fields + ACF Extended** — metadati estesi dei post (incluso campo Open Street Map)
