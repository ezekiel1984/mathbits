import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { questionText, steps, gradeLevel, userAnswer } = await req.json();

        const prompt = `
        You are a gentle, encouraging math tutor for a child in grade ${gradeLevel || 'K'}.
        
        The Problem: "${questionText}"
        ${userAnswer ? `The Student's Wrong Answer: "${userAnswer}"` : ''}
        
        Task: Explain the underlying concept to help them fix their mistake.
        - If they gave a wrong answer, gently explain why that might be (e.g. "It looks like you might have added instead of subtracted?").
        - Use concrete visual language (blocks, apples, number lines).
        - Do NOT give the final answer.
        - Keep it to 3 short, simple sentences maximum.
        - Be supportive and calm.

        Current known steps context: ${JSON.stringify(steps)}

        Format as a JSON array of strings (each string is one sentence/step).
        `;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    explanation: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({ explanation: response.explanation });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});