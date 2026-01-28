
import { Level, Difficulty, TaskType } from './types';

const SCHEMA_OSPEDALE = [
  { name: "Persona", columns: [{ name: "CF", type: "CHAR(16)", isPrimary: true }, { name: "Nome", type: "VARCHAR" }, { name: "Cognome", type: "VARCHAR" }, { name: "Data_nascita", type: "DATE" }, { name: "sesso", type: "CHAR(1)" }] },
  { name: "Medico", columns: [{ name: "CF", type: "CHAR(16)", isPrimary: true, isForeign: true }, { name: "Specializzazione", type: "VARCHAR" }, { name: "Anni_esp", type: "NUMBER" }] },
  { name: "Infermiere", columns: [{ name: "CF", type: "CHAR(16)", isPrimary: true, isForeign: true }, { name: "Data_ass", type: "DATE" }, { name: "qualifica", type: "VARCHAR" }] },
  { name: "Intervento", columns: [{ name: "ID", type: "NUMBER", isPrimary: true }, { name: "tipo", type: "VARCHAR" }, { name: "Data_e_ora", type: "DATE" }, { name: "durata", type: "NUMBER" }, { name: "CF_paz", type: "CHAR" }] }
];

const SCHEMA_ASTE = [
  { name: "Oggetto", columns: [{ name: "codice_oggetto", type: "CHAR", isPrimary: true }, { name: "Nome", type: "VARCHAR" }, { name: "provenienza", type: "VARCHAR" }, { name: "Ingombro", type: "NUMBER" }] },
  { name: "Asta", columns: [{ name: "ID_asta", type: "CHAR", isPrimary: true }, { name: "prezzo_base", type: "NUMBER" }, { name: "Data_inizio", type: "DATE" }, { name: "Data_fine", type: "DATE" }, { name: "Codice_oggetto", type: "CHAR" }] },
  { name: "rilanciata", columns: [{ name: "ID_asta", type: "CHAR", isPrimary: true }, { name: "login", type: "VARCHAR", isPrimary: true }, { name: "prezzo_rilancio", type: "NUMBER", isPrimary: true }] },
  { name: "Utente", columns: [{ name: "Login", type: "VARCHAR", isPrimary: true }, { name: "nome", type: "VARCHAR" }, { name: "cognome", type: "VARCHAR" }] }
];

export const LEVELS: Level[] = [
  // ZONE 1: FONDAMENTI & FILTRI (6 Esercizi)
  {
    id: 1, zone: 1, x: 2, y: 1, title: "L'Anagrafe", description: "Esplora i cittadini.", difficulty: Difficulty.BEGINNER, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Seleziona tutti i campi della tabella Persona.", 
    tutorial: "La query base è 'SELECT * FROM Tabella;'. L'asterisco (*) indica tutte le colonne.", 
    expectedGoal: "SELECT * FROM Persona",
  },
  {
    id: 2, zone: 1, x: 3, y: 1, title: "Filtro Sesso", description: "Divisione dati.", difficulty: Difficulty.BEGINNER, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Trova Nome e Cognome delle persone di sesso 'F'.", 
    tutorial: "Usa 'WHERE colonna = valore'. Ricorda che i valori testuali vanno tra apici singoli (').", 
    expectedGoal: "SELECT Nome, Cognome FROM Persona WHERE sesso = 'F'",
  },
  {
    id: 3, zone: 1, x: 4, y: 1, title: "Nati nel Futuro", description: "Lavoro con le date.", difficulty: Difficulty.EASY, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Seleziona le persone nate dopo il 1° Gennaio 2000.", 
    tutorial: "In SQL le date si confrontano come stringhe 'YYYY-MM-DD' o usando operatori come >.", 
    expectedGoal: "SELECT * FROM Persona WHERE Data_nascita > '2000-01-01'",
  },
  {
    id: 4, zone: 1, x: 5, y: 1, title: "Ricerca Parziale", description: "Pattern matching.", difficulty: Difficulty.EASY, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Trova le persone il cui cognome inizia con la lettera 'B'.", 
    tutorial: "L'operatore LIKE cerca pattern. '%' è il jolly: 'B%' significa 'inizia con B'.", 
    expectedGoal: "SELECT * FROM Persona WHERE Cognome LIKE 'B%'",
  },
  {
    id: 5, zone: 1, x: 6, y: 1, title: "Cardiologi Esperti", description: "Filtri multipli.", difficulty: Difficulty.EASY, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Trova i medici con specializzazione 'Cardiologia' e almeno 10 anni di esperienza.", 
    tutorial: "Unisci condizioni con AND. Ricorda: i numeri non hanno bisogno di apici.", 
    expectedGoal: "SELECT * FROM Medico WHERE Specializzazione = 'Cardiologia' AND Anni_esp >= 10",
  },
  {
    id: 6, zone: 1, x: 7, y: 1, title: "Ordine Alfabetico", description: "Ordinamento.", difficulty: Difficulty.EASY, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Mostra gli oggetti ordinati per nome in ordine decrescente.", 
    tutorial: "Usa 'ORDER BY colonna DESC' per l'ordine decrescente (Z-A).", 
    expectedGoal: "SELECT * FROM Oggetto ORDER BY Nome DESC",
  },

  // ZONE 2: JOIN & RELAZIONI (6 Esercizi)
  {
    id: 7, zone: 2, x: 2, y: 3, title: "Specialisti Uniti", description: "ISA Join.", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Mostra Nome, Cognome e Specializzazione di ogni medico.", 
    tutorial: "La JOIN unisce tabelle su una chiave comune. 'JOIN Medico ON Persona.CF = Medico.CF'.", 
    expectedGoal: "SELECT P.Nome, P.Cognome, M.Specializzazione FROM Persona P JOIN Medico M ON P.CF = M.CF",
  },
  {
    id: 8, zone: 2, x: 3, y: 3, title: "Aste e Provenienza", description: "Relazioni 1:N.", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Per ogni asta, mostra l'ID e la provenienza dell'oggetto venduto.", 
    tutorial: "Incrocia Asta e Oggetto usando il codice_oggetto.", 
    expectedGoal: "SELECT A.ID_asta, O.provenienza FROM Asta A JOIN Oggetto O ON A.Codice_oggetto = O.codice_oggetto",
  },
  {
    id: 9, zone: 2, x: 4, y: 3, title: "Rilanci Utenti", description: "Chi punta?", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Mostra il nome dell'utente e il prezzo del rilancio effettuato.", 
    tutorial: "Collega Utente a Rilanciata tramite il campo Login.", 
    expectedGoal: "SELECT U.nome, R.prezzo_rilancio FROM Utente U JOIN rilanciata R ON U.Login = R.login",
  },
  {
    id: 10, zone: 2, x: 5, y: 3, title: "Triplo Incrocio", description: "Join multiple.", difficulty: Difficulty.HARD, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Trova il nome dell'oggetto e il nome dell'utente che ha fatto un rilancio su quell'oggetto.", 
    tutorial: "Collega Oggetto -> Asta -> Rilanciata -> Utente. Una catena di JOIN.", 
    expectedGoal: "SELECT O.Nome, U.nome FROM Oggetto O JOIN Asta A ON O.codice_oggetto = A.Codice_oggetto JOIN rilanciata R ON A.ID_asta = R.ID_asta JOIN Utente U ON R.login = U.Login",
  },
  {
    id: 11, zone: 2, x: 6, y: 3, title: "Interventi Pazienti", description: "Chi è operato?", difficulty: Difficulty.HARD, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Per ogni intervento, mostra il tipo e il nome del paziente operato.", 
    tutorial: "Unisci Intervento a Persona usando Intervento.CF_paz = Persona.CF.", 
    expectedGoal: "SELECT I.tipo, P.Nome FROM Intervento I JOIN Persona P ON I.CF_paz = P.CF",
  },
  {
    id: 12, zone: 2, x: 7, y: 3, title: "Colleghi Medici", description: "Self Join.", difficulty: Difficulty.EXAM, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Trova coppie di medici con la stessa specializzazione (visualizza solo i CF).", 
    tutorial: "Una Self Join usa la stessa tabella due volte: 'Medico M1 JOIN Medico M2'. M1.CF < M2.CF evita duplicati.", 
    expectedGoal: "SELECT M1.CF, M2.CF FROM Medico M1 JOIN Medico M2 ON M1.Specializzazione = M2.Specializzazione WHERE M1.CF < M2.CF",
  },

  // ZONE 3: AGGREGATI & STATISTICHE (6 Esercizi)
  {
    id: 13, zone: 3, x: 2, y: 5, title: "Staff Medico", description: "Conteggio.", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Conta quanti medici ci sono per ogni specializzazione.", 
    tutorial: "Usa COUNT(*) e GROUP BY colonna.", 
    expectedGoal: "SELECT Specializzazione, COUNT(*) FROM Medico GROUP BY Specializzazione",
  },
  {
    id: 14, zone: 3, x: 3, y: 5, title: "Business Aste", description: "Somma.", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Per ogni asta, calcola il totale incassato dai rilanci.", 
    tutorial: "Usa SUM(prezzo_rilancio). GROUP BY raggruppa per ID_asta.", 
    expectedGoal: "SELECT ID_asta, SUM(prezzo_rilancio) FROM rilanciata GROUP BY ID_asta",
  },
  {
    id: 15, zone: 3, x: 4, y: 5, title: "Durata Media", description: "Medie.", difficulty: Difficulty.MEDIUM, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Calcola la durata media degli interventi raggruppati per tipo.", 
    tutorial: "Usa AVG(durata).", 
    expectedGoal: "SELECT tipo, AVG(durata) FROM Intervento GROUP BY tipo",
  },
  {
    id: 16, zone: 3, x: 5, y: 5, title: "Record Rilanci", description: "Massimi e Minimi.", difficulty: Difficulty.HARD, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Trova il prezzo massimo e minimo dei rilanci per l'asta 'A101'.", 
    tutorial: "Usa MAX() e MIN() insieme nella SELECT.", 
    expectedGoal: "SELECT MAX(prezzo_rilancio), MIN(prezzo_rilancio) FROM rilanciata WHERE ID_asta = 'A101'",
  },
  {
    id: 17, zone: 3, x: 6, y: 5, title: "Aste Contese", description: "Filtro Having.", difficulty: Difficulty.HARD, type: TaskType.QUERY, schema: SCHEMA_ASTE,
    prompt: "Mostra gli ID delle aste che hanno ricevuto più di 5 rilanci.", 
    tutorial: "WHERE filtra righe, HAVING filtra gruppi. Usa HAVING COUNT(*) > 5.", 
    expectedGoal: "SELECT ID_asta FROM rilanciata GROUP BY ID_asta HAVING COUNT(*) > 5",
  },
  {
    id: 18, zone: 3, x: 7, y: 5, title: "Statistiche Infortuni", description: "Aggregati complessi.", difficulty: Difficulty.EXAM, type: TaskType.QUERY, schema: SCHEMA_OSPEDALE,
    prompt: "Per ogni tipo di intervento, trova la durata totale e il numero di interventi fatti.", 
    tutorial: "Puoi usare più funzioni aggregate nella stessa query.", 
    expectedGoal: "SELECT tipo, SUM(durata), COUNT(*) FROM Intervento GROUP BY tipo",
  },

  // ZONE 4: TRIGGERS (6 Esercizi)
  {
    id: 19, zone: 4, x: 2, y: 7, title: "Validità Rilancio", description: "Controllo inserimento.", difficulty: Difficulty.HARD, type: TaskType.TRIGGER, schema: SCHEMA_ASTE,
    prompt: "Impedisci rilanci minori o uguali a zero.", 
    tutorial: "Un trigger BEFORE INSERT verifica i dati. Usa RAISE_APPLICATION_ERROR se il valore non va bene.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER CheckPositivo BEFORE INSERT ON rilanciata FOR EACH ROW BEGIN IF :NEW.prezzo_rilancio <= 0 THEN RAISE_APPLICATION_ERROR(-20001, 'Errore'); END IF; END;",
  },
  {
    id: 20, zone: 4, x: 3, y: 7, title: "Asta Coerente", description: "Controllo date.", difficulty: Difficulty.HARD, type: TaskType.TRIGGER, schema: SCHEMA_ASTE,
    prompt: "Un'asta non può finire prima di iniziare.", 
    tutorial: "Confronta :NEW.Data_inizio e :NEW.Data_fine nel trigger.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER CheckDate BEFORE INSERT ON Asta FOR EACH ROW BEGIN IF :NEW.Data_fine < :NEW.Data_inizio THEN RAISE_APPLICATION_ERROR(-20002, 'Data fine non valida'); END IF; END;",
  },
  {
    id: 21, zone: 4, x: 4, y: 7, title: "Auto-Cura", description: "Business logic.", difficulty: Difficulty.HARD, type: TaskType.TRIGGER, schema: SCHEMA_OSPEDALE,
    prompt: "Impedisci l'inserimento di un intervento se il medico e il paziente sono la stessa persona.", 
    tutorial: "Verifica se il CF del medico è uguale al CF del paziente nell'intervento.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER NoAutoCura BEFORE INSERT ON Intervento FOR EACH ROW BEGIN ... END;",
  },
  {
    id: 22, zone: 4, x: 5, y: 7, title: "Limite Esperienza", description: "Aggiornamento dati.", difficulty: Difficulty.EXAM, type: TaskType.TRIGGER, schema: SCHEMA_OSPEDALE,
    prompt: "Impedisci di aggiornare gli anni di esperienza di un medico diminuendoli.", 
    tutorial: "Usa BEFORE UPDATE. Confronta :NEW.Anni_esp con :OLD.Anni_esp.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER NoRegression BEFORE UPDATE ON Medico FOR EACH ROW BEGIN IF :NEW.Anni_esp < :OLD.Anni_esp THEN RAISE_APPLICATION_ERROR(-20005, 'Esperienza decrescente'); END IF; END;",
  },
  {
    id: 23, zone: 4, x: 6, y: 7, title: "Ingombro Massimo", description: "Somma dinamica.", difficulty: Difficulty.EXAM, type: TaskType.TRIGGER, schema: SCHEMA_ASTE,
    prompt: "Impedisci di inserire un oggetto se l'ingombro supera 1000.", 
    tutorial: "Un trigger può bloccare inserimenti basati su valori di altre colonne.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER LimitIngombro BEFORE INSERT ON Oggetto FOR EACH ROW BEGIN IF :NEW.Ingombro > 1000 THEN RAISE_APPLICATION_ERROR(-20006, 'Troppo grande'); END IF; END;",
  },
  {
    id: 24, zone: 4, x: 7, y: 7, title: "Log Protezione", description: "Blocco totale.", difficulty: Difficulty.EXAM, type: TaskType.TRIGGER, schema: SCHEMA_ASTE,
    prompt: "Crea un trigger che impedisca la cancellazione di utenti dalla tabella Utente.", 
    tutorial: "Usa BEFORE DELETE e lancia sempre un errore.", 
    expectedGoal: "CREATE OR REPLACE TRIGGER ProtectUsers BEFORE DELETE ON Utente FOR EACH ROW BEGIN RAISE_APPLICATION_ERROR(-20007, 'Cancellazione proibita'); END;",
  }
];
