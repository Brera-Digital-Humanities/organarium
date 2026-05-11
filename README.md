# Repertorio dell'Organo antico

Child theme WordPress di **Twenty Twenty-Five** per la catalogazione e presentazione del repertorio musicale dell'organo antico. Il tema integra cinque blocchi Gutenberg custom: quattro interattivi basati sulla **WordPress Interactivity API** (`featured-zoom`, `timeline`, `post-list`, `mappa-interattiva` — quest'ultimo integra anche **Leaflet.js** per la visualizzazione cartografica) e uno dinamico server-side (`acf-field`) per la visualizzazione dei campi ACF nei template del singolo post.

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
│   ├── mappa-interattiva/    # Blocco mappa Leaflet con pin geolocalizzati
│   ├── post-list/            # Blocco lista post con infinite scroll e filtri ACF
│   ├── acf-field/            # Blocco generico per visualizzare un campo ACF
│   └── style/                # Stile globale del child theme (SCSS)
├── build/                    # File compilati (generati da wp-scripts, non versionati)
├── functions.php             # Registrazione blocchi, enqueue stili, custom excerpt length
├── style.css                 # Header child theme (regole in src/style/)
├── webpack.config.js         # Estende wp-scripts per aggiungere l'entry SCSS globale
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

Il file `webpack.config.js` estende la configurazione di default di `@wordpress/scripts` per aggiungere un'entry dedicata allo stile globale (`src/style/style.scss` → `build/style/style-style.css`) accanto a quelle dei blocchi. Con `--experimental-modules` la config di default è un array (scripts + modules): l'entry globale viene aggiunta alla config "scripts".

> I file nella cartella `build/` sono il risultato della compilazione e non vanno modificati a mano: le sorgenti si trovano in `src/`. **`build/` non è committata nel repository**: dopo `git clone` è obbligatorio eseguire `npm install && npm run build` prima di attivare il tema, altrimenti `register_block_type()` non trova i blocchi compilati e WordPress mostra un errore.

---

## Stile globale

Lo stile generale del child theme è scritto in **SCSS** e compilato da `wp-scripts` insieme ai blocchi.

**Struttura:**

```
src/style/
├── style.scss          # Entry point (importa i parziali con @use)
├── _variables.scss     # Alias delle CSS custom properties di TT5
├── _typography.scss
├── _layout.scss
└── _blocks.scss        # Override blocchi core e selettori globali
```

- L'entry `src/style/style.scss` viene compilato in `build/style/style-style.css` (la convenzione di `mini-css-extract-plugin` usata da wp-scripts produce `<entry>-style.css`).
- Il file alla radice `style.css` resta **solo** come header del child theme (richiesto da WordPress per riconoscere il tema). Tutte le regole sono migrate nei parziali SCSS.
- `functions.php` enqueua il foglio compilato come dipendente di `twentytwentyfive-style`, così le regole del child cascano dopo quelle del parent senza bisogno di `!important` superflui. La versione è derivata da `filemtime()` per cache busting automatico.

**Compatibilità con Twenty Twenty-Five:**

TT5 è un block theme: la fonte di verità del design system è `theme.json`, che espone i preset come CSS custom properties (`--wp--preset--color--*`, `--wp--preset--font-family--*`, `--wp--preset--spacing--*`). Per restare compatibile, `_variables.scss` **non ridefinisce** i valori ma li aliasa:

```scss
$color-accent-1: var(--wp--preset--color--accent-1);
$color-contrast: var(--wp--preset--color--contrast);
$font-baloo:     var(--wp--preset--font-family--baloo-2);
```

Così cambi alla palette o alla tipografia in `theme.json` (o nel Site Editor) si propagano automaticamente all'SCSS senza dover ricompilare. Stili specifici di blocchi core andrebbero preferibilmente messi in `theme.json` → `styles.blocks.*`; l'SCSS è riservato a selettori complessi, hover/transizioni e regole che il Site Editor non copre.

> Gli stili dei blocchi custom (`src/<block>/style.scss`) restano separati: wp-scripts li compila tramite il loro `block.json`.

---

## Modello dati ACF

Il tema dipende da un singolo gruppo di campi **DETTAGLIO SCHEDA** assegnato al post type `post`. Posizione `normal`, label sopra, `show_in_rest: 0`, nessun campo obbligatorio, nessuna logica condizionale. Questa sezione documenta la struttura del gruppo in modo da poterlo ricostruire manualmente da ACF → Field Groups.

**Campi del gruppo:**

| Nome (machine) | Tipo ACF | Label | Uso |
|---|---|---|---|
| `data`                          | text         | DATA VISUALIZZATA            | Data leggibile mostrata nelle card e nelle schede (es. "ca. 1450", "XII sec."). Decoupled da `data_per_la_timeline` per consentire stringhe descrittive |
| `ubicazione`                    | text         | UBICAZIONE                   | Luogo di conservazione attuale; visualizzato nelle card di lista, mappa e popup |
| `autore`                        | text         | AUTORE                       | Attribuzione, libera. Mostrato solo nella scheda dettaglio |
| `tecnica_e_materiali`           | text         | TECNICA E MATERIALI          | Descrizione testuale estesa (versione discorsiva, distinta dalle scelte controllate `materiale` / `tecniche`) |
| `dimensioni`                    | text         | DIMENSIONI                   | Misure libere |
| `provenienza`                   | wysiwyg      | PROVENIENZA                  | Storia delle collocazioni precedenti, rich text full toolbar |
| `trattato_completo`             | wysiwyg      | TRATTATO COMPLETO            | Trattazione discorsiva dell'opera, rich text |
| `edizione`                      | text         | EDIZIONE                     | Riferimento bibliografico breve |
| `fonti`                         | wysiwyg      | FONTI                        | Bibliografia / link, rich text. Visualizzato con bordo superiore come separatore |
| `data_per_la_timeline`          | number       | DATA NUMERICA PER LA TIMELINE| **Anno come intero**; valori negativi per a.C. (es. `-200`). Chiave di ordinamento per timeline e post-list e di posizionamento dei dot nella century bar |
| `posizione_per_mappa`           | open_street_map (ACF Extended) | POSIZIONE PER MAPPA | Coordinate del marker mappa. `return_format: "leaflet"`, `zoom: 12`, layer iniziale `OpenStreetMap.Mapnik`. Letto in PHP con `get_post_meta()` per ottenere i dati grezzi (vedi blocco mappa-interattiva) |
| `didascalia_foto_in_primo_piano`| wysiwyg      | DIDASCALIA FOTO IN PRIMO PIANO | Caption della featured image, mostrata dal blocco `featured-zoom` |
| `categorie_generali`            | radio        | CATEGORIE PER GENERALI       | Categoria tipologica (single-choice). Filtro nei blocchi timeline / post-list / mappa-interattiva. Vedi tabella sotto |
| `materiale`                     | checkbox     | MATERIALI                    | Materiali prevalenti (multi-choice). Filtro multiplo. Vedi tabella sotto |
| `tecniche`                      | radio        | TECNICHE                     | Tecnica esecutiva (single-choice, `allow_null: 1`). Filtro. Vedi tabella sotto |

### Scelte controllate

I tre campi a scelta usano `return_format: "value"`, quindi PHP riceve la chiave (la colonna sinistra). Le label sono risolte a runtime con `get_field_object()` e — per `categorie_generali`, dove la label include una descrizione tra parentesi — abbreviate con un helper PHP che tronca al primo `(`.

**`categorie_generali`** (radio, single-choice, layout verticale):

| Value | Label |
|---|---|
| `pittura`     | Pittura su Supporto Mobile *(opere mobili o parte dell'arredo dell'organo: olio, tempera, tela, tavola — pale d'altare, portelle)* |
| `monumentale` | Decorazione Murale e Architettonica *(parte integrante di un edificio: affresco, stucco, intonaco — organo nel suo contesto spaziale, angeli musicanti)* |
| `plastica`    | Arti Plastiche e Scultoree *(terracotta anche invetriata, marmo, pietra, bronzo — oggetti tridimensionali)* |
| `grafica`     | Grafica e Disegno su Carta *(incisione, sanguigna, matita, tecnica mista — disegni di studio e stampe di diffusione)* |
| `vitree`      | Arti Applicate e Decorative *(vetro, mosaico, intarsio — rese più stilizzate per il vincolo del materiale)* |

**`materiale`** (checkbox, multi-choice, layout verticale):

`tela`, `legno`, `intonaco`, `calce`, `pietra`, `terracotta`, `marmo`, `bronzo`, `carta`, `tessuto`, `vetro`, `piombo` — label = capitalizzazione del value.

**`tecniche`** (radio, single-choice, `allow_null: 1`):

`affresco`, `stucco`, `mosaico`, `scultura`, `modellato`, `bassorilievo`, `incisione`, `disegno`, `vetrata`, `miniatura`, `arazzo`, `pittura`, `intarsio` — label = capitalizzazione del value.

### Note di implementazione

- **`data_per_la_timeline`** deve essere intero. La timeline costruisce 17 segmenti di secolo nel range `[-200, 1600)` e posiziona i dot in proporzione al valore; valori fuori range sono ignorati. La post-list ordina con `usort` PHP su questo campo (più affidabile di `WP_Query` su meta numerico senza chiave registrata).
- **`posizione_per_mappa`** richiede **ACF Extended**: il tipo `open_street_map` non è nel core di ACF. `return_format: "leaflet"` fa sì che `get_field()` restituisca HTML del widget invece dei dati grezzi, perciò il blocco mappa-interattiva legge il campo con `get_post_meta()` per accedere a `lat`/`lng`.
- **WYSIWYG vs text**: `provenienza`, `trattato_completo`, `fonti`, `didascalia_foto_in_primo_piano` permettono HTML; il blocco `acf-field` li renderizza con `wp_kses_post`. Gli altri campi text vengono passati alla stessa funzione, sicura anche su testo semplice.
- **`show_in_rest: 0`** sul gruppo: i campi non sono esposti via REST API. Se in futuro servisse l'editing dal block editor con bindings nativi, va impostato a `1` su tutti i campi rilevanti e abilitato `allow_in_bindings`.

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

Presenta i post in **due modalità di visualizzazione** selezionabili dall'utente: un carousel 3D con effetto prospettico e una griglia CSS. Supporta una barra di navigazione per secolo, filtri multipli basati su campi ACF e ordinamento per data. Le preferenze dell'utente (secolo, filtri, ordinamento, vista, card attiva) sono persistite in un cookie di sessione.

**Funzionalità:**

*Century Bar*
- Barra di navigazione cronologica che copre il range 200 a.C. – 1600 d.C. in **17 segmenti**: i segmenti che contengono almeno un post si dividono lo spazio rimanente in parti uguali (`flex: 1 1 0`), mentre i segmenti vuoti hanno larghezza fissa (60 px desktop / 30 px mobile), sono `disabled` e renderizzati con opacity ridotta
- Ogni segmento corrisponde a un secolo; il primo copre 200 a.C. – 0 con etichetta `200 a.C.`, il secondo copre 0 – 100 d.C. con etichetta `0`, gli altri seguono fino al segmento 1500 – 1600
- Ogni segmento mostra: etichetta del secolo, tick verticale, linea orizzontale continua e **dot quadrati** (5×5 px desktop / 4×4 px mobile) posizionati proporzionalmente al `sort_key` del post all'interno del range; i dot vengono impilati verticalmente in bucket da **5 anni** (es. 0-4, 5-9, 10-14)
- Il segmento attivo è colorato con `accent-4`; il dot del post in evidenza nel carousel diventa `contrast` (nero)
- Cliccando un segmento: carica i post del quel secolo, azzera tutti i filtri e chiude il pannello filtri
- Su mobile (< 768 px) la barra si distribuisce su **3 righe** (6 + 6 + 5 segmenti)

*Vista Timeline*
- Carousel 3D con prospettiva CSS (`perspective: 500vw`) e fino a 5 card visibili simultaneamente (attiva, prev/next, prev2/next2)
- Navigazione con pulsanti freccia, tastiera (←/→), **rotella del mouse** sulla viewport o sullo scrubber e **swipe touch** orizzontale sulla viewport (mobile): la viewport ha `touch-action: pan-y`, quindi lo scroll verticale della pagina resta nativo mentre l'asse orizzontale viene riconosciuto come navigazione del carousel (soglia 50 px, direzione prevalentemente orizzontale)
- I pulsanti freccia si auto-nascondono quando i post visibili (dopo i filtri) sono ≤ 1 (niente da navigare)
- **Click su una card non-attiva**: la porta in primo piano (hit-test via `getBoundingClientRect` sulle card non-attive, perché il contesto 3D `preserve-3d` non delega in modo affidabile i pointer event ai figli)
- Scrubber timeline trascinabile (desktop) con marker per ogni post e label con l'anno; può essere nascosto dal Site Editor e si auto-nasconde quando i post visibili (dopo i filtri) sono meno di 3

*Vista Griglia*
- CSS Grid responsive (`auto-fill`, colonne da 360 px min)
- Ordine dinamico delle card basato sull'indice calcolato lato client

*Filtri*
- Pannello filtri a scomparsa con pill selezionabili per:
  - **Categoria** (campo ACF `categorie_generali`)
  - **Materiale** (campo ACF `materiale`)
  - **Tecnica** (campo ACF `tecniche`)
- I filtri agiscono sui post del **secolo selezionato** nella century bar
- Le pill hanno tre stati:
  - **attiva** — selezionata
  - **disabled** (opacity 0.35) — il valore esiste in almeno un post del secolo attivo ma è escluso dalla combinazione corrente degli altri filtri
  - **invisible** (`display: none`) — il valore non compare in alcun post del secolo attivo; ricompare automaticamente cambiando secolo
- Badge filtri attivi con rimozione singola o globale
- Indicatore contatore post visibili

*Ordinamento*
- Toggle ascendente/discendente con animazione FLIP basata su `sort_key` (campo ACF `data_per_la_timeline`)

*Persistenza preferenze (cookie di sessione)*
- Cookie `tl_prefs` (sessione, nessun `max-age`) scritto in JS tramite `callbacks.savePrefs` (`data-wp-watch`, reattivo)
- Campi salvati: `centuryMin`, `centuryMax`, `viewMode`, `sortAsc`, `activeIndex`, `categoria`, `materiali`, `tecniche`
- PHP legge il cookie al render e inizializza il context con le preferenze salvate; `viewMode` viene validato contro `allowedViews` del blocco

**Attributi del blocco (configurabili dal Site Editor):**

| Attributo | Valori | Descrizione |
|---|---|---|
| `postSource` | `all` / `current_category` / `fixed_category` | Sorgente post da mostrare |
| `selectedCategory` | ID categoria | Categoria fissa (se `fixed_category`) |
| `allowedViews` | `both` / `timeline` / `grid` | Viste disponibili per l'utente |
| `showScrubber` | `true` / `false` | Mostra o nasconde lo scrubber timeline (visibile solo se `allowedViews ≠ grid`) |

**Interactivity API — store `timeline-3d`:**

| Elemento | Descrizione |
|---|---|
| state `visiblePosts` | Post filtrati per secolo attivo + filtri ACF, ordinati |
| state `isViewTimeline/isViewGrid` | Modalità di vista attiva |
| state `filtersOpen` | Apertura pannello filtri |
| state `isCenturyActive` | Segmento century bar attivo (ctx locale: `segMin`) |
| state `isDotActive` | Dot attivo — post corrisponde alla card in evidenza (ctx locale: `postIndex`) |
| state `cardOffset/isActive/isPrev/isNext...` | Posizione card nel carousel |
| state `markerLeft/scrubberThumbLeft` | Posizionamento scrubber |
| state `showScrubber` | Scrubber visibile solo se i post filtrati sono ≥ 3 |
| state `isPillActive` | Pill selezionata (ctx locale: `filterGroup`, `filterVal`) |
| state `isPillDisabled` | Pill grigia: il valore esiste nel secolo ma è escluso dagli altri filtri |
| state `isPillInvisible` | Pill nascosta: il valore non compare in alcun post del secolo attivo |
| state `isPillUnavailable` | Unione di disabled + invisible — usata per il binding HTML `disabled` del bottone |
| action `setCentury` | Cambia secolo attivo, azzera filtri e chiude il pannello |
| action `toggleFilters/clearFilters/togglePill` | Gestione filtri |
| action `setViewTimeline/setViewGrid` | Cambio vista |
| action `toggleSort` | Inversione ordinamento con FLIP |
| action `next/prev` | Navigazione carousel |
| action `scrubberPointerDown/Move` | Drag scrubber |
| action `goToMarker` | Navigazione diretta da marker |
| callback `init` | Setup listener DOM plain (tastiera, rotella, click su card non-attiva); replica inline di `visiblePosts` usando il `ctx` catturato per evitare di rivalutare i computed dello store da fuori dal contesto reattivo della Interactivity API |
| callback `savePrefs` | Scrittura cookie di sessione (reattivo via `data-wp-watch--save`) |
| callback `lazyLoadImages` | Lazy-load delle thumbnail per secolo (reattivo via `data-wp-watch--lazy`): le `<img>` sono renderizzate con `data-src` invece di `src`; al cambio di `activeCenturyMin/Max` o filtri il callback seleziona `.timeline-card:not(.is-hidden) .card-thumb img[data-src]` (e analogo per la griglia), aggiunge `is-loading` al wrapper, setta `src = dataset.src` e rimuove `data-src` solo al `load`/`error`. CSS: `img[data-src] { opacity: 0 }` con `transition` su opacity → fade-in al rilascio dell'attributo, niente alt/icona broken-image durante il caricamento |

---

### 3. Post List (`ttf-child/post-list`)

Presenta i post in una **lista verticale a layout orizzontale** (thumbnail a sinistra 33%, testo a destra) con filtri ACF identici a quelli della timeline e **caricamento infinito** (infinite scroll): i post vengono rivelati 10 alla volta al rilevamento del sentinel tramite `IntersectionObserver`. I post sono ordinati cronologicamente per il campo ACF `data_per_la_timeline` (`usort` lato PHP dopo la query, perché `WP_Query` non può ordinare nativamente su un meta numerico senza la chiave registrata).

**Funzionalità:**

- Card orizzontali: immagine 33% / aspect-ratio 4:3 + corpo testo (data, ubicazione, titolo, estratto, tag categoria)
- Campi **Data** e **Ubicazione** raggruppati in un unico blocco meta con etichetta in grassetto, disposti uno sotto l'altro
- Contatore risultati filtrati visibile nella barra superiore
- **Filtri a scomparsa** con pill selezionabili per **Categoria**, **Materiale** e **Tecnica** — stessa logica della timeline: toggle singolo per gruppo, pill disabilitate per combinazioni non disponibili, badge filtri attivi con rimozione singola o globale; ogni cambio filtro azzera `visibleCount` a 10
- **Infinite scroll**: un sentinel invisibile (1 px) posizionato dopo la lista è osservato da `IntersectionObserver` con `rootMargin: 300px`; al rilevamento incrementa `visibleCount` di 10 finché non ci sono altri post da mostrare. Se il sentinel resta intersecato dopo l'incremento (es. pochi post o viewport alto, casi in cui l'observer non rifirerebbe perché notifica solo i cambi di stato), `loadMore()` si rilancia in `requestAnimationFrame` finché esce dal viewport o non ci sono più post
- **Lazy-load thumbnail con fade-in**: le `<img>` sono renderizzate con `data-src` invece di `src`, quindi nessuna richiesta al browser al render iniziale. Quando `visibleCount` o i filtri cambiano, il callback `lazyLoadImages` seleziona le card non più nascoste, applica `is-loading` al wrapper (spinner CSS) e setta `src` solo allora; `data-src` viene rimosso al `load`/`error` e il CSS (`img[data-src] { opacity: 0 }` + `transition`) produce il fade-in
- Messaggi di stato: "Fine dei risultati" (tutti i post filtrati visibili) e "Nessun risultato trovato" (filtri senza corrispondenze)
- Possibilità di **nascondere l'intera UI filtri** dall'editor: quando disattivata, la barra mostra solo il contatore

**Attributi del blocco (configurabili dal Site Editor):**

| Attributo | Valori | Descrizione |
|---|---|---|
| `postSource` | `all` / `current_category` / `fixed_categories` | Sorgente post da mostrare |
| `selectedCategories` | Array di ID categoria | Categorie fisse (se `fixed_categories`) — selezione multipla tramite checkbox |
| `showFilters` | `true` / `false` | Mostra o nasconde l'intera interfaccia filtri nel frontend |
| `imageRatio` | `4/3` / `3/4` | Proporzioni della thumbnail nelle card (orizzontale o verticale) |

**Campi ACF utilizzati:**

| Campo | Tipo | Uso |
|---|---|---|
| `data` | Testo | Mostrato nella meta-riga della card con etichetta "Data" |
| `ubicazione` | Testo | Mostrato nella meta-riga della card con etichetta "Ubicazione" |
| `categorie_generali` | Select | Filtro Categoria e tag card |
| `materiale` | Select multipla | Filtro Materiale |
| `tecniche` | Select multipla | Filtro Tecnica |

**Interactivity API — store `post-list`:**

| Elemento | Descrizione |
|---|---|
| state `filteredPosts` | Post filtrati per i tre gruppi ACF |
| state `filteredCount` | Numero di post filtrati (mostrato nel contatore) |
| state `isVisible` | Visibilità card: passa i filtri E il suo indice è < `visibleCount` (contesto locale: `postIndex`) |
| state `hasMore` | Ci sono post filtrati oltre `visibleCount` |
| state `showEndMessage/showEmptyMessage` | Messaggi di stato a fine lista o senza risultati |
| state `filtersOpen/filterToggleLabel` | Apertura pannello filtri e label del pulsante |
| state `hasActiveFilters` | Almeno un filtro attivo |
| state `isPillActive/isPillDisabled` | Stato attivo e disponibilità condizionale delle pill |
| state `hasCategoriaFilter/Materiali/Tecniche` | Presenza di filtro per gruppo |
| state `activeCategoriaLabel/Materiali/Tecniche` | Etichetta ACF del filtro attivo |
| action `toggleFilters/clearFilters/togglePill` | Gestione pannello e filtri (ogni cambio resetta `visibleCount = 10`) |
| action `clearCategoria/clearMateriali/clearTecniche` | Rimozione filtro singolo |
| callback `init` | Setup `IntersectionObserver` sul sentinel — cattura `ctx` durante la direttiva per accedere ai segnali Preact dall'interno del callback asincrono. `loadMore()` ricorsivo (in `requestAnimationFrame`) per gestire il caso "sentinel ancora intersecato dopo l'incremento" |
| callback `lazyLoadImages` | Lazy-load delle thumbnail (reattivo via `data-wp-watch--lazy`): all'incremento di `visibleCount` o al cambio filtri, seleziona `.pl-card:not(.pl-hidden) .pl-card-img img[data-src]`, applica `is-loading` al wrapper e setta `src = dataset.src`; `data-src` rimosso al `load`/`error` per innescare il fade-in via CSS |

**Architettura:**
- Tutti i post sono renderizzati server-side in PHP e passati nel context; JS controlla quanti sono visibili tramite `visibleCount`
- Il context Preact è basato su segnali reattivi: `ctx` catturato in `callbacks.init` è leggibile/scrivibile dall'`IntersectionObserver` callback senza necessità di `getContext()`
- La visibilità dei filtri è gestita interamente lato PHP (`$show_filters`): quando disattivata, il markup filtri non viene emesso

---

### 4. Mappa Interattiva (`ttf-child/mappa-interattiva`)

Visualizza una **mappa Leaflet.js** con pin geolocalizzati per ogni articolo che ha il campo ACF `posizione_per_mappa` compilato. I pin aprono una popup con thumbnail, ubicazione e titolo linkato. Il filtro colore del layer tile è scelto dal redattore nel pannello del Site Editor; l'utente frontend non può cambiarlo.

**Funzionalità:**

- Pin SVG circolari (28×28 px: cerchio con punto centrale) con colori fissi indipendenti dalla categoria
- **Clustering automatico** (Leaflet.markercluster): pin vicini vengono raggruppati in un cluster SVG che mostra il conteggio; si apre in spiderfication a zoom elevato o si scioglie in pin individuali a `disableClusteringAtZoom: 17`
- **Raggruppamento coordinate**: più articoli con le stesse coordinate condividono un unico marker; cliccando si apre una sidebar laterale con le card degli articoli corrispondenti al periodo attivo (o tutti se nessun filtro periodo è attivo), separate da un divisore orizzontale
- Card con thumbnail, campo `ubicazione` e titolo linkato (colore `accent-3 #6b2a0b`)
- **Sidebar filtri laterale a scomparsa** (36 px → 450 px, toggle con testo verticale) con pill per **Categoria**, **Materiale**, **Tecnica** e **Periodo** — stessa logica della timeline: pill disabilitate per combinazioni non disponibili, etichette ACF risolte tramite `get_field_object()`, badge filtri attivi con rimozione singola o globale
- Viewport automatico: `fitBounds` sui marker filtrati oppure zoom sul singolo marker visibile
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

**Interactivity API — store `mappa-interattiva`:**

| Elemento | Descrizione |
|---|---|
| state `filtersOpen` | Apertura/chiusura sidebar laterale |
| state `filterToggleLabel` | Etichetta dinamica del bottone toggle (`Filtra ↓ / ↑`) |
| state `isPillActive/isPillDisabled` | Stato attivo e disponibilità condizionale delle pill |
| state `hasActiveFilters` | Almeno un filtro attivo |
| state `hasCategoriaFilter/Materiali/Tecniche` | Presenza di filtro per gruppo |
| state `activeCategoriaLabel/Materiali/Tecniche` | Etichetta ACF del filtro attivo |
| action `toggleFilters/togglePill/clearFilters` | Gestione sidebar e filtri |
| action `clearCategoria/clearMateriali/clearTecniche` | Rimozione filtro singolo |
| callback `initMap` | Inizializzazione Leaflet (eseguito una volta via `data-wp-init`) |
| callback `updateMarkers` | Aggiornamento marker al cambio filtri (reattivo via `data-wp-watch`) |

**Architettura:**
- Leaflet.js (v1.9.4) è **bundlato** direttamente in `view.js` tramite npm/webpack — nessuna dipendenza CDN per il JS
- Il CSS di Leaflet è incluso in `style-index.css` via `@import url()` (CDN jsDelivr)
- Il blocco usa `viewScriptModule` (non `viewScript`) in `block.json`: necessario per il caricamento come ES module e per la risoluzione dell'import map `@wordpress/interactivity`
- `initMap` imposta `ctx.mapInstance` in un `setTimeout` dopo `invalidateSize()`: questo aggiornamento reattivo del contesto riattiva automaticamente `updateMarkers` via `data-wp-watch`, senza chiamate esplicite
- I riferimenti che cambiano per effetto di interazioni cosmetiche (marker selezionato, pannello laterale, icona di default) sono tenuti **fuori** da `ctx` in una `WeakMap` keyed by `ctx`: scriverli su `ctx` farebbe scattare il `data-wp-watch` di `updateMarkers` e quindi un `fitBounds`/`setView` indesiderato (zoom-out al click su un pin singolo dopo aver aperto un cluster)
- Il campo `posizione_per_mappa` è letto con `get_post_meta()` (non `get_field()`) perché ACF Extended con `return_format: leaflet` restituisce HTML anziché i dati grezzi delle coordinate

---

### 5. Campo ACF (`ttf-child/acf-field`)

Blocco generico che visualizza un singolo campo ACF con label e wrapper grafico. **Se il valore del campo è vuoto, il blocco non emette alcun markup**: niente wrapper, niente bordo, niente padding — la decisione "rendi/nascondi" è presa server-side e include l'intero `<div>` di contorno.

**Attributi del blocco (configurabili dal Site Editor):**

| Attributo | Valori | Descrizione |
|---|---|---|
| `fieldKey` | nome campo ACF | Campo da leggere con `get_field()` |
| `label`    | string         | Etichetta in grassetto prima del valore (vuota = niente label) |
| `variant`  | `standard` / `flush` / `top-border` | Wrapper grafico |

**Varianti grafiche:**

| Variante | Stili wrapper | Uso tipico |
|---|---|---|
| `standard`   | bordo inferiore + `padding-bottom: 15px` + `margin-bottom: 20px` | `data`, `ubicazione`, `autore`, `tecnica_e_materiali`, `dimensioni`, `edizione`, `trattato_completo` |
| `flush`      | solo `padding-bottom: 15px`, niente bordi                        | `provenienza` (rich text inline che precede `fonti`) |
| `top-border` | bordo superiore + `padding-top: 15px`                            | `fonti` (separatore prima del blocco link) |

**Comportamento editor:** selezionando un campo dal `SelectControl` la label e la variante si auto-popolano con il preset registrato in `index.js` (mappa dei 9 campi noti). La label resta personalizzabile; il preset si applica solo finché coincide con un default registrato — se l'utente la modifica, cambiare campo non la sovrascrive.

**Render:**
- `wp_kses_post( $value )` per tutti i campi (sicuro sia per testo semplice sia per WYSIWYG, evita di duplicare branch testo/rich)
- `get_block_wrapper_attributes()` per integrare className utente + classi specifiche `acf-field acf-field--{variant} acf-field--{fieldKey}`
- `sanitize_html_class()` sul fieldKey usato come modifier CSS

---

## Tecnologie

- **WordPress Interactivity API** (`@wordpress/interactivity`) — stato reattivo e binding dichiarativo (blocchi featured-zoom, timeline, mappa-interattiva e post-list)
- **Leaflet.js 1.9.4** — mappa interattiva con pin, popup e layer tile (blocco mappa-interattiva, bundlato via npm)
- **wp-scripts 32** — build toolchain (Webpack, SCSS, ESM modules, `--experimental-modules`)
- **CSS 3D transforms** — effetto prospettico del carousel timeline
- **Advanced Custom Fields + ACF Extended** — metadati estesi dei post (incluso campo Open Street Map)
