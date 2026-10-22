import { analyzeSentiment } from './sentiment-analyzer';
import { functionsBaseUrl, supabaseHeaders } from '@/clients/supabase';

export interface WordCluster {
  word: string;
  count: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  reviews: Array<{ id: string; text: string; rating: number }>;
}

export interface TopicCluster {
  topic: string;
  keywords: string[];
  count: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  avgRating: number;
  reviews: Array<{ id: string; text: string; rating: number }>;
}

export interface PhraseCluster {
  phrase: string;
  count: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  avgRating: number;
  reviews: Array<{ id: string; text: string; rating: number }>;
}

export interface ThemeCluster {
  theme: string;
  description: string;
  count: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  avgRating: number;
  reviews: Array<{ id: string; text: string; rating: number; version?: string }>;
}

export interface ThemeAnalysisResponse {
  themes: ThemeCluster[];
}

// Common stopwords in Portuguese and English
const STOPWORDS = new Set([
  'o', 'a', 'de', 'da', 'do', 'em', 'um', 'uma', 'os', 'as', 'dos', 'das', 'para', 'com', 'por',
  'é', 'que', 'não', 'e', 'no', 'na', 'se', 'mais', 'muito', 'bem', 'mas', 'como', 'quando',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'app', 'aplicativo', 'this', 'that', 'it', 'its'
]);

export function extractWordClusters(
  reviews: Array<{ id: string; text: string; rating: number }>
): WordCluster[] {
  const wordMap = new Map<string, WordCluster>();

  reviews.forEach(review => {
    const words = review.text
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !STOPWORDS.has(word));

    const sentiment = analyzeSentiment(review.text, review.rating);

    words.forEach(word => {
      if (!wordMap.has(word)) {
        wordMap.set(word, {
          word,
          count: 0,
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          reviews: [],
        });
      }

      const cluster = wordMap.get(word)!;
      cluster.count++;
      cluster.sentiment[sentiment.sentiment]++;
      
      if (cluster.reviews.length < 5) {
        cluster.reviews.push(review);
      }
    });
  });

  return Array.from(wordMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export function extractTopicClusters(
  reviews: Array<{ id: string; text: string; rating: number }>
): TopicCluster[] {
  const topics = {
    'Performance': ['rápido', 'lento', 'desempenho', 'performance', 'demora', 'ágil', 'fluido', 'otimizado', 'pesado', 'consome muita bateria', 'ocupa espaço', 'carregamento', 'leve', 'demora pra abrir', 'tempo de resposta', 'estabilidade', 'travamento', 'fluidez'],
    'Interface': ['interface', 'design', 'aparência', 'visual', 'layout', 'estética', 'ícones', 'cores', 'fonte', 'estilo', 'tema', 'aparência limpa', 'aparência confusa', 'moderno', 'ultrapassado', 'bonito', 'feio', 'intuitivo', 'poluído', 'organização da tela', 'navegação', 'menus', 'experiência visual'],
    'Funcionalidade': ['funcionalidade', 'função', 'recurso', 'ferramenta', 'opção', 'módulo', 'recurso faltando', 'recurso novo', 'completo', 'limitado', 'funcional', 'ineficiente', 'faz o que promete', 'não funciona', 'integração', 'compatibilidade', 'configuração', 'automação', 'recursos úteis', 'recursos desnecessários'],
    'Atualização': ['atualização', 'update', 'versão nova', 'versão antiga', 'melhorou', 'piorou', 'mudou tudo', 'correção', 'novidades', 'patch', 'melhorias', 'atualização recente', 'depois da atualização', 'atualização automática', 'falta atualização', 'atualização constante', 'atualização demorada'],
    'Suporte': ['suporte', 'atendimento', 'ajuda', 'contato', 'resposta', 'demora pra responder', 'equipe', 'desenvolvedor', 'resolveram', 'não resolveram', 'suporte técnico', 'feedback', 'responderam rápido', 'ignoraram', 'chat', 'e-mail', 'ticket', 'assistência', 'comunicação'],
    'Preço': ['preço', 'custo', 'caro', 'barato', 'assinatura', 'pagamento', 'plano', 'gratuito', 'pago', 'vale a pena', 'custo-benefício', 'promoção', 'cobrança', 'mensalidade', 'valor justo', 'valor abusivo', 'renovação automática', 'teste grátis', 'aumento de preço'],
    'Bugs': ['bug', 'erro', 'falha', 'travar', 'travando', 'crash', 'fechar sozinho', 'não abre', 'problema', 'dá erro', 'congelar', 'lentidão', 'glitch', 'comportamento estranho', 'instável', 'corrigir bug', 'cheio de erros', 'problema técnico'],
    'Usabilidade': ['fácil de usar', 'difícil de usar', 'intuitivo', 'confuso', 'prático', 'simples', 'complicado', 'usabilidade', 'experiência do usuário', 'navegação fluida', 'curva de aprendizado', 'rápido de entender', 'interação', 'acessibilidade', 'fluxo', 'confunde', 'ajuda', 'bem pensado', 'mal feito']
  };

  const topicClusters: TopicCluster[] = [];

  Object.entries(topics).forEach(([topic, keywords]) => {
    const matchingReviews: Array<{ id: string; text: string; rating: number }> = [];
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      const lowerText = review.text.toLowerCase();
      const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));

      if (hasKeyword) {
        matchingReviews.push(review);
        totalRating += review.rating;

        const sentiment = analyzeSentiment(review.text, review.rating);
        sentimentCounts[sentiment.sentiment]++;
      }
    });

    if (matchingReviews.length > 0) {
      topicClusters.push({
        topic,
        keywords,
        count: matchingReviews.length,
        sentiment: sentimentCounts,
        avgRating: totalRating / matchingReviews.length,
        reviews: matchingReviews.slice(0, 10),
      });
    }
  });

  return topicClusters.sort((a, b) => b.count - a.count);
}

export function extractPhraseClusters(
  reviews: Array<{ id: string; text: string; rating: number }>
): PhraseCluster[] {
  const phraseMap = new Map<string, PhraseCluster>();

  reviews.forEach(review => {
    // Extract sentences
    const sentences = review.text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10 && s.length < 100);

    const sentiment = analyzeSentiment(review.text, review.rating);

    sentences.forEach(sentence => {
      const normalized = sentence.toLowerCase();
      
      if (!phraseMap.has(normalized)) {
        phraseMap.set(normalized, {
          phrase: sentence,
          count: 0,
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          avgRating: 0,
          reviews: [],
        });
      }

      const cluster = phraseMap.get(normalized)!;
      cluster.count++;
      cluster.sentiment[sentiment.sentiment]++;
      cluster.avgRating = ((cluster.avgRating * (cluster.count - 1)) + review.rating) / cluster.count;
      
      if (cluster.reviews.length < 3) {
        cluster.reviews.push(review);
      }
    });
  });

  return Array.from(phraseMap.values())
    .filter(p => p.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

// Theme analysis is now handled by AI on the server
// This function is deprecated - use the API endpoint instead
export async function extractThemeClusters(
  reviews: Array<{ id: string; text: string; rating: number; version?: string }>
): Promise<ThemeCluster[]> {
  try {
    const response = await fetch(
      `${functionsBaseUrl}/analyze-themes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...supabaseHeaders,
        },
        body: JSON.stringify({ reviews }),
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to analyze themes';
      try {
        const errorData = await response.json();
        console.error('Theme analysis API error:', errorData);
        
        if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Check for specific AI service errors
        if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota') || errorMessage.includes('exceeded your current quota')) {
          errorMessage = '🚨 Cota da OpenAI excedida! Use o Gemini (GRATUITO): Configure GEMINI_API_KEY no Supabase Dashboard. Obtenha em: https://aistudio.google.com/app/apikey';
        } else if (errorMessage.includes('invalid_api_key') || errorMessage.includes('Incorrect API key') || errorMessage.includes('API_KEY_INVALID')) {
          errorMessage = 'Chave da API inválida. Verifique GEMINI_API_KEY ou OPENAI_API_KEY no Supabase Dashboard';
        } else if (errorMessage.includes('rate_limit') || errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
          errorMessage = 'Limite de taxa excedido. Aguarde alguns minutos ou configure GEMINI_API_KEY (gratuita)';
        } else if (errorMessage.includes('not configured') || errorMessage.includes('AI service')) {
          errorMessage = 'Configure GEMINI_API_KEY (gratuito em https://aistudio.google.com/app/apikey) ou OPENAI_API_KEY';
        }
      } catch {
        const errorText = await response.text();
        console.error('Theme analysis API error (raw):', errorText);
      }
      
      throw new Error(errorMessage);
    }

    const data: ThemeAnalysisResponse = await response.json();
    return data.themes;
  } catch (error) {
    console.error('Error calling theme analysis API:', error);
    throw error;
  }
}
