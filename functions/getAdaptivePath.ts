import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Data
        const [skills, mastery] = await Promise.all([
            base44.entities.Skills.filter({ isActive: true }),
            base44.entities.SkillMastery.filter({ userId: user.id })
        ]);

        const masteryMap = new Map(mastery.map(m => [m.skillId, m]));

        // 2. Prepare Context for AI
        const profileSummary = skills.map(s => {
            const m = masteryMap.get(s.id);
            return {
                id: s.id,
                name: s.name,
                domain: s.domain,
                score: m ? m.masteryScore : 0,
                lastPracticed: m ? m.lastSeenAt : "never"
            };
        });

        // 3. AI Analysis
        const prompt = `
        Analyze this student's math mastery profile (K-6 level) and recommend a personalized practice path.
        
        Profile:
        ${JSON.stringify(profileSummary)}

        Task:
        Select exactly 3 specific skills to practice next.
        1. "Reinforcement": A skill with low score (<50) or not practiced recently.
        2. "Progression": The next logical skill to learn (unlocked or 0 score).
        3. "Challenge": A mastered skill (>80) to test deeper understanding.

        If the user is new (all 0s), recommend the first 3 logical skills (e.g. Counting, Addition).

        Return JSON matching this schema:
        {
            "recommendations": [
                {
                    "type": "reinforcement" | "progression" | "challenge",
                    "skillId": "id from profile",
                    "reason": "Short, encouraging message for a child (e.g. 'Let's polish this up!')",
                    "label": "Display Label (e.g. 'Warm Up', 'Up Next', 'Challenge')"
                }
            ]
        }
        `;

        const aiRes = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                skillId: { type: "string" },
                                reason: { type: "string" },
                                label: { type: "string" }
                            },
                            required: ["type", "skillId", "reason", "label"]
                        }
                    }
                },
                required: ["recommendations"]
            }
        });

        // 4. Merge with Skill Details
        // The AI returns skillId, but frontend might need full skill object
        const recommendations = aiRes.recommendations.map(rec => {
            const skill = skills.find(s => s.id === rec.skillId);
            return {
                ...rec,
                skillName: skill ? skill.name : "Math Practice",
                domain: skill ? skill.domain : "General"
            };
        });

        return Response.json({ recommendations });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});