import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch all active skills
        const skills = await base44.entities.Skills.filter({ isActive: true });
        if (!skills.length) {
            return Response.json({ error: "No active skills found" }, { status: 404 });
        }

        // 2. Fetch user's mastery
        const masteryRecords = await base44.entities.SkillMastery.filter({ userId: user.id });
        const masteryMap = new Map(masteryRecords.map(m => [m.skillId, m]));

        // 3. Algorithm: Calculate Priority Score
        const now = new Date();
        const scoredSkills = skills.map(skill => {
            const mastery = masteryMap.get(skill.id);
            const score = mastery ? mastery.masteryScore : 0;
            const lastSeen = mastery ? new Date(mastery.lastSeenAt) : new Date(0); 
            
            const diffTime = Math.abs(now - lastSeen);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // "Staleness" factor
            const effectiveScore = score - (diffDays * 2);
            
            return {
                ...skill,
                effectiveScore,
                realScore: score
            };
        });

        // Sort by effective score ASC
        scoredSkills.sort((a, b) => a.effectiveScore - b.effectiveScore);

        // Pick top candidate
        const topCandidates = scoredSkills.slice(0, 3);
        const selectedSkill = topCandidates[Math.floor(Math.random() * topCandidates.length)];

        // 4. Determine Difficulty
        let targetDifficulty = 1;
        if (selectedSkill.realScore >= 90) targetDifficulty = 4;
        else if (selectedSkill.realScore >= 60) targetDifficulty = 3;
        else if (selectedSkill.realScore >= 30) targetDifficulty = 2;

        // 5. Fetch Question
        let questions = await base44.entities.Questions.filter({ 
            skillId: selectedSkill.id,
            difficulty: targetDifficulty 
        });

        if (!questions.length) {
            questions = await base44.entities.Questions.filter({ skillId: selectedSkill.id });
        }

        // Fallback to legacy
        if (!questions.length) {
             const legacyProblems = await base44.entities.MathProblem.list();
             return Response.json(legacyProblems.sort(() => 0.5 - Math.random()).slice(0, 10));
        }

        // Pick 10 random questions for a full session
        const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

        // 6. Map to Game.js format
        const mappedQuestions = shuffled.map(q => {
            const numberMatch = q.promptText.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/);
            const num1 = numberMatch ? parseInt(numberMatch[1]) : 0;
            const num2 = numberMatch ? parseInt(numberMatch[2]) : 0;

            let visualType = 'blocks';
            if (selectedSkill.domain === 'Add') visualType = 'apples';
            if (selectedSkill.domain === 'Sub') visualType = 'stars';
            if (selectedSkill.domain === 'Mul') visualType = 'numbers';

            let steps = [];
            try {
                steps = q.hintStepChain ? JSON.parse(q.hintStepChain) : [];
            } catch (e) {
                if (q.hintStepChain) steps = [q.hintStepChain];
            }
            
            let choices = [];
            try {
                choices = q.choices ? JSON.parse(q.choices) : [];
            } catch (e) {
                // ignore
            }

            return {
                id: q.id,
                skillId: selectedSkill.id,
                type: q.questionType, 
                derivedType: selectedSkill.domain?.toLowerCase() || 'addition',
                
                question_text: q.promptText,
                difficulty: q.difficulty,
                visual_type: visualType,
                number_1: num1,
                number_2: num2,
                answer: q.correctAnswer, // Keep as string for comparison
                steps: steps,
                choices: choices
            };
        });
        
        const finalQuestions = mappedQuestions.map(q => {
            if (q.derivedType.includes('add')) q.derivedType = 'addition';
            else if (q.derivedType.includes('sub')) q.derivedType = 'subtraction';
            else if (q.derivedType.includes('mul')) q.derivedType = 'multiplication';
            else if (q.derivedType.includes('div')) q.derivedType = 'division';
            else q.derivedType = 'addition';
            return q;
        });

        return Response.json(finalQuestions);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});