import { GoogleGenAI } from '@google/genai';
import { getAllMemories } from '../core/memory.js';

export async function checkDiffAgainstMemories(diff: string, mode: 'watch' | 'hook'): Promise<{ violations: string[], ok: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const memories = getAllMemories();
  if (memories.length === 0) {
    return { violations: [], ok: true };
  }

  const enforcedMemories = memories.filter(m => m.enforced);
  const advisoryMemories = memories.filter(m => !m.enforced);

  const prompt = `
You are an AI code reviewer enforcing project preferences.
Review the following git diff and check if it violates any of these stored memories/preferences.

Enforced Preferences (MUST NOT BE VIOLATED):
${enforcedMemories.map(m => `- ${m.content}`).join('\n')}

Advisory Preferences (SHOULD NOT BE VIOLATED):
${advisoryMemories.map(m => `- ${m.content}`).join('\n')}

Diff:
\`\`\`diff
${diff}
\`\`\`

If there are violations, list them clearly. State whether they are enforced or advisory.
If there are no violations, reply with exactly "OK".
`;

  const modelName = mode === 'hook' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = response.text?.trim() || '';
    if (text === 'OK') {
      return { violations: [], ok: true };
    }

    return { violations: [text], ok: false };
  } catch (error) {
    console.error('Error checking diff with Gemini:', error);
    return { violations: [], ok: true }; // Fail open
  }
}
