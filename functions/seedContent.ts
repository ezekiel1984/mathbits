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
        const seedData = [
            // --- K-1: Foundations (Counting, Basic Add/Sub, Shapes) ---
            {
                skill: { name: "Count to 10", domain: "Number", level: 1, description: "Count objects one by one up to 10.", orderIndex: 1 },
                questions: [
                    { t: "How many blocks?", a: "3", type: "multipleChoice", c: ["2", "3", "4"], s: ["Touch each block.", "1... 2... 3."], d: 1 },
                    { t: "Count the stars.", a: "5", type: "numeric", s: ["Point to the stars.", "1, 2, 3, 4, 5."], d: 1 },
                    { t: "How many apples?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["One apple.", "Two apples."], d: 1 },
                    { t: "Count the dots.", a: "4", type: "numeric", s: ["Count carefully.", "1... 2... 3... 4."], d: 1 },
                    { t: "How many cars?", a: "1", type: "numeric", s: ["Just one car."], d: 1 },
                    { t: "Count the blue balls.", a: "6", type: "numeric", s: ["We have 5.", "And 1 more makes 6."], d: 2 },
                    { t: "How many fish?", a: "7", type: "multipleChoice", c: ["6", "7", "8"], s: ["Count the group.", "There are 7 fish."], d: 2 },
                    { t: "Count the cats.", a: "8", type: "numeric", s: ["4 cats... plus 4 more.", "That makes 8."], d: 2 },
                    { t: "How many fingers?", a: "10", type: "numeric", s: ["5 on one hand.", "5 on the other.", "10 fingers total."], d: 2 }
                ]
            },
            {
                skill: { name: "Add within 10", domain: "Add", level: 1, description: "Putting groups together.", orderIndex: 2 },
                questions: [
                    { t: "1 block + 1 block = ?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["Start with 1.", "Add 1 more.", "Now you have 2."], d: 1 },
                    { t: "2 + 1 = ?", a: "3", type: "numeric", s: ["Start with 2.", "Count 1 up: 3."], d: 1 },
                    { t: "3 + 2 = ?", a: "5", type: "multipleChoice", c: ["4", "5", "6"], s: ["Start with 3 blocks.", "Add 2 more blocks.", "3... 4, 5."], d: 2 },
                    { t: "4 + 1 = ?", a: "5", type: "numeric", s: ["You have 4.", "Get 1 more.", "That makes 5."], d: 1 },
                    { t: "5 + 5 = ?", a: "10", type: "numeric", s: ["5 fingers on left hand.", "5 fingers on right hand.", "10 fingers total."], d: 2 },
                    { t: "2 + 2 = ?", a: "4", type: "numeric", s: ["Double 2 is 4."], d: 1 },
                    { t: "6 + 3 = ?", a: "9", type: "numeric", s: ["Start at 6.", "Count up: 7, 8, 9."], d: 2 },
                    { t: "0 + 5 = ?", a: "5", type: "numeric", s: ["Zero means nothing.", "So it stays 5."], d: 1 }
                ]
            },
            {
                skill: { name: "Subtract within 10", domain: "Sub", level: 1, description: "Taking away from a group.", orderIndex: 3 },
                questions: [
                    { t: "2 - 1 = ?", a: "1", type: "multipleChoice", c: ["1", "2", "0"], s: ["Show 2 fingers.", "Put 1 down.", "1 left."], d: 1 },
                    { t: "3 - 1 = ?", a: "2", type: "numeric", s: ["Start with 3 blocks.", "Take 1 away.", "2 left."], d: 1 },
                    { t: "5 - 2 = ?", a: "3", type: "numeric", s: ["Start with 5.", "Count back: 4... 3."], d: 2 },
                    { t: "4 - 4 = ?", a: "0", type: "numeric", s: ["Take them all away.", "Zero left."], d: 1 },
                    { t: "10 - 1 = ?", a: "9", type: "numeric", s: ["One less than 10 is 9."], d: 1 },
                    { t: "8 - 0 = ?", a: "8", type: "numeric", s: ["Take nothing away.", "Stays 8."], d: 1 },
                    { t: "6 - 3 = ?", a: "3", type: "numeric", s: ["6 is two groups of 3.", "Take one group away.", "3 left."], d: 2 }
                ]
            },
            {
                skill: { name: "Shapes & Patterns", domain: "Geometry", level: 1, description: "Identify basic shapes.", orderIndex: 4 },
                questions: [
                    { t: "Which is round?", a: "Circle", type: "multipleChoice", c: ["Square", "Circle", "Triangle"], s: ["A circle is round like a ball."], d: 1 },
                    { t: "Which has 3 sides?", a: "Triangle", type: "multipleChoice", c: ["Square", "Circle", "Triangle"], s: ["Count the sides: 1, 2, 3.", "Triangle!"], d: 1 },
                    { t: "Which has 4 equal sides?", a: "Square", type: "multipleChoice", c: ["Rectangle", "Square", "Star"], s: ["Look for the box shape.", "All sides same length."], d: 1 },
                    { t: "How many corners on a Square?", a: "4", type: "numeric", s: ["Count the pointy corners.", "1, 2, 3, 4."], d: 1 },
                    { t: "Is a door a Circle?", a: "No", type: "multipleChoice", c: ["Yes", "No"], s: ["A door has straight sides.", "A circle is curvy."], d: 1 }
                ]
            },
            // --- Years 2-3: Building Fluency (Add/Sub 20+, Mult Intro) ---
            {
                skill: { name: "Skip Counting", domain: "Number", level: 2, description: "Count by 2s, 5s, 10s.", orderIndex: 5 },
                questions: [
                    { t: "2, 4, 6, ?", a: "8", type: "multipleChoice", c: ["7", "8", "9"], s: ["We are counting by 2s.", "6 + 2 = 8."], d: 1 },
                    { t: "5, 10, 15, ?", a: "20", type: "numeric", s: ["Count by 5s.", "15... 20."], d: 1 },
                    { t: "10, 20, 30, ?", a: "40", type: "numeric", s: ["Count by 10s.", "3 tens... 4 tens is 40."], d: 1 },
                    { t: "20, 25, 30, ?", a: "35", type: "numeric", s: ["Add 5 more to 30."], d: 2 },
                    { t: "8, 10, 12, ?", a: "14", type: "numeric", s: ["Skip count by 2.", "12... 14."], d: 2 }
                ]
            },
            {
                skill: { name: "Add within 20", domain: "Add", level: 2, description: "Sums up to 20.", orderIndex: 6 },
                questions: [
                    { t: "10 + 5 = ?", a: "15", type: "numeric", s: ["Start at 10.", "Add 5 ones.", "15."], d: 1 },
                    { t: "9 + 2 = ?", a: "11", type: "numeric", s: ["9 is almost 10.", "Take 1 from the 2 to make 10.", "10 + 1 = 11."], d: 2 },
                    { t: "8 + 8 = ?", a: "16", type: "numeric", s: ["Double 8 is 16."], d: 2 },
                    { t: "12 + 4 = ?", a: "16", type: "numeric", s: ["2 + 4 = 6.", "So 12 + 4 = 16."], d: 2 },
                    { t: "7 + 6 = ?", a: "13", type: "numeric", s: ["Double 6 is 12.", "Add 1 more.", "13."], d: 3 }
                ]
            },
            {
                skill: { name: "Intro to Multiplication", domain: "Mul", level: 2, description: "Groups of numbers.", orderIndex: 7 },
                questions: [
                    { t: "2 groups of 2", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["2 + 2 = 4.", "2 times 2 is 4."], d: 1 },
                    { t: "3 groups of 5", a: "15", type: "numeric", s: ["Count by 5s three times.", "5, 10, 15."], d: 2 },
                    { t: "2 x 3 = ?", a: "6", type: "numeric", s: ["Two groups of 3.", "3 + 3 = 6."], d: 2 },
                    { t: "4 x 1 = ?", a: "4", type: "numeric", s: ["One group of 4.", "Just 4."], d: 1 },
                    { t: "5 x 2 = ?", a: "10", type: "numeric", s: ["Count by 5s two times.", "5, 10."], d: 2 }
                ]
            },
            {
                skill: { name: "Simple Fractions", domain: "Fractions", level: 2, description: "Halves and Quarters.", orderIndex: 8 },
                questions: [
                    { t: "Half of 2 is?", a: "1", type: "numeric", s: ["Share 2 cookies between 2 friends.", "Each gets 1."], d: 1 },
                    { t: "Half of 10 is?", a: "5", type: "numeric", s: ["5 + 5 = 10.", "So half is 5."], d: 2 },
                    { t: "Which shows 1/2?", a: "1 part of 2", type: "multipleChoice", c: ["1 part of 2", "1 part of 3"], s: ["One out of two pieces."], d: 1 },
                    { t: "2 quarters make a...", a: "Half", type: "multipleChoice", c: ["Half", "Whole"], s: ["Imagine a pizza.", "2 quarters cover half."], d: 2 },
                    { t: "4 quarters make...", a: "1 Whole", type: "multipleChoice", c: ["1 Whole", "1 Half"], s: ["All parts together make 1 whole."], d: 2 }
                ]
            },
            // --- Years 4-6: Advanced Concepts (Mult/Div, Word Problems) ---
            {
                skill: { name: "Multiplication Facts", domain: "Mul", level: 3, description: "Fluency with tables.", orderIndex: 9 },
                questions: [
                    { t: "3 x 3 = ?", a: "9", type: "numeric", s: ["3 groups of 3.", "3, 6, 9."], d: 1 },
                    { t: "4 x 5 = ?", a: "20", type: "numeric", s: ["Count by 5s four times.", "5, 10, 15, 20."], d: 2 },
                    { t: "6 x 2 = ?", a: "12", type: "numeric", s: ["Double 6 is 12."], d: 1 },
                    { t: "7 x 3 = ?", a: "21", type: "numeric", s: ["7, 14, 21."], d: 3 },
                    { t: "9 x 2 = ?", a: "18", type: "numeric", s: ["Less than 20.", "Double 9 is 18."], d: 2 },
                    { t: "8 x 5 = ?", a: "40", type: "numeric", s: ["Half of 8 is 4.", "Add a zero: 40."], d: 2 }
                ]
            },
            {
                skill: { name: "Division Basics", domain: "Div", level: 3, description: "Sharing equally.", orderIndex: 10 },
                questions: [
                    { t: "10 shared by 2", a: "5", type: "numeric", s: ["Split 10 in half.", "5."], d: 1 },
                    { t: "12 shared by 3", a: "4", type: "numeric", s: ["How many 3s in 12?", "3, 6, 9, 12.", "Four 3s."], d: 2 },
                    { t: "8 / 2 = ?", a: "4", type: "numeric", s: ["Half of 8 is 4."], d: 1 },
                    { t: "20 / 5 = ?", a: "4", type: "numeric", s: ["Count by 5s to 20.", "5, 10, 15, 20.", "That is 4 times."], d: 2 },
                    { t: "15 / 3 = ?", a: "5", type: "numeric", s: ["Three groups of 5 make 15."], d: 2 }
                ]
            },
            {
                skill: { name: "Word Problems", domain: "WordProblems", level: 3, description: "Real world math stories.", orderIndex: 11 },
                questions: [
                    { t: "I have 5 apples. I buy 5 more. How many?", a: "10", type: "numeric", s: ["5 + 5 = 10."], d: 1 },
                    { t: "3 cats have how many legs?", a: "12", type: "numeric", s: ["One cat has 4 legs.", "4 + 4 + 4 = 12."], d: 2 },
                    { t: "Divide 12 cookies among 4 kids.", a: "3", type: "numeric", s: ["12 shared by 4.", "3 each."], d: 2 },
                    { t: "I have $10. I spend $3. Left?", a: "7", type: "numeric", s: ["10 - 3 = 7."], d: 1 },
                    { t: "5 boxes, 2 toys in each. Total?", a: "10", type: "numeric", s: ["5 groups of 2.", "5 x 2 = 10."], d: 2 }
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
            // First, delete existing questions for this skill to ensure syllabus is pure? 
            // Better to upsert, but simple create is safer for now. 
            // Let's check if questions exist.
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