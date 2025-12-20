import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // SECURITY: Use authenticated user ID
        const actingUserId = user.id;

        // 0. Check for specific skill request
        const { skillId } = await req.json().catch(() => ({}));

        // 1. Fetch all active skills
        const skills = await base44.entities.Skills.filter({ isActive: true });
        if (!skills.length) {
            return Response.json({ error: "No active skills found" }, { status: 404 });
        }

        // 2. Fetch user's mastery
        const masteryRecords = await base44.entities.SkillMastery.filter({ userId: actingUserId });
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

        // Pick top candidate OR forced skill
        let selectedSkill;
        if (skillId) {
            selectedSkill = skills.find(s => s.id === skillId);
            // If requested skill not found, fall back to algorithm
            if (!selectedSkill) {
                const topCandidates = scoredSkills.slice(0, 3);
                selectedSkill = topCandidates[Math.floor(Math.random() * topCandidates.length)];
            } else {
                // Attach real score for difficulty calc
                const m = masteryMap.get(skillId);
                selectedSkill.realScore = m ? m.masteryScore : 0;
            }
        } else {
            const topCandidates = scoredSkills.slice(0, 3);
            selectedSkill = topCandidates[Math.floor(Math.random() * topCandidates.length)];
        }

        // 4. Determine Difficulty (Adaptive & Gentle)
        // Slow down progression:
        // < 25: Level 1
        // 25 - 50: Level 2
        // 50 - 75: Level 3
        // > 75: Level 4 (if exists)
        let targetDifficulty = 1;
        if (selectedSkill.realScore >= 75) targetDifficulty = 4;
        else if (selectedSkill.realScore >= 50) targetDifficulty = 3;
        else if (selectedSkill.realScore >= 25) targetDifficulty = 2;

        // Check for recent struggles (Adaptive Drop)
        // Query last 3 attempts for this skill
        const recentAttempts = await base44.entities.Attempts.filter({ 
            userId: actingUserId, 
            skillId: selectedSkill.id 
        }, '-created_date', 3);

        const recentErrors = recentAttempts.filter(a => !a.isCorrect).length;
        // If 2 or more recent errors, drop difficulty or stay low
        if (recentErrors >= 2) {
             targetDifficulty = Math.max(1, targetDifficulty - 1);
        }

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

        // Pick 10 random questions
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
                answer: q.correctAnswer, 
                steps: steps,
                choices: choices,
                // Adaptive UX: Force Step-Chain if difficulty was lowered due to errors
                forceStepChain: recentErrors >= 2 
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