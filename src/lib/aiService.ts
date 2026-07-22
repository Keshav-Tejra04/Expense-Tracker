import { defaultExpenseCategories, defaultIncomeCategories } from '../constants/categories';

export interface ParsedAIExpense {
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  category: string;
  paymentMethod: 'cash' | 'online';
  note: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export async function parseExpenseWithAI(userInput: string): Promise<ParsedAIExpense> {
  const cleanInput = userInput.trim();
  if (!cleanInput) {
    throw new Error('Please enter or speak an expense sentence');
  }

  // If Gemini API Key is available, use Gemini 1.5 Flash
  if (GEMINI_API_KEY) {
    try {
      const expenseCatNames = defaultExpenseCategories.map(c => c.name).join(', ');
      const incomeCatNames = defaultIncomeCategories.map(c => c.name).join(', ');

      const prompt = `
You are an AI financial assistant for an Indian family expense tracker app called "Ghar Kharch".
Given this user sentence in English, Hindi, or Hinglish: "${cleanInput}"

Extract the structured details and return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (positive numeric value),
  "category": string (Must pick the best matching category from expense list: [${expenseCatNames}] or income list: [${incomeCatNames}], or "Transfer" if type is transfer),
  "paymentMethod": "cash" | "online" (detect if user mentioned cash/gpay/phonepe/paytm/online/bank/card),
  "note": string (brief summary of what the transaction was for)
}

Rules:
- Default paymentMethod to "online" if unclear or mentioned gpay/upi/phonepe/paytm/netbanking. Use "cash" if cash/rokle is mentioned.
- Default type to "expense" unless income/salary/refund or transfer is clearly implied.
- Do NOT output any markdown, code blocks, or extra text. Output strictly raw JSON.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean JSON string
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.amount && !isNaN(parsed.amount)) {
          return {
            type: parsed.type === 'income' ? 'income' : (parsed.type === 'transfer' ? 'transfer' : 'expense'),
            amount: Number(parsed.amount),
            category: parsed.category || (parsed.type === 'income' ? 'Other' : 'Other'),
            paymentMethod: parsed.paymentMethod === 'cash' ? 'cash' : 'online',
            note: parsed.note || cleanInput,
          };
        }
      }
    } catch (e) {
      console.warn('[AIService] Gemini API call failed, falling back to local Regex parser:', e);
    }
  }

  // --- Local Fallback Parser (Offline / No Key) ---
  return fallbackLocalParser(cleanInput);
}

function fallbackLocalParser(text: string): ParsedAIExpense {
  const lower = text.toLowerCase();
  
  // 1. Extract Amount
  const numbers = lower.match(/\b\d+(\.\d+)?\b/g);
  let amount = 0;
  if (numbers && numbers.length > 0) {
    amount = parseFloat(numbers[0]);
  }

  // 2. Detect Type
  let type: 'expense' | 'income' | 'transfer' = 'expense';
  if (lower.includes('salary') || lower.includes('income') || lower.includes('received') || lower.includes('refund') || lower.includes('kheti')) {
    type = 'income';
  } else if (lower.includes('transfer') || lower.includes('bheja') || lower.includes('sent to cash') || lower.includes('sent to online')) {
    type = 'transfer';
  }

  // 3. Detect Payment Method
  let paymentMethod: 'cash' | 'online' = 'online';
  if (lower.includes('cash') || lower.includes('rokle') || lower.includes('nagli')) {
    paymentMethod = 'cash';
  }

  // 4. Detect Category
  let category = type === 'income' ? 'Other' : 'Other';
  if (type === 'expense') {
    if (lower.includes('milk') || lower.includes('doodh')) category = 'Milk';
    else if (lower.includes('sabzi') || lower.includes('grocery') || lower.includes('rashan') || lower.includes('vegetable')) category = 'Groceries/Sabzi';
    else if (lower.includes('rent') || lower.includes('kiraya')) category = 'Rent';
    else if (lower.includes('petrol') || lower.includes('auto') || lower.includes('cab') || lower.includes('bus') || lower.includes('transport')) category = 'Transport/Petrol';
    else if (lower.includes('food') || lower.includes('hotel') || lower.includes('restaurant') || lower.includes('dinner') || lower.includes('lunch')) category = 'Food Outside';
    else if (lower.includes('light') || lower.includes('bijli') || lower.includes('electricity')) category = 'Electricity';
    else if (lower.includes('recharge') || lower.includes('mobile')) category = 'Mobile/Recharge';
    else if (lower.includes('wifi') || lower.includes('internet')) category = 'Internet/WiFi';
    else if (lower.includes('doctor') || lower.includes('medicine') || lower.includes('dawa') || lower.includes('hospital')) category = 'Medical/Doctor';
    else if (lower.includes('kapde') || lower.includes('shopping') || lower.includes('cloth')) category = 'Shopping/Kapde';
  } else if (type === 'income') {
    if (lower.includes('salary')) category = 'Salary';
    else if (lower.includes('kheti')) category = 'Kheti';
  } else {
    category = 'Transfer';
  }

  return {
    type,
    amount,
    category,
    paymentMethod,
    note: text,
  };
}
