import groq, { getEmbedding } from '../config/groq.js';
import Property from '../models/propertyModel.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper — parse JSON safely from Groq response
const parseJSON = (text) => {
    try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(cleaned.substring(start, end + 1));
        }
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", text);
        throw new Error("Failed to parse AI response as JSON");
    }
};

// Helper — chat completion with JSON response and fallback
const chatJSON = async (prompt, imageUrl = null) => {
    // Use vision model if image is provided, else fallback chain for text
    const models = imageUrl 
        ? ["llama-3.2-11b-vision-preview"] 
        : ["llama-3.3-70b-versatile", "llama3-70b-8192", "mixtral-8x7b-32768"];
    
    let lastError;

    for (const model of models) {
        try {
            const messages = [];
            if (imageUrl) {
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                });
            } else {
                messages.push({ role: 'user', content: prompt });
            }

            const response = await groq.chat.completions.create({
                model,
                messages,
                response_format: { type: 'json_object' },
                temperature: 0.1,
            });
            return parseJSON(response.choices[0].message.content);
        } catch (error) {
            console.warn(`Model ${model} failed: ${error.message}`);
            lastError = error;
        }
    }
    throw lastError;
};

// POST /api/ai/valuate
export const valuateProperty = asyncHandler(async (req, res) => {
    let { propertyId, type, bedrooms, bathrooms, sqft, yearBuilt, city, amenities } = req.body;

    if (propertyId) {
        const property = await Property.findById(propertyId);
        if (property) {
            type = property.type;
            bedrooms = property.bedrooms;
            bathrooms = property.bathrooms;
            sqft = property.sqft;
            yearBuilt = property.yearBuilt;
            city = property.address?.city;
            amenities = property.amenities;
        }
    }

    const prompt = `
    You are a real estate valuation expert in India.
    Estimate the market value of this property based on general market trends.
    Property Details:
    - Type: ${type}
    - Bedrooms: ${bedrooms}, Bathrooms: ${bathrooms}
    - Area: ${sqft} sqft
    - Year Built: ${yearBuilt}
    - City: ${city}
    - Amenities: ${Array.isArray(amenities) ? amenities.join(', ') : amenities}

    Respond ONLY in this exact JSON format with no extra text:
    {
      "low": number,
      "mid": number,
      "high": number,
      "pricePerSqft": number,
      "confidence": "low or medium or high",
      "rationale": "string explaining your simulated reasoning"
    }
  `;

    const data = await chatJSON(prompt);
    res.json(data);
});

// POST /api/ai/describe
export const describeProperty = asyncHandler(async (req, res) => {
    let { propertyId, imageUrls, specs } = req.body;

    if (propertyId) {
        const property = await Property.findById(propertyId);
        if (property) {
            specs = `
                Title: ${property.title}
                Type: ${property.type}
                Beds: ${property.bedrooms}
                Baths: ${property.bathrooms}
                Area: ${property.sqft} sqft
                Location: ${property.address?.city}
                Amenities: ${property.amenities?.join(', ')}
            `;
            imageUrls = property.images?.map(img => img.url) || [];
        }
    }

    // Parse strings from form-data if needed
    if (typeof imageUrls === 'string') {
        try { imageUrls = JSON.parse(imageUrls); } catch (e) {}
    }

    const prompt = `
    You are a real estate marketing expert.
    Generate 3 marketing copy variants for this property.
    Property specs: ${typeof specs === 'object' ? JSON.stringify(specs) : specs}
    Image URLs for reference: ${imageUrls?.join(', ')}

    Respond ONLY in this exact JSON format with no extra text:
    {
      "short": "description under 30 words",
      "medium": "description under 80 words",
      "full": "description under 200 words"
    }
  `;

    const data = await chatJSON(prompt);
    res.json(data);
});

// POST /api/ai/match
export const matchProperties = asyncHandler(async (req, res) => {
    const { preferenceText, topN = 10 } = req.body;

    if (!preferenceText) {
        return res.status(400).json({ message: "preferenceText is required" });
    }
    // Get embedding for preference text
    const preferenceVector = await getEmbedding(preferenceText);

    // Get all properties that have embeddings
    const properties = await Property.find({
        descriptionVector: { $exists: true, $ne: [] },
    }).populate('agent', 'name email avatar');

    if (properties.length === 0) {
        return res.json({ matches: [] });
    }

    // Cosine similarity
    const cosineSimilarity = (a, b) => {
        const length = Math.min(a.length, b.length);
        const dot = a.slice(0, length).reduce((sum, val, i) => sum + val * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dot / (magA * magB);
    };

    const scored = properties
        .map((property) => ({
            ...property.toObject(),
            score: cosineSimilarity(preferenceVector, property.descriptionVector),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topN);

    res.json({ matches: scored });
});

// POST /api/ai/extract-clauses
export const extractClauses = asyncHandler(async (req, res) => {
    const { text } = req.body; // In current frontend, this is a URL

    if (!text) {
        return res.status(400).json({ message: 'Document text or URL is required' });
    }

    const isUrl = text.startsWith('http');
    const isImage = isUrl && (text.match(/\.(jpg|jpeg|png|webp|gif)$/i) || text.includes('cloudinary'));

    const prompt = `
    You are a real estate legal expert.
    Analyze the provided document ${isUrl ? '(via image/URL)' : '(via text)'} and extract key clauses.
    If it's an image, perform OCR and then extract.
    
    Respond ONLY in this exact JSON format:
    {
      "parties": "Full names of buyer, seller, and agents",
      "salePrice": "The exact total price mentioned",
      "conditions": "Key terms like possession date, payment schedule, etc.",
      "penalties": "Late payment or cancellation charges",
      "redFlags": ["List any unusual or risky terms found"]
    }
  `;

    // If it's a URL but not clearly an image, we still try vision model as a fallback for Cloudinary "documents"
    const data = await chatJSON(prompt, isUrl ? text : null);
    res.json({ clauses: data });
});

// POST /api/ai/embed-property/:id
export const embedProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ message: 'Property not found' });
    }

    const text = `
    ${property.title} ${property.type} in ${property.address?.city}.
    ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms,
    ${property.sqft} sqft. Price: ${property.price}.
    Amenities: ${property.amenities?.join(', ')}.
  `;

    property.descriptionVector = await getEmbedding(text);
    await property.save();

    res.json({ message: 'Property embedded successfully' });
});

// POST /api/ai/embed-all (Admin)
export const embedAllProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({
        $or: [
            { descriptionVector: { $exists: false } },
            { descriptionVector: [] },
        ],
    });

    let done = 0;

    for (const property of properties) {
        const text = `
      ${property.title} ${property.type} in ${property.address?.city}.
      ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms,
      ${property.sqft} sqft. Price: ${property.price}.
      Amenities: ${property.amenities?.join(', ')}.
    `;

        property.descriptionVector = await getEmbedding(text);
        await property.save();
        done++;
    }

    res.json({ done, total: properties.length });
});

// POST /api/ai/generate-agreement
export const generateAgreement = asyncHandler(async (req, res) => {
    const { dealId, propertyTitle, buyerName, agentName, price, city, date } = req.body;

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'user',
                content: `
          Generate a formal real estate sale agreement with these details:
          - Property: ${propertyTitle}
          - Buyer: ${buyerName}
          - Agent/Seller: ${agentName}
          - Sale Price: ₹${price}
          - City: ${city}
          - Date: ${date}
          - Deal ID: ${dealId}

          Include all standard clauses: parties, property description,
          payment terms, possession date, penalties, and signatures section.
          Format it as a proper legal document.
        `,
            },
        ],
        temperature: 0.3,
    });

    const agreement = response.choices[0].message.content;
    res.json({ agreement });
});

// POST /api/ai/chat
export const chat = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    const messages = [
        {
            role: 'system',
            content: `You are PropSense AI, a helpful real estate assistant for India.
      You help buyers find properties, understand market trends,
      and navigate the buying process. Be concise and helpful.`,
        },
        ...history.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
        })),
        { role: 'user', content: message },
    ];

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
});

const aiController = {
    valuateProperty,
    describeProperty,
    matchProperties,
    extractClauses,
    embedProperty,
    embedAllProperties,
    generateAgreement,
    chat
}

export default aiController