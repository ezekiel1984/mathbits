import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { questionText, steps, gradeLevel } = await req.json();

        const prompt = `
        You are a gentle, encouraging math tutor for a child in grade ${gradeLevel || 'K'}.
        Explain how to solve this problem: "${questionText}"
        
        Current known steps: ${JSON.stringify(steps)}

        Rules:
        1. Provide exactly 3 short, simple sentences.
        2. Use concrete visual language (e.g., "imagine blocks", "groups of apples", "number line").
        3. Do NOT give the final answer.
        4. Be extremely concise and calm.
        5. Format as a JSON array of strings.
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