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
You are an intelligent financial assistant for an Indian family expense tracker app called "Ghar Kharch".
Given this user sentence in English, Hindi, or Hinglish: "${cleanInput}"

Extract the structured details and return ONLY a valid JSON object matching this exact TypeScript structure:
{
  "type": "expense" | "income" | "transfer",
  "amount": number (positive numeric value),
  "category": string (Must pick the best matching category from expense list: [${expenseCatNames}] or income list: [${incomeCatNames}], or "Transfer" if type is transfer),
  "paymentMethod": "cash" | "online" (detect if user mentioned cash/gpay/phonepe/paytm/online/bank/card),
  "note": string (brief summary of what the transaction was for)
}

CRITICAL RULES FOR TYPE DETERMINATION (Income vs Expense vs Transfer):

1. INCOME ("Money Came In / Aaye / Mila / Someone Gave Me Money"):
   - Structure & Verbs:
     - "[Person] NE [amount] DIYE / BHEJA / PAY KIYA" (e.g. "dost ne 250 ruppe diye", "papa ne 5000 bheje", "rahul ne gpay kiya") -> MUST BE "income"! Category: "Gift/Received" or "Refund".
     - "aaye", "aaya", "aayi", "mila", "mili", "mile", "received", "got", "refund", "credited", "salary", "kheti", "cashback"
   - EXAMPLES:
     - "dost ne 250 ruppe diye cash me" -> type: "income", category: "Gift/Received"
     - "school se 450 rupye aaye" -> type: "income", category: "School Refund"
     - "dukaan se 1200 aaya" -> type: "income", category: "Business/Freelance"
     - "gpay par 500 mile" -> type: "income", category: "Refund"

2. EXPENSE ("Money Went Out / Gaye / I Gave Someone"):
   - Structure & Verbs:
     - "MAINE [Person] KO [amount] DIYE" or "[Person] KO [amount] DIYE" -> MUST BE "expense"!
     - "gaye", "gaya", "gayi", "diya", "diye", "diye hain", "di", "kharch", "kharcha", "paid", "spent", "debited", "bhara", "khareeda"
   - EXAMPLES:
     - "dost ko 250 diye" -> type: "expense", category: "Other"
     - "school fee 4500 di" -> type: "expense", category: "Education/Tuition"
     - "sabzi me 300 gaye" -> type: "expense", category: "Groceries/Sabzi"

3. TRANSFER ("Money Movement"):
   - Verbs: "transfer", "nikala", "atm", "cash to online", "online to cash"
   - EXAMPLES: "5000 online se cash nikala" -> type: "transfer", category: "Transfer"

Category List for Expenses: [${expenseCatNames}]
Category List for Income: [${incomeCatNames}]

Output strictly raw JSON, no markdown code blocks.
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

  // 2. Detect Type based on Hinglish grammar & postpositions
  let type: 'expense' | 'income' | 'transfer' = 'expense';
  
  const incomeKeywords = ['aaye', 'aaya', 'aayi', 'aaye hain', 'mila', 'mili', 'mile', 'received', 'got', 'refund', 'credited', 'salary', 'kheti', 'cashback'];
  const transferKeywords = ['transfer', 'bheja', 'nikala', 'atm'];
  
  // Check "person NE ... diye" pattern (Income) vs "person KO ... diye" / "maine ... diye" (Expense)
  const containsNeDiye = /\b[a-z0-9]+\s+ne\s+.*\b(diye|diya|bheja|diye hain)\b/i.test(lower);
  
  if (containsNeDiye || incomeKeywords.some(kw => lower.includes(kw))) {
    type = 'income';
  } else if (transferKeywords.some(kw => lower.includes(kw))) {
    type = 'transfer';
  }

  // 3. Detect Payment Method
  let paymentMethod: 'cash' | 'online' = 'online';
  if (lower.includes('cash') || lower.includes('rokle') || lower.includes('nagli')) {
    paymentMethod = 'cash';
  }

  // 4. Detect Category
  let category = 'Other';
  if (type === 'income') {
    if (lower.includes('school') || lower.includes('tuition') || lower.includes('fee')) {
      category = 'School Refund';
    } else if (lower.includes('salary')) {
      category = 'Salary';
    } else if (lower.includes('kheti')) {
      category = 'Kheti';
    } else if (lower.includes('cashback')) {
      category = 'Cashback';
    } else if (lower.includes('dost') || lower.includes('friend') || lower.includes('gift') || containsNeDiye) {
      category = 'Gift/Received';
    } else {
      category = 'Refund';
    }
  } else if (type === 'expense') {
    if (lower.includes('school') || lower.includes('tuition') || lower.includes('fee') || lower.includes('college') || lower.includes('coaching') || lower.includes('book') || lower.includes('exam') || lower.includes('padhai')) {
      category = 'Education/Tuition';
    } else if (lower.includes('milk') || lower.includes('doodh') || lower.includes('dudh') || lower.includes('paneer') || lower.includes('dahi')) {
      category = 'Milk';
    } else if (lower.includes('sabzi') || lower.includes('grocery') || lower.includes('groceries') || lower.includes('rashan') || lower.includes('ration') || lower.includes('vegetable') || lower.includes('dmart')) {
      category = 'Groceries/Sabzi';
    } else if (lower.includes('rent') || lower.includes('kiraya')) {
      category = 'Rent';
    } else if (lower.includes('petrol') || lower.includes('diesel') || lower.includes('auto') || lower.includes('cab') || lower.includes('bus') || lower.includes('train') || lower.includes('ola') || lower.includes('uber') || lower.includes('transport') || lower.includes('fuel')) {
      category = 'Transport/Petrol';
    } else if (lower.includes('food') || lower.includes('hotel') || lower.includes('restaurant') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('chai') || lower.includes('samosa')) {
      category = 'Food Outside';
    } else if (lower.includes('light') || lower.includes('bijli') || lower.includes('electricity')) {
      category = 'Electricity';
    } else if (lower.includes('recharge') || lower.includes('mobile')) {
      category = 'Mobile/Recharge';
    } else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('broadband')) {
      category = 'Internet/WiFi';
    } else if (lower.includes('doctor') || lower.includes('medicine') || lower.includes('dawa') || lower.includes('hospital') || lower.includes('clinic')) {
      category = 'Medical/Doctor';
    } else if (lower.includes('kapde') || lower.includes('shopping') || lower.includes('cloth') || lower.includes('shirt') || lower.includes('pant') || lower.includes('saree') || lower.includes('shoes')) {
      category = 'Shopping/Kapde';
    } else if (lower.includes('gas') || lower.includes('cylinder') || lower.includes('lpg')) {
      category = 'Gas/LPG';
    }
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
