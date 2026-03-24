import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // SECURITY CHECK: Only allow admins to seed content
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        const isAdmin = profiles[0]?.is_admin;

        // Exception: Allow seeding if NO skills exist (first run initialization)
        const existingSkills = await base44.entities.Skills.list({ limit: 1 });
        const isFirstRun = existingSkills.length === 0;

        if (!isAdmin && !isFirstRun) {
            return Response.json({ error: 'Forbidden: Admin access required to seed content' }, { status: 403 });
        }
        
        // Define Skills and their Questions - K-6 Curriculum Aligned
        // Focus: Concrete steps, visual prompts, progressive difficulty
        // Updated based on neurodivergent learning research: Visual first, step-chain enabled, concrete language.
        const seedData = [
            // --- K-1: Foundations ---
            {
                skill: { name: "Counting to 10", domain: "Number", level: 1, description: "Count objects one by one up to 10.", orderIndex: 1 },
                questions: [
                    { t: "How many blocks?", a: "3", type: "multipleChoice", c: ["2", "3", "4"], s: ["Touch each block.", "1... 2... 3."], d: 1 },
                    { t: "Count the stars.", a: "5", type: "numeric", s: ["Point to the stars.", "1, 2, 3, 4, 5."], d: 1 },
                    { t: "How many apples?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["One apple.", "Two apples."], d: 1 },
                    { t: "Count the dots.", a: "4", type: "numeric", s: ["Count carefully.", "1... 2... 3... 4."], d: 1 },
                    { t: "How many cars?", a: "1", type: "numeric", s: ["Just one car."], d: 1 },
                    { t: "How many fingers?", a: "10", type: "numeric", s: ["5 on one hand.", "5 on the other.", "10 fingers total."], d: 2 },
                    { t: "Count the cats.", a: "8", type: "numeric", s: ["4 cats... plus 4 more.", "That makes 8."], d: 2 }
                ]
            },
            {
                skill: { name: "Compare Numbers", domain: "Number", level: 1, description: "Bigger, smaller, equal.", orderIndex: 2 },
                questions: [
                    { t: "Which is bigger?", a: "5", type: "multipleChoice", c: ["3", "5"], s: ["5 blocks is more than 3 blocks."], d: 1 },
                    { t: "Which is smaller?", a: "2", type: "multipleChoice", c: ["2", "8"], s: ["2 dots is less than 8 dots."], d: 1 },
                    { t: "Is 10 bigger than 1?", a: "Yes", type: "multipleChoice", c: ["Yes", "No"], s: ["10 is a big pile.", "1 is just one."], d: 1 }
                ]
            },
            {
                skill: { name: "Shapes", domain: "Geometry", level: 1, description: "Identify basic shapes.", orderIndex: 3 },
                questions: [
                    { t: "Which is round?", a: "Circle", type: "multipleChoice", c: ["Square", "Circle", "Triangle"], s: ["A circle is round like a ball."], d: 1 },
                    { t: "Which has 3 sides?", a: "Triangle", type: "multipleChoice", c: ["Square", "Circle", "Triangle"], s: ["Count the sides: 1, 2, 3.", "Triangle!"], d: 1 },
                    { t: "Which has 4 equal sides?", a: "Square", type: "multipleChoice", c: ["Rectangle", "Square", "Star"], s: ["Look for the box shape.", "All sides same length."], d: 1 }
                ]
            },
            {
                skill: { name: "Add within 5", domain: "Add", level: 1, description: "Putting small groups together.", orderIndex: 4 },
                questions: [
                    { t: "1 block + 1 block = ?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["Start with 1 block.", "Add 1 more block.", "Now you have 2."], d: 1 },
                    { t: "2 + 1 = ?", a: "3", type: "numeric", s: ["Start with 2 dots.", "Add 1 dot.", "1, 2... 3."], d: 1 },
                    { t: "3 + 2 = ?", a: "5", type: "multipleChoice", c: ["4", "5", "6"], s: ["3 blocks.", "Add 2 blocks.", "3... 4, 5."], d: 2 }
                ]
            },
             {
                skill: { name: "Add within 10", domain: "Add", level: 1, description: "Adding up to 10.", orderIndex: 5 },
                questions: [
                    { t: "5 + 1 = ?", a: "6", type: "numeric", s: ["Start with 5.", "Count 1 more.", "6."], d: 1 },
                    { t: "5 + 5 = ?", a: "10", type: "numeric", s: ["5 fingers.", "5 fingers.", "10 fingers total."], d: 2 },
                    { t: "4 + 4 = ?", a: "8", type: "numeric", s: ["Double 4 is 8."], d: 2 }
                ]
            },
            // --- Years 2-3: Building Fluency ---
            {
                skill: { name: "Skip Counting", domain: "Number", level: 2, description: "Count by 2s, 5s, 10s.", orderIndex: 6 },
                questions: [
                    { t: "2, 4, 6, ?", a: "8", type: "multipleChoice", c: ["7", "8", "9"], s: ["We are counting by 2s.", "6 + 2 = 8."], d: 1 },
                    { t: "5, 10, 15, ?", a: "20", type: "numeric", s: ["Count by 5s.", "15... 20."], d: 1 },
                    { t: "10, 20, 30, ?", a: "40", type: "numeric", s: ["Count by 10s.", "3 tens... 4 tens is 40."], d: 1 }
                ]
            },
            {
                skill: { name: "Add within 20", domain: "Add", level: 2, description: "Sums up to 20.", orderIndex: 7 },
                questions: [
                    { t: "10 + 5 = ?", a: "15", type: "numeric", s: ["Start at 10.", "Add 5 ones.", "15."], d: 1 },
                    { t: "9 + 2 = ?", a: "11", type: "numeric", s: ["9 is almost 10.", "Take 1 from the 2 to make 10.", "10 + 1 = 11."], d: 2 },
                    { t: "8 + 8 = ?", a: "16", type: "numeric", s: ["Double 8 is 16."], d: 2 }
                ]
            },
            {
                skill: { name: "Intro to Multiplication", domain: "Mul", level: 2, description: "Groups of numbers.", orderIndex: 8 },
                questions: [
                    { t: "2 groups of 2", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["2 blocks + 2 blocks.", "That makes 4."], d: 1 },
                    { t: "3 groups of 5", a: "15", type: "numeric", s: ["Count by 5s three times.", "5, 10, 15."], d: 2 },
                    { t: "2 x 3 = ?", a: "6", type: "numeric", s: ["Two groups of 3.", "3 + 3 = 6."], d: 2 }
                ]
            },
            {
                skill: { name: "Simple Fractions", domain: "Fractions", level: 2, description: "Halves and Quarters.", orderIndex: 9 },
                questions: [
                    { t: "Half of 2 is?", a: "1", type: "numeric", s: ["Share 2 cookies between 2 friends.", "Each gets 1."], d: 1 },
                    { t: "Half of 10 is?", a: "5", type: "numeric", s: ["5 + 5 = 10.", "So half is 5."], d: 2 },
                    { t: "Which shows 1/2?", a: "1 part of 2", type: "multipleChoice", c: ["1 part of 2", "1 part of 3"], s: ["One out of two pieces."], d: 1 }
                ]
            },
            // --- Years 4-6: Advanced ---
            {
                skill: { name: "Multiplication Facts", domain: "Mul", level: 3, description: "Fluency with tables.", orderIndex: 10 },
                questions: [
                    { t: "3 x 3 = ?", a: "9", type: "numeric", s: ["3 groups of 3.", "3, 6, 9."], d: 1 },
                    { t: "4 x 5 = ?", a: "20", type: "numeric", s: ["Count by 5s four times.", "5, 10, 15, 20."], d: 2 },
                    { t: "6 x 2 = ?", a: "12", type: "numeric", s: ["Double 6 is 12."], d: 1 },
                    { t: "7 x 3 = ?", a: "21", type: "numeric", s: ["7, 14, 21."], d: 3 }
                ]
            },
            {
                skill: { name: "Arrays and Area", domain: "Mul", level: 3, description: "Visualizing multiplication.", orderIndex: 11 },
                questions: [
                    { t: "Array: 2 rows of 3.", a: "6", type: "numeric", s: ["Count the dots.", "3 + 3 = 6."], d: 1 },
                    { t: "Rectangle 4 by 2. Area?", a: "8", type: "numeric", s: ["4 squares + 4 squares.", "8 squares total."], d: 2 }
                ]
            },
            {
                skill: { name: "Simple Division", domain: "Div", level: 3, description: "Sharing equally.", orderIndex: 12 },
                questions: [
                    { t: "10 shared by 2", a: "5", type: "numeric", s: ["Split 10 in half.", "5."], d: 1 },
                    { t: "12 shared by 3", a: "4", type: "numeric", s: ["How many 3s in 12?", "3, 6, 9, 12.", "Four 3s."], d: 2 }
                ]
            }
        ];

        let createdCount = 0;

        for (const item of seedData) {
            // Check if skill exists to avoid duplicates (by name)
            const existingSkills = await base44.entities.Skills.filter({ name: item.skill.name });
            let skillId;

            if (existingSkills.length > 0) {
                skillId = existingSkills[0].id;
                // Update existing skill to ensure alignment
                await base44.entities.Skills.update(skillId, item.skill);
            } else {
                const newSkill = await base44.entities.Skills.create(item.skill);
                skillId = newSkill.id;
            }

            // Create questions linked to this skill
            const existingQuestions = await base44.entities.Questions.filter({ skillId: skillId });
            
            if (existingQuestions.length === 0) {
                const questionPromises = item.questions.map(q => {
                    return base44.entities.Questions.create({
                        skillId: skillId,
                        promptText: q.t,
                        questionType: q.type,
                        correctAnswer: q.a,
                        choices: JSON.stringify(q.c || []),
                        hintStepChain: JSON.stringify(q.s || []),
                        difficulty: q.d,
                        promptImageUrl: "" 
                    });
                });
                await Promise.all(questionPromises);
                createdCount += item.questions.length;
            }
        }

        return Response.json({ success: true, message: `Seeded/Updated curriculum with ${seedData.length} skills.` });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});