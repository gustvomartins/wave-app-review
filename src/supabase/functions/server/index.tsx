import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

// Helper function to extract JSON from text (handles markdown code blocks)
function extractJSON(text: string): string {
  let jsonStr = text.trim();
  
  // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }
  
  // Extract JSON array or object
  const jsonMatch = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  
  return jsonStr;
}

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Health check
app.get("/make-server-f4aa3b54/health", (c) => {
  return c.json({ status: "ok" });
});

// Search apps
app.get("/make-server-f4aa3b54/search", async (c) => {
  try {
    const query = c.req.query("q");
    const store = c.req.query("store") || "both";
    
    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    console.log(`Searching for: ${query} in ${store}`);

    const results = [];

    // App Store search
    if (store === "appstore" || store === "both") {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=br&entity=software&limit=10`;
        const response = await fetch(url);
        const data = await response.json();

        const apps = (data.results || [])
          .filter((app) => app?.trackId && app?.trackName)
          .map((app) => ({
            id: String(app.trackId),
            name: app.trackName,
            developer: app.artistName || 'Unknown',
            icon: app.artworkUrl512 || app.artworkUrl100 || '',
            store: "App Store",
            storeUrl: app.trackViewUrl || '',
            bundleId: app.bundleId || '',
          }));
        
        results.push(...apps);
      } catch (err) {
        console.error("App Store search error:", err);
      }
    }

    // Google Play search - temporarily disabled (requires Node.js specific APIs)
    if (store === "playstore" || store === "both") {
      console.log("Google Play search is temporarily disabled");
      // TODO: Implement Deno-compatible scraping solution
    }

    return c.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Failed to search apps" }, 500);
  }
});

// Get app details
app.get("/make-server-f4aa3b54/app/:store/:id", async (c) => {
  try {
    const store = c.req.param("store");
    const id = c.req.param("id");

    if (store === "appstore") {
      // App Store details
      const lookupUrl = `https://itunes.apple.com/lookup?id=${id}&country=br`;
      const lookupResponse = await fetch(lookupUrl);
      const lookupData = await lookupResponse.json();

      if (!lookupData.results || lookupData.results.length === 0) {
        return c.json({ error: "App not found" }, 404);
      }

      const app = lookupData.results[0];
      const allReviews = [];
      
      // Calculate date cutoff (1 year ago)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      console.log(`Fetching App Store reviews from the last 12 months (since ${oneYearAgo.toISOString().split('T')[0]})...`);
      
      // Fetch all available reviews (max ~500 from Apple RSS API)
      let page = 1;
      const maxPages = 10; // Apple RSS API limit
      let consecutiveEmptyPages = 0;
      let reachedOldReviews = false;
      
      while (page <= maxPages && consecutiveEmptyPages < 2 && !reachedOldReviews) {
        try {
          const reviewsUrl = `https://itunes.apple.com/br/rss/customerreviews/page=${page}/id=${id}/sortby=mostrecent/json`;
          const reviewsResponse = await fetch(reviewsUrl);
          
          if (!reviewsResponse.ok) {
            console.log(`Page ${page} returned ${reviewsResponse.status}`);
            consecutiveEmptyPages++;
            page++;
            continue;
          }
          
          const reviewsData = await reviewsResponse.json();
          const entries = reviewsData.feed?.entry || [];
          
          if (entries.length === 0) {
            console.log(`Page ${page} has no entries`);
            consecutiveEmptyPages++;
            page++;
            continue;
          }
          
          const validEntries = entries.filter((entry) => entry["im:rating"]);
          if (validEntries.length === 0) {
            console.log(`Page ${page} has no valid entries`);
            consecutiveEmptyPages++;
            page++;
            continue;
          }
          
          const pageReviews = validEntries
            .map((entry) => ({
              id: entry.id.label,
              author: entry.author.name.label,
              rating: parseInt(entry["im:rating"].label),
              text: entry.content.label,
              date: entry.updated.label,
              version: entry["im:version"]?.label || null,
            }))
            .filter((review) => {
              const reviewDate = new Date(review.date);
              return reviewDate >= oneYearAgo;
            });
          
          // Check if we're getting old reviews
          if (pageReviews.length === 0 && validEntries.length > 0) {
            console.log(`→ Reached reviews older than 1 year on page ${page}`);
            reachedOldReviews = true;
            break;
          }
          
          allReviews.push(...pageReviews);
          consecutiveEmptyPages = 0; // Reset counter on successful page
          
          console.log(`✓ Page ${page}: +${pageReviews.length} reviews from last 12 months (Total: ${allReviews.length})`);
          
          // If all reviews on this page were filtered out, we might be done
          if (pageReviews.length < validEntries.length) {
            console.log(`→ Found ${validEntries.length - pageReviews.length} reviews older than 1 year`);
            reachedOldReviews = true;
            break;
          }
          
          // If we got fewer than 50 reviews, we're at the end
          if (validEntries.length < 50) {
            console.log(`→ Reached last page (${validEntries.length} < 50 reviews)`);
            break;
          }
          
          page++;
        } catch (err) {
          console.error(`Error fetching page ${page}:`, err);
          consecutiveEmptyPages++;
          page++;
        }
      }
      
      console.log(`✓ Total App Store reviews fetched (last 12 months): ${allReviews.length}`);

      const distribution = [1, 2, 3, 4, 5].map(stars => ({
        stars,
        count: allReviews.filter((r) => r.rating === stars).length,
      }));

      return c.json({
        app: {
          id: String(app.trackId),
          name: app.trackName,
          developer: app.artistName,
          icon: app.artworkUrl512 || app.artworkUrl100,
          store: "App Store",
          storeUrl: app.trackViewUrl,
          averageRating: app.averageUserRating || 0,
          totalReviews: app.userRatingCount || 0,
        },
        reviews: allReviews,
        distribution,
      });
    } else if (store === "playstore") {
      // Google Play - temporarily disabled
      console.log("Google Play is temporarily disabled");
      return c.json({ error: "Google Play support is temporarily unavailable" }, 503);
    }

    return c.json({ error: "Invalid store" }, 400);
  } catch (error) {
    console.error("App details error:", error);
    return c.json({ error: "Failed to fetch app details" }, 500);
  }
});

// Analyze themes using AI
app.post("/make-server-f4aa3b54/analyze-themes", async (c) => {
  try {
    const { reviews } = await c.req.json();
    
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return c.json({ error: "Reviews array is required" }, 400);
    }

    // Check for AI service configuration (OpenAI or Gemini)
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!openaiApiKey && !geminiApiKey) {
      console.error("No AI service configured. Set either OPENAI_API_KEY or GEMINI_API_KEY");
      return c.json({ 
        error: "AI service not configured", 
        message: "Configure GEMINI_API_KEY (gratuito em https://aistudio.google.com/app/apikey) ou OPENAI_API_KEY nas variáveis de ambiente",
        needsSetup: true
      }, 500);
    }

    const useGemini = !!geminiApiKey;
    console.log(`Analyzing ${reviews.length} reviews for themes using ${useGemini ? 'Gemini' : 'OpenAI'}...`);

    // Sample reviews for theme discovery if we have too many
    const sampleSize = Math.min(reviews.length, 100);
    const sampledReviews = reviews
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    // Step 1: Discover themes from sampled reviews
    const reviewsText = sampledReviews.map((r, i) => 
      `${i + 1}. [${r.rating}★] ${r.text.substring(0, 200)}${r.text.length > 200 ? '...' : ''}`
    ).join('\n');
    
    const themeDiscoveryPrompt = `Analise estes reviews de app e identifique os principais temas/tópicos sendo discutidos. Para cada tema, forneça um nome conciso (2-4 palavras em português) e uma breve descrição.

Reviews:
${reviewsText}

Retorne um array JSON com esta estrutura:
[
  {
    "theme": "Nome do Tema",
    "description": "Breve descrição do que este tema cobre"
  }
]

Importante:
- Identifique 5-12 temas significativos
- Temas devem ser específicos e práticos
- Foque no que os usuários estão realmente discutindo
- Use nomes claros e descritivos em português
- Responda APENAS com JSON válido, sem outro texto`;

    let themeDiscoveryResponse;
    
    if (useGemini) {
      // Use Gemini API (v1beta with gemini-2.0-flash-exp)
      themeDiscoveryResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Você é um especialista em análise de feedback de usuários e identificação de temas principais. Sempre responda apenas com JSON válido.\n\n${themeDiscoveryPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        }
      );
    } else {
      // Use OpenAI API
      themeDiscoveryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Você é um especialista em análise de feedback de usuários e identificação de temas principais. Sempre responda apenas com JSON válido."
            },
            {
              role: "user",
              content: themeDiscoveryPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });
    }

    if (!themeDiscoveryResponse.ok) {
      const errorText = await themeDiscoveryResponse.text();
      console.error(`${useGemini ? 'Gemini' : 'OpenAI'} API error during theme discovery:`, themeDiscoveryResponse.status, errorText);
      
      let errorMessage = "Failed to discover themes";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Keep default error message
      }
      
      return c.json({ 
        error: "Failed to discover themes", 
        details: errorMessage,
        status: themeDiscoveryResponse.status 
      }, 500);
    }

    const themeDiscoveryData = await themeDiscoveryResponse.json();
    console.log("Theme discovery response received:", JSON.stringify(themeDiscoveryData).substring(0, 200));
    
    let themesText;
    if (useGemini) {
      // Parse Gemini response
      if (!themeDiscoveryData.candidates || !themeDiscoveryData.candidates[0] || !themeDiscoveryData.candidates[0].content) {
        console.error("Unexpected response format from Gemini:", themeDiscoveryData);
        return c.json({ error: "Unexpected response format from AI service" }, 500);
      }
      themesText = themeDiscoveryData.candidates[0].content.parts[0].text.trim();
    } else {
      // Parse OpenAI response
      if (!themeDiscoveryData.choices || !themeDiscoveryData.choices[0] || !themeDiscoveryData.choices[0].message) {
        console.error("Unexpected response format from OpenAI:", themeDiscoveryData);
        return c.json({ error: "Unexpected response format from AI service" }, 500);
      }
      themesText = themeDiscoveryData.choices[0].message.content.trim();
    }
    
    // Extract JSON from markdown code blocks if present
    let discoveredThemes;
    try {
      console.log("Attempting to parse themes from:", themesText.substring(0, 300));
      const jsonStr = extractJSON(themesText);
      discoveredThemes = JSON.parse(jsonStr);
      
      if (!Array.isArray(discoveredThemes)) {
        console.error("Discovered themes is not an array:", discoveredThemes);
        return c.json({ error: "Invalid theme format returned by AI" }, 500);
      }
      
      // Validate theme structure
      for (const theme of discoveredThemes) {
        if (!theme.theme || !theme.description) {
          console.error("Invalid theme structure:", theme);
          return c.json({ error: "Invalid theme structure returned by AI" }, 500);
        }
      }
    } catch (parseError) {
      console.error("Failed to parse themes JSON:", parseError, "\nOriginal text:", themesText);
      return c.json({ 
        error: "Failed to parse theme discovery results",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        raw: themesText.substring(0, 500)
      }, 500);
    }

    console.log(`Discovered ${discoveredThemes.length} themes:`, discoveredThemes.map(t => t.theme).join(', '));

    // Step 2: Categorize all reviews into discovered themes
    const themeClusters = new Map();
    
    // Initialize theme clusters
    discoveredThemes.forEach(theme => {
      themeClusters.set(theme.theme, {
        theme: theme.theme,
        description: theme.description,
        reviews: [],
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        totalRating: 0,
      });
    });

    // Add "Other" category for reviews that don't fit
    themeClusters.set("Outros", {
      theme: "Outros",
      description: "Reviews que não se encaixam claramente em outras categorias",
      reviews: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      totalRating: 0,
    });

    // Process reviews in batches (reduced batch size for better token management)
    const batchSize = 15;
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      
      const themesListText = discoveredThemes.map((t, idx) => 
        `${idx + 1}. ${t.theme}: ${t.description}`
      ).join('\n');
      
      const reviewsListText = batch.map((r, idx) => 
        `[${idx}] [${r.rating}★] ${r.text.substring(0, 150)}${r.text.length > 150 ? '...' : ''}`
      ).join('\n');
      
      const categorizationPrompt = `Categorize cada review em UM dos temas abaixo. Responda com um array JSON mapeando índices de reviews para nomes de temas.

Temas:
${themesListText}
${discoveredThemes.length + 1}. Outros: Reviews que não se encaixam claramente em outras categorias

Reviews para categorizar:
${reviewsListText}

Responda com array JSON: [{"index": 0, "theme": "Nome do Tema"}, ...]
Responda APENAS com JSON válido, sem outro texto.`;

      let categorizationResponse;
      
      if (useGemini) {
        // Use Gemini API (v1beta with gemini-2.0-flash-exp)
        categorizationResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Você é um especialista em categorizar feedback de usuários. Sempre responda apenas com JSON válido.\n\n${categorizationPrompt}`
                }]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1500,
              },
            }),
          }
        );
      } else {
        // Use OpenAI API
        categorizationResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Você é um especialista em categorizar feedback de usuários. Sempre responda apenas com JSON válido."
              },
              {
                role: "user",
                content: categorizationPrompt
              }
            ],
            temperature: 0.1,
            max_tokens: 1500,
          }),
        });
      }

      if (!categorizationResponse.ok) {
        const errorText = await categorizationResponse.text();
        console.error(`OpenAI API error for batch ${i / batchSize + 1}:`, categorizationResponse.status, errorText);
        // Assign to "Outros" if categorization fails
        batch.forEach(review => {
          const cluster = themeClusters.get("Outros");
          if (cluster) {
            cluster.reviews.push(review);
            cluster.totalRating += review.rating;
            
            if (review.rating >= 4) cluster.sentiment.positive++;
            else if (review.rating === 3) cluster.sentiment.neutral++;
            else cluster.sentiment.negative++;
          }
        });
        continue;
      }

      const categorizationData = await categorizationResponse.json();
      
      let categorizationText;
      if (useGemini) {
        // Parse Gemini response
        if (!categorizationData.candidates || !categorizationData.candidates[0] || !categorizationData.candidates[0].content) {
          console.error(`Unexpected categorization response format for batch ${i / batchSize + 1}:`, categorizationData);
          // Assign to "Outros" if response is invalid
          batch.forEach(review => {
            const cluster = themeClusters.get("Outros");
            if (cluster) {
              cluster.reviews.push(review);
              cluster.totalRating += review.rating;
              
              if (review.rating >= 4) cluster.sentiment.positive++;
              else if (review.rating === 3) cluster.sentiment.neutral++;
              else cluster.sentiment.negative++;
            }
          });
          continue;
        }
        categorizationText = categorizationData.candidates[0].content.parts[0].text.trim();
      } else {
        // Parse OpenAI response
        if (!categorizationData.choices || !categorizationData.choices[0] || !categorizationData.choices[0].message) {
          console.error(`Unexpected categorization response format for batch ${i / batchSize + 1}:`, categorizationData);
          // Assign to "Outros" if response is invalid
          batch.forEach(review => {
            const cluster = themeClusters.get("Outros");
            if (cluster) {
              cluster.reviews.push(review);
              cluster.totalRating += review.rating;
              
              if (review.rating >= 4) cluster.sentiment.positive++;
              else if (review.rating === 3) cluster.sentiment.neutral++;
              else cluster.sentiment.negative++;
            }
          });
          continue;
        }
        categorizationText = categorizationData.choices[0].message.content.trim();
      }
      
      try {
        const jsonStr = extractJSON(categorizationText);
        
        // Validate JSON completeness before parsing
        if (!jsonStr.trim().endsWith(']') && !jsonStr.trim().endsWith('}')) {
          console.warn(`Incomplete JSON response for batch ${i / batchSize + 1}. Assigning to "Outros".`);
          batch.forEach(review => {
            const cluster = themeClusters.get("Outros");
            if (cluster) {
              cluster.reviews.push(review);
              cluster.totalRating += review.rating;
              
              if (review.rating >= 4) cluster.sentiment.positive++;
              else if (review.rating === 3) cluster.sentiment.neutral++;
              else cluster.sentiment.negative++;
            }
          });
          continue;
        }
        
        const categorizations = JSON.parse(jsonStr);
        
        if (!Array.isArray(categorizations)) {
          console.error(`Categorization result is not an array for batch ${i / batchSize + 1}`);
          batch.forEach(review => {
            const cluster = themeClusters.get("Outros");
            if (cluster) {
              cluster.reviews.push(review);
              cluster.totalRating += review.rating;
              
              if (review.rating >= 4) cluster.sentiment.positive++;
              else if (review.rating === 3) cluster.sentiment.neutral++;
              else cluster.sentiment.negative++;
            }
          });
          continue;
        }
        
        categorizations.forEach(cat => {
          const review = batch[cat.index];
          if (!review) {
            console.warn(`Review not found at index ${cat.index} in batch ${i / batchSize + 1}`);
            return;
          }
          
          let themeName = cat.theme;
          let cluster = themeClusters.get(themeName);
          
          // If theme not found, try to match partial or assign to Outros
          if (!cluster) {
            const matchingTheme = discoveredThemes.find(t => 
              t.theme.toLowerCase().includes(themeName.toLowerCase()) ||
              themeName.toLowerCase().includes(t.theme.toLowerCase())
            );
            
            if (matchingTheme) {
              cluster = themeClusters.get(matchingTheme.theme);
            } else {
              cluster = themeClusters.get("Outros");
            }
          }
          
          if (cluster) {
            cluster.reviews.push(review);
            cluster.totalRating += review.rating;
            
            if (review.rating >= 4) cluster.sentiment.positive++;
            else if (review.rating === 3) cluster.sentiment.neutral++;
            else cluster.sentiment.negative++;
          }
        });
      } catch (parseError) {
        console.error(`Failed to parse categorization for batch ${i / batchSize + 1}:`, parseError, "\nText:", categorizationText.substring(0, 500));
        // Assign to "Outros" if parsing fails
        batch.forEach(review => {
          const cluster = themeClusters.get("Outros");
          if (cluster) {
            cluster.reviews.push(review);
            cluster.totalRating += review.rating;
            
            if (review.rating >= 4) cluster.sentiment.positive++;
            else if (review.rating === 3) cluster.sentiment.neutral++;
            else cluster.sentiment.negative++;
          }
        });
      }

      console.log(`Processed batch ${i / batchSize + 1}/${Math.ceil(reviews.length / batchSize)}`);
    }

    // Convert to array and calculate averages
    const result = Array.from(themeClusters.values())
      .filter(cluster => cluster.reviews.length > 0)
      .map(cluster => ({
        theme: cluster.theme,
        description: cluster.description,
        count: cluster.reviews.length,
        sentiment: cluster.sentiment,
        avgRating: cluster.reviews.length > 0 ? cluster.totalRating / cluster.reviews.length : 0,
        reviews: cluster.reviews,
      }))
      .sort((a, b) => b.count - a.count);

    console.log(`✓ Theme analysis complete: ${result.length} themes identified`);
    
    return c.json({ themes: result });
  } catch (error) {
    console.error("Theme analysis error:", error);
    return c.json({ error: "Failed to analyze themes" }, 500);
  }
});

Deno.serve(app.fetch);
