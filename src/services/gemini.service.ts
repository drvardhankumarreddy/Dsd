
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async generateDischargeSummary(patientData: any): Promise<string> {
    const prompt = `
      You are a World-Class Specialist in Disorders of Sex Development (DSD), operating at a DM (Super-specialty) level.
      Create a highly technical, Chicago Consensus-compliant discharge summary based on the structured data provided below.

      **Structured DSD Data (JSON):**
      ${JSON.stringify(patientData, null, 2)}

      **Clinical Reasoning & Output Requirements:**
      
      1.  **Diagnosis:** formulate a precise diagnosis.
          - Incorporate 'Age of Onset', 'Provisional Diagnosis' if provided.
          - Use the Chicago Consensus Classification (e.g., 46,XX DSD due to CAH).
      
      2.  **History & Presentation:**
          - Detail onset symptoms (e.g., salt-wasting crisis vs simple virilization).
          - Mention specific flags like Hirsutism, Virilisation, HTN.
          - Include Puberty details (Menarche, Precocious) if relevant.
          - Include Surgical history if any.

      3.  **Phenotypic Description:**
          - Describe external genitalia using the Prader Scale.
          - **Explicitly state and interpret the EMS (External Masculinization Score) and EGS (External Genitalia Score).**
          - Mention Tanner staging and Modified FG score (for Hirsutism) if provided.

      4.  **Investigations:**
          - **Hormonal Profile (HPA/HPG Axis):** Analyze the provided lab values (17-OHP, Testosterone, DHEAS, Cortisol, etc.) in the context of the diagnosis.
          - **Genetics:** Highlight mutations (e.g., CYP21A2).
          - **Imaging:** Summarize internal anatomy findings.
          - **CAH Criteria:** If the checklist data suggests CAH, explicitly state the criteria met (e.g., "Meets clinical criteria for Salt-Wasting CAH due to hyperkalemia and elevated 17-OHP").

      5.  **MDT & Psychosocial:**
          - Address Gender Assignment or Dysphoria issues if noted.
          - Include psychological support.

      **Summary Structure:**
      1.  **DSD Classification & Diagnosis** (Header)
      2.  **Clinical Presentation** (History, Symptoms, Anthropometry)
      3.  **Phenotype & Genital Examination** (Prader, EMS, EGS, Tanner)
      4.  **Investigations** (Hormonal Panel, Electrolytes, Imaging, Genetics)
      5.  **Treatment & Course** (Medical/Surgical history, Current medications)
      6.  **Discharge Plan & Long-term Follow-up** (Hormone replacement titration, Tumor surveillance, Psychosexual counseling)

      **Tone:** Highly Academic. Use standard units provided in the input.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || 'No summary generated.';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  async searchMedicalInfo(query: string): Promise<{ text: string, sources: string[] }> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'No results found.';
      
      // Extract sources from grounding chunks
      const sources: string[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push(chunk.web.uri);
          }
        });
      }

      return { 
        text, 
        sources: [...new Set(sources)] 
      };
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }
}
