import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, instructions } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Brak treści emaila' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Brak klucza OPENAI_API_KEY w .env' }, { status: 500 });
    }

    const systemPrompt = `Jesteś ekspertem od copywritingu i cold emaili. 
Twoim zadaniem jest poprawa i sformatowanie treści emaila zgodnie z wytycznymi użytkownika.
Zwróć TYLKO poprawioną treść emaila w formacie HTML, bez żadnych komentarzy ani objaśnień.
Zachowaj wszelkie placeholdery (np. {{name}}, {{company}}).`;

    const userPrompt = `Treść emaila do poprawy:\n${content}\n\n${
      instructions ? `Wytyczne dotyczące stylu i formatowania:\n${instructions}` : 'Popraw gramatykę, styl i formatowanie.'
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1,
        max_completion_tokens: 20000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || 'Błąd OpenAI' }, { status: 500 });
    }

    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ improved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
