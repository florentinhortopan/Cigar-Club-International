# Open Notebook Integration Guide

Complete guide for integrating [Open Notebook](https://github.com/lfnovo/open-notebook) with Humidor Club for AI-powered natural language database interactions.

---

## 🎯 Overview

Open Notebook provides an intelligent interface to query your SurrealDB database using natural language, making it perfect for mobile users who want to ask questions about their cigar collection without complex queries.

### Use Cases

1. **Personal Assistant**: "What cigars do I have that pair well with espresso?"
2. **Market Intelligence**: "Show me all Padrón listings under $400"
3. **Discovery**: "Recommend a full-bodied Nicaraguan cigar based on my ratings"
4. **Analysis**: "What's my average rating for Cuban cigars?"
5. **Inventory**: "How many Davidoff cigars are in my humidor?"

---

## 🚀 Setup

### 1. Install Open Notebook

```bash
# Clone Open Notebook
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook

# Install dependencies
pip install -r requirements.txt

# Or use Docker
docker pull lfnovo/open-notebook:latest
```

### 2. Configure for SurrealDB

```bash
# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
# Database Connection
DATABASE_TYPE=surrealdb
SURREALDB_URL=ws://localhost:8000/rpc
SURREALDB_NAMESPACE=humidor_club
SURREALDB_DATABASE=production
SURREALDB_USER=root
SURREALDB_PASS=root

# API Configuration
API_PORT=8080
API_HOST=0.0.0.0

# LLM Provider (Choose one)
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Vector Database (for embeddings)
VECTOR_DB=chroma
CHROMA_HOST=localhost
CHROMA_PORT=8001

# Open Notebook Settings
MAX_RESULTS=50
ENABLE_STREAMING=true
```

### 3. Start Open Notebook

```bash
# Start the API server
python run_api.py

# Or with Docker
docker run -p 8080:8080 \
  -e SURREALDB_URL=ws://surrealdb:8000/rpc \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  lfnovo/open-notebook:latest
```

---

## 🔌 Integration with Humidor Club

### Install SDK

```bash
cd humidor-club
pnpm add axios
```

### Create Integration Client

```typescript
// lib/open-notebook-client.ts
import axios, { AxiosInstance } from 'axios';

export interface NotebookQuery {
  prompt: string;
  userId: string;
  context?: Record<string, any>;
}

export interface NotebookResponse {
  answer: string;
  sql?: string;
  results?: any[];
  metadata?: {
    execution_time: number;
    tokens_used: number;
  };
}

class OpenNotebookClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.OPEN_NOTEBOOK_URL || 'http://localhost:8080') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async query(params: NotebookQuery): Promise<NotebookResponse> {
    const response = await this.client.post('/api/query', {
      prompt: params.prompt,
      context: {
        user_id: params.userId,
        role: 'cigar_club_member',
        instructions: `
          You are an expert cigar sommelier and personal assistant for a private cigar club.
          
          Database Schema Context:
          - brands: Cigar manufacturers (Padrón, Davidoff, etc.)
          - lines: Product series (1926 Series, Winston Churchill)
          - cigars: Specific vitolas with ring gauge, length, wrapper, strength
          - releases: Production batches with box codes and dates
          - humidor_items: User's personal collection
          - tasting_notes: User ratings and detailed smoke experiences
          - listings: Marketplace items (WTS/WTB/WTT)
          - comps: Comparable sales for valuation
          
          Terminology:
          - Vitola = shape/size (Robusto, Toro, Churchill)
          - Ring gauge = diameter in 64ths of an inch
          - Wrapper = outer leaf visible on the cigar
          - Strength = nicotine intensity (Mild, Medium, Full)
          - Body = flavor intensity (Light, Medium, Full)
          
          When answering:
          1. Use proper cigar terminology
          2. Reference the user's humidor and tasting notes when relevant
          3. Consider market data from comps and listings
          4. Provide actionable recommendations
          5. Format currency properly (e.g., $125.00)
          6. Always be respectful of cigar culture and traditions
        `,
        ...params.context,
      },
    });

    return response.data;
  }

  async streamQuery(params: NotebookQuery, onChunk: (chunk: string) => void): Promise<void> {
    const response = await this.client.post(
      '/api/query/stream',
      {
        prompt: params.prompt,
        context: { user_id: params.userId },
      },
      {
        responseType: 'stream',
      }
    );

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        onChunk(chunk.toString());
      });

      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  }

  async getContext(userId: string): Promise<Record<string, any>> {
    const response = await this.client.get(`/api/context/${userId}`);
    return response.data;
  }
}

export const openNotebook = new OpenNotebookClient();
```

---

## 📱 Mobile Chat Interface

### Chat Hook

```typescript
// hooks/use-notebook-chat.ts
'use client';

import { useState, useCallback } from 'react';
import { openNotebook, type NotebookResponse } from '@/lib/open-notebook-client';
import { useSession } from 'next-auth/react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    sql?: string;
    results?: any[];
  };
}

export function useNotebookChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!session?.user?.id) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsLoading(true);

      try {
        const response = await openNotebook.query({
          prompt,
          userId: session.user.id,
        });

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
          metadata: {
            sql: response.sql,
            results: response.results,
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I apologize, but I'm having trouble processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
  };
}
```

### Mobile Chat Component

```tsx
// components/features/chat/notebook-chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useNotebookChat } from '@/hooks/use-notebook-chat';
import { cn } from '@/lib/utils';

export function NotebookChat() {
  const { messages, sendMessage, isLoading } = useNotebookChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(input);
    setInput('');
  };

  const quickActions = [
    "What's in my humidor?",
    "Find deals",
    "Recommend a cigar",
    "My ratings",
    "Market trends",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Cigar Assistant</h2>
            <p className="text-xs text-muted-foreground">Ask me anything about cigars</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome to your Cigar Assistant</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Ask me about your collection, find deals, or get recommendations
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse">●</div>
                <div className="animate-pulse animation-delay-200">●</div>
                <div className="animate-pulse animation-delay-400">●</div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Quick Actions - Only show when no messages */}
      {messages.length === 0 && (
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(action);
                  sendMessage(action);
                }}
                className="text-xs"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your cigars..."
            disabled={isLoading}
            className="flex-1 min-h-[44px]"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="min-h-[44px] min-w-[44px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <Card
        className={cn(
          'max-w-[85%] p-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.metadata?.results && message.metadata.results.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs opacity-70 mb-1">Found {message.metadata.results.length} results</p>
            {/* Show preview of results */}
          </div>
        )}
        <p className="text-xs opacity-50 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </Card>
    </div>
  );
}
```

---

## 🔍 Example Queries

### Personal Collection

```typescript
// "What Padrón cigars do I have?"
const response = await openNotebook.query({
  prompt: "What Padrón cigars do I have in my humidor?",
  userId: user.id,
});

// Expected SQL generated:
// SELECT * FROM humidor_item 
// WHERE user = $auth.id 
// AND cigar.line.brand.name = "Padrón";
```

### Recommendations

```typescript
// "Recommend a cigar based on my preferences"
const response = await openNotebook.query({
  prompt: "Recommend a full-bodied cigar I haven't tried yet, based on my 5-star ratings",
  userId: user.id,
});

// Expected SQL generated:
// SELECT cigar.*, math::mean(tasting_note.rating) as avg_rating
// FROM cigar
// WHERE cigar.strength = "Full"
// AND cigar NOT IN (SELECT cigar FROM tasting_note WHERE user = $auth.id)
// AND cigar.body IN (
//   SELECT DISTINCT cigar.body FROM tasting_note 
//   WHERE user = $auth.id AND rating = 5
// )
// ORDER BY avg_rating DESC LIMIT 10;
```

### Market Analysis

```typescript
// "Show me undervalued Padrón 1926 listings"
const response = await openNotebook.query({
  prompt: "Are there any Padrón 1926 Series listings priced below market average?",
  userId: user.id,
});

// Expected SQL generated:
// SELECT listing.*, 
//   (SELECT math::mean(price_cents) FROM comp WHERE release = listing.release) as market_avg
// FROM listing
// WHERE status = "ACTIVE"
// AND cigar.line.brand.name = "Padrón"
// AND cigar.line.name CONTAINS "1926"
// AND price_cents < (SELECT math::mean(price_cents) FROM comp WHERE release = listing.release) * 0.85;
```

---

## 🎨 Mobile UI Integration

### Add to Bottom Navigation

```tsx
// components/common/layout/bottom-navigation.tsx
import { Home, Search, MessageCircle, Package, User } from 'lucide-react';

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-background safe-area-pb">
      <div className="flex items-center justify-around h-16">
        <NavItem href="/dashboard" icon={Home} label="Home" />
        <NavItem href="/discover" icon={Search} label="Discover" />
        <NavItem href="/chat" icon={MessageCircle} label="Assistant" />
        <NavItem href="/humidor" icon={Package} label="Humidor" />
        <NavItem href="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  );
}
```

### Floating Action Button (FAB)

```tsx
// components/common/chat-fab.tsx
'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { NotebookChat } from '@/components/features/chat/notebook-chat';

export function ChatFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <NotebookChat />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

---

## 🔧 Advanced Configuration

### Custom Context Provider

```typescript
// lib/notebook-context.ts
export async function getNotebookContext(userId: string) {
  // Fetch user's recent activity and preferences
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const recentNotes = await prisma.tastingNote.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    user: {
      id: user.id,
      reputation: user.reputation,
      role: user.role,
    },
    preferences: {
      favorite_strengths: getFavoriteStrengths(recentNotes),
      favorite_brands: getFavoriteBrands(recentNotes),
      avg_rating: getAverageRating(recentNotes),
    },
    recent_activity: recentNotes.map((note) => ({
      cigar: note.cigarId,
      rating: note.rating,
      date: note.createdAt,
    })),
  };
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 queries per minute
});

export async function checkNotebookRateLimit(userId: string): Promise<boolean> {
  const { success } = await ratelimit.limit(`notebook:${userId}`);
  return success;
}
```

---

## 📊 Monitoring

### Track Query Performance

```typescript
// lib/analytics.ts
export async function trackNotebookQuery(
  userId: string,
  query: string,
  executionTime: number,
  success: boolean
) {
  await prisma.event.create({
    data: {
      name: 'notebook_query',
      userId,
      properties: {
        query,
        executionTime,
        success,
        timestamp: new Date(),
      },
    },
  });
}
```

---

## 🚀 Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  surrealdb:
    image: surrealdb/surrealdb:latest
    ports:
      - "8000:8000"
    command: start --log info --user root --pass root file://data/database.db
    volumes:
      - ./data:/data

  open-notebook:
    image: lfnovo/open-notebook:latest
    ports:
      - "8080:8080"
    environment:
      - SURREALDB_URL=ws://surrealdb:8000/rpc
      - SURREALDB_NAMESPACE=humidor_club
      - SURREALDB_DATABASE=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - surrealdb

  humidor-club:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SURREALDB_URL=ws://surrealdb:8000/rpc
      - OPEN_NOTEBOOK_URL=http://open-notebook:8080
    depends_on:
      - surrealdb
      - open-notebook
```

---

## 📚 Resources

- **Open Notebook Repo**: https://github.com/lfnovo/open-notebook
- **SurrealDB Docs**: https://surrealdb.com/docs
- **Documentation**: `/docs/ARCHITECTURE_UPDATED.md`

---

**With Open Notebook integrated, your users can interact with their cigar collection using natural language!** 🚀

