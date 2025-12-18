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
        // Priority = MasteryScore - (DaysSinceLastSeen * 5)
        // Lower Priority score = Higher need to practice
        const now = new Date();
        const scoredSkills = skills.map(skill => {
            const mastery = masteryMap.get(skill.id);
            const score = mastery ? mastery.masteryScore : 0;
            const lastSeen = mastery ? new Date(mastery.lastSeenAt) : new Date(0); // 1970 if never seen
            
            const diffTime = Math.abs(now - lastSeen);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            // "Staleness" factor: every day unseen reduces effective mastery by 2 points
            const effectiveScore = score - (diffDays * 2);
            
            return {
                ...skill,
                effectiveScore,
                realScore: score
            };
        });

        // Sort by effective score ASC (lowest first)
        scoredSkills.sort((a, b) => a.effectiveScore - b.effectiveScore);

        // Pick top candidate (or random among top 3 to vary it slightly)
        const topCandidates = scoredSkills.slice(0, 3);
        const selectedSkill = topCandidates[Math.floor(Math.random() * topCandidates.length)];

        // 4. Determine Difficulty
        // < 30 mastery -> Diff 1
        // < 60 mastery -> Diff 2
        // < 90 mastery -> Diff 3
        // >= 90 mastery -> Diff 4/5
        let targetDifficulty = 1;
        if (selectedSkill.realScore >= 90) targetDifficulty = 4;
        else if (selectedSkill.realScore >= 60) targetDifficulty = 3;
        else if (selectedSkill.realScore >= 30) targetDifficulty = 2;

        // 5. Fetch Question
        // Try to get questions for this skill and difficulty
        // Note: Questions entity might rely on string difficulty or int, schema says int 1-5
        let questions = await base44.entities.Questions.filter({ 
            skillId: selectedSkill.id,
            difficulty: targetDifficulty 
        });

        // Fallback: if no questions at exact difficulty, try any difficulty for this skill
        if (!questions.length) {
            questions = await base44.entities.Questions.filter({ skillId: selectedSkill.id });
        }

        // Fallback 2: if still no questions, return error or mock?
        // Let's grab questions from the legacy MathProblem table as a desperate fallback if Questions table is empty
        if (!questions.length) {
             const legacyProblems = await base44.entities.MathProblem.list();
             // Just return 5 random legacy problems to keep app working
             return Response.json(legacyProblems.sort(() => 0.5 - Math.random()).slice(0, 5));
        }

        // Pick random questions (batch of 5 for a session)
        const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 5);

        // 6. Map to Game.js format
        const mappedQuestions = shuffled.map(q => {
            // Regex to parse numbers for visual counters: "5 + 3" or "10 - 2"
            const numberMatch = q.promptText.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/);
            const num1 = numberMatch ? parseInt(numberMatch[1]) : 0;
            const num2 = numberMatch ? parseInt(numberMatch[2]) : 0;

            // Map visual type based on domain
            let visualType = 'blocks';
            if (selectedSkill.domain === 'Add') visualType = 'apples';
            if (selectedSkill.domain === 'Sub') visualType = 'stars';
            if (selectedSkill.domain === 'Mul') visualType = 'numbers';

            let steps = [];
            try {
                steps = q.hintStepChain ? JSON.parse(q.hintStepChain) : [];
            } catch (e) {
                // If text, use as single step
                if (q.hintStepChain) steps = [q.hintStepChain];
            }

            return {
                id: q.id,
                type: q.questionType, // 'multipleChoice' etc. Game.js handles 'addition' etc. better from legacy.
                // We might need to map questionType to legacy types if Game.js relies on them for logic
                // Actually Game.js uses 'type' for visual count logic: subtraction, multiplication.
                // We should infer 'type' from skill domain if possible.
                derivedType: selectedSkill.domain?.toLowerCase() || 'addition', // e.g. 'add' -> 'addition'
                
                question_text: q.promptText,
                difficulty: q.difficulty,
                visual_type: visualType,
                number_1: num1,
                number_2: num2,
                answer: parseInt(q.correctAnswer), // Assuming numeric answer for now
                steps: steps
            };
        });
        
        // Fix derivedType to match Game.js expectations ('addition', 'subtraction', 'multiplication')
        const finalQuestions = mappedQuestions.map(q => {
            if (q.derivedType.includes('add')) q.type = 'addition';
            else if (q.derivedType.includes('sub')) q.type = 'subtraction';
            else if (q.derivedType.includes('mul')) q.type = 'multiplication';
            else if (q.derivedType.includes('div')) q.type = 'division';
            else q.type = 'addition'; // default
            return q;
        });

        return Response.json(finalQuestions);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});