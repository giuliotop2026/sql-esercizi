
import { Level, Difficulty, TaskType, TableSchema, DatabaseID } from './types';

export const SCHEMA_ASTE: TableSchema[] = [
  { name: "Oggetto", columns: [
    { name: "codice_oggetto", type: "CHAR", isPrimary: true },
    { name: "Nome", type: "VARCHAR" },
    { name: "provenienza", type: "VARCHAR" },
    { name: "Ingombro", type: "NUMBER" }
  ]},
  { name: "Opera_d_arte", columns: [
    { name: "autore", type: "VARCHAR" },
    { name: "tipo", type: "VARCHAR" },
    { name: "Codice_oggetto", type: "CHAR", isForeign: true }
  ]},
  { name: "Antiquariato", columns: [
    { name: "materiale", type: "VARCHAR" },
    { name: "periodo_rif", type: "VARCHAR" },
    { name: "codice_oggetto", type: "CHAR", isForeign: true }
  ]},
  { name: "Asta", columns: [
    { name: "ID_asta", type: "CHAR", isPrimary: true },
    { name: "Rilancio_min", type: "NUMBER" },
    { name: "prezzo_base", type: "NUMBER" },
    { name: "Data_inizio", type: "DATE" },
    { name: "Data_fine", type: "DATE" },
    { name: "Codice_oggetto", type: "CHAR", isForeign: true }
  ]},
  { name: "Utente", columns: [
    { name: "Login", type: "VARCHAR", isPrimary: true },
    { name: "password", type: "VARCHAR" },
    { name: "nome", type: "VARCHAR" },
    { name: "cognome", type: "VARCHAR" }
  ]},
  { name: "Vendita", columns: [
    { name: "Fattura", type: "CHAR", isPrimary: true },
    { name: "Data_ricez_pag", type: "DATE" },
    { name: "tipo_pagamento", type: "VARCHAR" },
    { name: "prezzo_finale", type: "NUMBER" },
    { name: "CF", type: "CHAR" },
    { name: "via", type: "VARCHAR" },
    { name: "civico", type: "NUMBER" },
    { name: "CAP", type: "CHAR" },
    { name: "citta", type: "VARCHAR" },
    { name: "ID_asta", type: "CHAR", isForeign: true }
  ]},
  { name: "rilanciata", columns: [
    { name: "ID_asta", type: "CHAR", isPrimary: true, isForeign: true },
    { name: "login", type: "VARCHAR", isPrimary: true, isForeign: true },
    { name: "prezzo_rilancio", type: "NUMBER", isPrimary: true }
  ]}
];

export const SCHEMA_OSPEDALE: TableSchema[] = [
  { name: "Persona", columns: [
    { name: "CF", type: "CHAR", isPrimary: true },
    { name: "Nome", type: "VARCHAR" },
    { name: "Cognome", type: "VARCHAR" },
    { name: "Data_nascita", type: "DATE" },
    { name: "sesso", type: "CHAR" }
  ]},
  { name: "Medico", columns: [
    { name: "Specializzazione", type: "VARCHAR" },
    { name: "Anni_esp", type: "NUMBER" },
    { name: "CF", type: "CHAR", isPrimary: true, isForeign: true }
  ]},
  { name: "Infermiere", columns: [
    { name: "Data_ass", type: "DATE" },
    { name: "qualifica", type: "VARCHAR" },
    { name: "CF", type: "CHAR", isPrimary: true, isForeign: true }
  ]},
  { name: "Paziente", columns: [
    { name: "CF", type: "CHAR", isPrimary: true, isForeign: true },
    { name: "data_ric", type: "DATE", isPrimary: true },
    { name: "data_dim", type: "DATE" }
  ]},
  { name: "Effettua", columns: [
    { name: "CF_med", type: "CHAR", isPrimary: true, isForeign: true },
    { name: "ID_int", type: "NUMBER", isPrimary: true, isForeign: true }
  ]},
  { name: "Assiste", columns: [
    { name: "CF_inf", type: "CHAR", isPrimary: true, isForeign: true },
    { name: "ID_int", type: "NUMBER", isPrimary: true, isForeign: true }
  ]},
  { name: "Intervento", columns: [
    { name: "ID", type: "NUMBER", isPrimary: true },
    { name: "tipo", type: "VARCHAR" },
    { name: "Data_e_ora", type: "DATE" },
    { name: "durata", type: "NUMBER" },
    { name: "sala_op", type: "VARCHAR" },
    { name: "CF_paz", type: "CHAR", isForeign: true },
    { name: "Data_Ric", type: "DATE", isForeign: true }
  ]}
];

export const getLevelsForSector = (sector: number, db: DatabaseID): Level[] => {
  const isAste = db === 'aste';
  const points = [{x: 10, y: 30}, {x: 25, y: 50}, {x: 45, y: 20}, {x: 60, y: 40}, {x: 75, y: 65}, {x: 90, y: 35}, {x: 85, y: 80}];
  const levels: Level[] = [];

  if (sector === 1) { // MONDO 1: BASI
    const table = isAste ? "Oggetto" : "Persona";
    const col1 = isAste ? "Nome" : "Cognome";
    const col2 = isAste ? "provenienza" : "sesso";

    const prompts = [
      `Estrai tutti i dati dalla tabella ${table}.`,
      `Mostra solo le colonne ${col1} e ${col2} della tabella ${table}.`,
      `Trova gli elementi della tabella ${table} dove ${col2} è ${isAste ? "'Marte'" : "'M'"}.`,
      `Seleziona ${col1} per gli elementi dove ${isAste ? 'Ingombro > 500' : 'Nome inizia per A'}.`,
      `Mostra tutti i valori diversi presenti nella colonna ${col2}.`,
      `Ordina la tabella ${table} per ${col1} in ordine alfabetico.`,
      `Trova nome e ${col2} degli elementi con ${isAste ? 'Ingombro < 100' : 'Sesso F'}, ordinati per ${col1}.`
    ];

    for (let i = 0; i < 7; i++) {
      levels.push({
        id: i + 1,
        sector: 1,
        title: `BASI - Step ${i + 1}`,
        description: "Fondamenta del linguaggio SQL.",
        difficulty: Difficulty.BEGINNER,
        type: TaskType.QUERY,
        prompt: prompts[i],
        theory: "La clausola SELECT permette di estrarre dati, WHERE di filtrarli e ORDER BY di organizzarli.",
        x: points[i].x, y: points[i].y,
        steps: [
          { label: "OBIETTIVO", type: 'text', content: prompts[i] },
          { label: "TABELLE", type: 'tables', content: `Lavoreremo sulla tabella ${table}.`, highlightedTables: [table] },
          { label: "LOGICA", type: 'logic', content: `Dobbiamo dire al database: 'Prendi questi campi (${col1}, ${col2}) da questa tabella (${table})'.` },
          { label: "OPERATORE", type: 'logic', content: i > 1 ? "Useremo WHERE per creare un filtro." : "Useremo SELECT semplice." },
          { label: "SOLUZIONE", type: 'code', content: "Ecco come scrivere la query completa:", code: i === 0 ? `SELECT * FROM ${table};` : `SELECT ${col1}, ${col2} FROM ${table} ${i > 2 ? 'WHERE ...' : ''};` }
        ]
      });
    }
  } else if (sector === 2) { // MONDO 2: JOIN
    const t1 = isAste ? "Oggetto" : "Persona";
    const t2 = isAste ? "Opera_d_arte" : "Medico";

    const astePrompts = [
      `Collega Oggetto con Opera_d_arte per vedere i nomi e i loro dettagli collegati.`,
      `Estrai il Nome dell'oggetto e l'autore (dalla tabella Opera_d_arte) solo per gli oggetti di tipo 'Pittura'.`,
      `Trova gli oggetti che sono opere d'arte, mostrando il Nome e l'Autore dell'opera.`,
      `Mostra il Nome dell'oggetto e l'ID dell'Asta associata consultando la tabella Asta.`,
      `Unisci Oggetto, Opera_d_arte e Asta per avere un report completo di oggetti d'arte e prezzi base.`,
      `Trova gli oggetti in vendita mostrando Nome e Prezzo Finale collegando Oggetto con Vendita.`,
      `Sfida Finale Join Aste: Collega Oggetto, Asta e Vendita per vedere chi ha acquistato cosa.`
    ];

    const ospedalePrompts = [
      `Collega Persona con Medico per vedere i nomi dei medici e la loro specializzazione.`,
      `Estrai Cognome e Specializzazione (dalla tabella Medico) solo per chi ha più di 10 anni di esperienza.`,
      `Trova le persone che sono anche medici, mostrando Cognome e Specializzazione.`,
      `Mostra il Nome della persona e il tipo di intervento effettuato (tabella Intervento).`,
      `Unisci Persona, Medico ed Effettua per avere l'elenco dei medici e degli interventi fatti.`,
      `Trova gli infermieri che assistono agli interventi unendo Infermiere e Assiste.`,
      `Sfida Finale Join Medico: Collega Persona, Medico ed Effettua per vedere chi opera.`
    ];

    const prompts = isAste ? astePrompts : ospedalePrompts;

    for (let i = 0; i < 7; i++) {
      levels.push({
        id: i + 8,
        sector: 2,
        title: `JOIN - Step ${i + 1}`,
        description: "Relazioni tra entità.",
        difficulty: Difficulty.MEDIUM,
        type: TaskType.QUERY,
        prompt: prompts[i],
        theory: "Il JOIN unisce righe di tabelle diverse basandosi su colonne comuni (Chiavi).",
        x: points[i].x, y: points[i].y,
        steps: [
          { label: "OBIETTIVO", type: 'text', content: prompts[i] },
          { label: "TABELLE", type: 'tables', content: `Coinvolgeremo ${t1} e altre tabelle correlate.`, highlightedTables: [t1] },
          { label: "RELAZIONE", type: 'logic', content: `Il collegamento avviene tramite le chiavi primarie ed esterne.` },
          { label: "PROCEDIMENTO", type: 'logic', content: "Usiamo la clausola ON per definire il 'ponte' tra le tabelle." },
          { label: "SOLUZIONE", type: 'code', content: "La query di giunzione segue questa logica:", code: `SELECT ... \nFROM ${t1} JOIN ... ON ...;` }
        ]
      });
    }
  } else if (sector === 3) { // MONDO 3: ANALISI
    const table = isAste ? "rilanciata" : "Medico";
    const col = isAste ? "prezzo_rilancio" : "Anni_esp";
    const group = isAste ? "ID_asta" : "Specializzazione";

    const prompts = [
      `Conta quanti elementi ci sono nella tabella ${isAste ? 'Oggetto' : 'Medico'}.`,
      `Calcola la somma totale di tutti i ${isAste ? 'prezzi di rilancio' : 'anni di esperienza'}.`,
      `Trova il valore massimo di ${col} mai registrato.`,
      `Calcola la media di ${col} per ogni ${group}.`,
      `Conta quanti rilanci ha ricevuto ogni singola Asta.` ,
      `Mostra solo i raggruppamenti (${group}) che hanno una media superiore a 10.`,
      `Report Analitico: Numero di elementi e media valori raggruppati.`
    ];

    for (let i = 0; i < 7; i++) {
      levels.push({
        id: i + 15,
        sector: 3,
        title: `ANALISI - Step ${i + 1}`,
        description: "Aggregazione e statistiche.",
        difficulty: Difficulty.HARD,
        type: TaskType.QUERY,
        prompt: prompts[i],
        theory: "GROUP BY raggruppa righe simili, le funzioni aggregate (SUM, AVG, COUNT) le analizzano.",
        x: points[i].x, y: points[i].y,
        steps: [
          { label: "OBIETTIVO", type: 'text', content: prompts[i] },
          { label: "TABELLE", type: 'tables', content: `Useremo la tabella ${table}.`, highlightedTables: [table] },
          { label: "AGGREGAZIONE", type: 'logic', content: `Dobbiamo raggruppare i dati per ${group} usando GROUP BY.` },
          { label: "FILTRO GRUPPI", type: 'logic', content: i === 5 ? "Useremo HAVING per filtrare i risultati DOPO il raggruppamento." : "Useremo una funzione di calcolo come AVG o SUM." },
          { label: "SOLUZIONE", type: 'code', content: "Sintassi di analisi:", code: `SELECT ${group}, AVG(${col}) \nFROM ${table} \nGROUP BY ${group};` }
        ]
      });
    }
  } else { // MONDO 4: TRIGGER
    const table = isAste ? "Asta" : "Intervento";
    const field = isAste ? "prezzo_base" : "durata";

    const prompts = [
      `Crea un trigger che impedisca di inserire un ${field} negativo in ${table}.`,
      `Crea un trigger che, dopo ogni inserimento, registri l'operazione in una tabella di log.`,
      `Trigger di Validazione: Impedisci ${isAste ? 'rilanci' : 'interventi'} con valori incoerenti.`,
      `Trigger di Correzione: Se il valore inserito è NULL, impostalo automaticamente a un default.`,
      `Trigger Multi-Evento: Gestisci logica diversa per INSERT e UPDATE su ${table}.`,
      `Trigger di Sicurezza: Impedisci modifiche alla tabella ${table} in determinati contesti.`,
      `Esame Finale Trigger: Crea un sistema di controllo integrità complesso.`
    ];

    for (let i = 0; i < 7; i++) {
      levels.push({
        id: i + 22,
        sector: 4,
        title: `TRIGGER - Step ${i + 1}`,
        description: "Automazione e vincoli.",
        difficulty: Difficulty.EXAM,
        type: TaskType.TRIGGER,
        prompt: prompts[i],
        theory: "Un Trigger è un blocco PL/SQL che si attiva automaticamente al verificarsi di un evento (DML).",
        x: points[i].x, y: points[i].y,
        steps: [
          { label: "OBIETTIVO", type: 'text', content: prompts[i] },
          { label: "EVENTO", type: 'logic', content: `Il trigger deve scattare sulla tabella ${table}.` },
          { label: "DATO :NEW", type: 'logic', content: "Useremo la variabile :NEW per accedere ai dati in ingresso." },
          { label: "BLOCCO", type: 'logic', content: "Useremo RAISE_APPLICATION_ERROR per bloccare azioni non valide." },
          { label: "SOLUZIONE", type: 'code', content: "Struttura PL/SQL:", code: `CREATE OR REPLACE TRIGGER trg_example \nBEFORE INSERT ON ${table} FOR EACH ROW \nBEGIN \n  ...\nEND;` }
        ]
      });
    }
  }

  return levels;
};
