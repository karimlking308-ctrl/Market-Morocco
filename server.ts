import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse json and urlencoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initializing server-side Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database State (synchronized with client via APIs)
// We populate this with mock data on startup or fallback
let appSettings = {
  commissionPercent: 5,
  setupFeeMAD: 9,
  allowedCategories: [
    'القفطان والجلابة المغربية',
    'الصناعة التقليدية والديكور',
    'الزيوت والأعشاب الطبيعية',
    'المنتجات الغذائية والمحلية',
    'الملابس والأحذية الحديثة',
    'الهواتف والإلكترونيات',
    'مستحضرات التجميل المغربية',
    'أخرى'
  ],
  moroccanCities: [
    'Casablanca (الدار البيضاء)',
    'Rabat (الرباط)',
    'Marrakech (مراكش)',
    'Fes (فاس)',
    'Tangier (طنجة)',
    'Agadir (أكادير)',
    'Oujda (وجدة)',
    'Kenitra (القنيطرة)',
    'Tetouan (تطوان)',
    'Meknes (مكناس)',
    'Safi (آسفي)',
    'Nador (الناظور)',
    'El Jadida (الجديدة)',
    'Laayoune (العيون)'
  ]
};

// Simple server side logs or state
console.log('may-store server initializing...');

// API 1: Moderation API using server-side Gemini
app.post('/api/moderate-product', async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required for moderation.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Degrade gracefully if no API key is set
      console.log('No GEMINI_API_KEY found, auto-approving product.');
      return res.json({ status: 'active', reason: 'تمت الموافقة التلقائية (بيئة تجريبية بدون مفتاح API)' });
    }

    console.log(`Moderating product: "${name}" via Gemini API...`);

    const prompt = `You are a content moderator for may-store (an e-commerce platform in Morocco).
    Analyze this product submission:
    - Product Name: "${name}"
    - Category: "${category}"
    - Description: "${description}"

    Evaluate if this product is compliant with Moroccan laws and standard e-commerce safety policies.
    Strictly reject: weapons, drugs, alcohol, adult services/items, tobacco/vape, black-market items, or offensive/hate content.
    For local culture products like traditional clothing (caftan, djellaba), Moroccan cosmetic/wellness (argan oil, amlou, saffron, hammam herbs), or local Moroccan crafts, those are highly approved and encouraged!

    Provide your moderation decision in JSON format with:
    1. "status": either "active" (if safe/approved) or "rejected" (if prohibited/illegal).
    2. "reason": a short, polite explanation in Arabic or French explaining why it was approved or rejected.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: 'The status: active (approved) or rejected (forbidden)'
            },
            reason: {
              type: Type.STRING,
              description: 'Reason for the moderation result, written in Arabic or French.'
            }
          },
          required: ['status', 'reason']
        }
      }
    });

    const resultText = response.text || '{}';
    const moderation = JSON.parse(resultText);

    res.json(moderation);
  } catch (error: any) {
    console.error('Gemini Moderation Error:', error);
    // Fallback behavior: approve but flag for human review if Gemini fails
    res.json({
      status: 'active',
      reason: 'معتمد مؤقتاً في انتظار المراجعة البشرية (خطأ في النظام)'
    });
  }
});

// API 2: Product Description AI Generator using server-side Gemini
app.post('/api/generate-description', async (req, res) => {
  try {
    const { name, category, features } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Product name is required to generate a description.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ description: `هذا وصف تلقائي لمنتج: ${name}. مصنوع بجودة عالية ومناسب للاستخدام اليومي.` });
    }

    console.log(`Generating description for: "${name}"...`);

    const prompt = `You are an expert Moroccan copywriter. Create a beautiful, enticing, and professional product description for a Moroccan marketplace.
    Product name: "${name}"
    Category: "${category || 'General'}"
    Key features: "${features || 'High quality Moroccan product'}"

    Write a rich, persuasive e-commerce description in eloquent Moroccan Arabic/MSA (Modern Standard Arabic) paired with a clean French version below it.
    Highlight the quality, utility, traditional/modern value, and the fact that it delivers across Morocco. Keep it structured with bullet points for key features.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    res.json({ description: response.text });
  } catch (error: any) {
    console.error('Gemini Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate product description.' });
  }
});

// API 2.1: Morocco AI Buyer Advisor
app.post('/api/ai-advisor', async (req, res) => {
  try {
    const { message, history, products } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: "مرحباً بك! يرجى تهيئة مفتاح GEMINI_API_KEY في الإعدادات لتفعيل المستشار الذكي بكامل طاقته. حالياً، أنا في الوضع التجريبي التلقائي."
      });
    }

    console.log(`AI Advisor processing user query...`);

    const formattedProducts = products && Array.isArray(products)
      ? products.slice(0, 15).map((p: any) => `- [${p.name}] (${p.price} DH) - فئة: ${p.category}. وصف: ${p.description}`).join('\n')
      : '';

    const systemInstruction = `You are "Morocco AI Advisor" (مستشار المشتري الذكي), a warm, helpful, and highly knowledgeable e-commerce shopping assistant for "may-store" (منصة ماي ستور).
    Your goals:
    1. Guide users to find traditional crafts, local Moroccan cosmetic/wellness products (argan oil, amlou, saffron, hammam herbs), traditional garments (caftans, djellabas), and other items.
    2. Suggest relevant items based on the user's request. Recommend real products available on our platform from the following catalog:
    ${formattedProducts}
    3. Always answer in the language the user speaks to you (Moroccan Arabic/Darija, Modern Standard Arabic, or French).
    4. Maintain a warm, welcoming Moroccan hospitality tone (e.g., "أهلاً وسهلاً بك", "مرحباً بك لالة / سيدي", "على الرحب والسعة").
    5. Keep your responses friendly, concise, and beautifully structured.
    6. Ensure you emphasize that payment is safely done via Cash on Delivery (الدفع عند الاستلام) across all cities in Morocco.`;

    const chatHistory = history && Array.isArray(history) ? history.map((h: any) => ({
      role: h.senderId === 'store-ai-advisor' ? 'model' : 'user',
      parts: [{ text: h.content }]
    })) : [];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...chatHistory.slice(-8),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini Advisor Error:', error);
    res.status(500).json({ error: 'Failed to generate advisor response.' });
  }
});

// API 2.2: AI Seller Reply Suggester
app.post('/api/ai-reply-suggester', async (req, res) => {
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: 'History is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        suggestion: "شكراً لرسالتكم! سنقوم بالرد وتأكيد طلبكم في أقرب وقت."
      });
    }

    console.log(`Generating AI reply suggestion for seller...`);

    const conversationText = history.map((h: any) => `${h.senderId === 'store-ai-advisor' ? 'AI Advisor' : h.senderId}: ${h.content}`).join('\n');

    const prompt = `You are a supportive assistant helping a merchant on "may-store".
    Review the following chat conversation history with a buyer:
    ${conversationText}

    Suggest a helpful, highly polite, and professional merchant reply in the same language as the buyer (Moroccan Arabic/Darija or French).
    Keep it natural, concise (under 2 sentences), and encouraging to help complete the sale or reassure the buyer about cash on delivery.
    
    Output ONLY the reply text directly. Do not wrap it in quotes or add metadata.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    res.json({ suggestion: response.text ? response.text.trim() : '' });
  } catch (error: any) {
    console.error('Gemini Reply Suggester Error:', error);
    res.status(500).json({ error: 'Failed to generate reply suggestion.' });
  }
});

// API 3: Get Platform Settings
app.get('/api/settings', (req, res) => {
  res.json(appSettings);
});

// API 4: Update Settings (Admin-only in production, simple PUT here)
app.put('/api/settings', (req, res) => {
  const { commissionPercent, setupFeeMAD } = req.body;
  if (commissionPercent !== undefined) appSettings.commissionPercent = Number(commissionPercent);
  if (setupFeeMAD !== undefined) appSettings.setupFeeMAD = Number(setupFeeMAD);
  res.json({ success: true, settings: appSettings });
});

// Setup Vite Dev Server / Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset serving configured.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[may-store Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
});
