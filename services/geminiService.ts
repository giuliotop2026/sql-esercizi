
import { GoogleGenAI, Type } from "@google/genai";

// L'API Key viene iniettata automaticamente tramite Vite define nel browser
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Valuta il codice SQL/PLSQL dello studente utilizzando Gemini 3 Pro.
 */
export async function evaluateSqlCode(
  levelPrompt: string,
  levelType: string,
  userCode: string,
  schema: string
): Promise<{ success: boolean; feedback: string }> {
  
  if (!process.env.API_KEY) {
    console.error("ERRORE: API_KEY non configurata nelle variabili d'ambiente.");
    return { 
      success: false, 
      feedback: "CONFIGURAZIONE MANCANTE: Assicurati di aver impostato la variabile API_KEY nel pannello di controllo di Vercel e ri-eseguito il deploy." 
    };
  }

  try {
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
    
    let userMsg = "Errore di connessione col server di valutazione. Riprova.";
    if (error?.message?.includes("API key")) {
      userMsg = "CHIAVE API NON VALIDA: Controlla la tua chiave Gemini su Vercel.";
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
  if (!process.env.API_KEY) return "Configura l'API_KEY su Vercel per attivare i suggerimenti.";
  
  try {
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
