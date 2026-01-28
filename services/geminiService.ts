
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Valuta il codice SQL/PLSQL dello studente utilizzando Gemini 3 Pro.
 * L'istanza GoogleGenAI viene creata all'interno della funzione per garantire
 * di leggere sempre il valore aggiornato di process.env.API_KEY.
 */
export async function evaluateSqlCode(
  levelPrompt: string,
  levelType: string,
  userCode: string,
  schema: string
): Promise<{ success: boolean; feedback: string }> {
  
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("ERRORE: API_KEY non configurata.");
    return { 
      success: false, 
      feedback: "ERRORE DI CONFIGURAZIONE: La chiave API non è presente. Se sei su Vercel, aggiungi API_KEY nelle Environment Variables e riesegui il Deploy." 
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        Sei un professore universitario di Basi di Dati esperto in SQL e PL/SQL (Oracle). 
        Valuta il seguente codice ${levelType} scritto da uno studente per l'esame.
        
        SCHEMA DB:
        ${schema}
        
        DOMANDA D'ESAME:
        ${levelPrompt}
        
        SOLUZIONE STUDENTE:
        ${userCode}
        
        Regole di valutazione:
        1. Query SQL: controlla JOIN, clausole WHERE, GROUP BY, HAVING e subquery.
        2. Trigger PL/SQL: verifica l'evento (BEFORE/AFTER INSERT...), FOR EACH ROW, l'uso di :NEW/:OLD e la logica di controllo.
        3. Fornisci un feedback pedagogico in italiano. Se l'errore è piccolo, sii comprensivo ma richiedi la correzione.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: {
              type: Type.BOOLEAN,
              description: "True se la soluzione è corretta e completa, False altrimenti."
            },
            feedback: {
              type: Type.STRING,
              description: "Commento dettagliato in italiano che spiega errori o conferma la validità."
            }
          },
          required: ["success", "feedback"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    let userMsg = "Errore di connessione col server di valutazione. Verifica la tua connessione o la validità della API KEY.";
    
    // Gestione specifica degli errori comuni
    if (error?.message?.toLowerCase().includes("api key")) {
      userMsg = "CHIAVE API NON VALIDA: Controlla di aver inserito correttamente la chiave Gemini nelle impostazioni di Vercel.";
    } else if (error?.message?.includes("403") || error?.message?.includes("permission")) {
      userMsg = "ERRORE 403: Accesso negato. La tua API KEY potrebbe non avere i permessi necessari o essere scaduta.";
    }
    
    return { success: false, feedback: userMsg };
  }
}

/**
 * Fornisce un suggerimento educativo per la sfida SQL corrente.
 */
export async function getHint(
  levelPrompt: string,
  levelType: string,
  schema: string,
  currentCode: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Configura l'API_KEY su Vercel per attivare i suggerimenti.";
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        Lo studente è bloccato su questo esercizio di ${levelType}. 
        Richiesta: ${levelPrompt}
        Schema: ${schema}
        Codice attuale dello studente: ${currentCode || '(vuoto)'}
        
        Fornisci un suggerimento utile (HINT) in italiano senza dare la soluzione completa. 
        Spiega la logica o la parola chiave SQL da usare.
      `,
    });
    return response.text || "Non riesco a darti un suggerimento al momento. Rileggi bene lo schema!";
  } catch (error) {
    return "Il professore è occupato. Prova a ragionare sulle tabelle!";
  }
}
