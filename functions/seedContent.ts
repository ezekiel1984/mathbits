import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Define Skills and their Questions
        const seedData = [
            {
                skill: { name: "Count to 10", domain: "Number", level: 1, description: "Count objects up to 10.", orderIndex: 1 },
                questions: [
                    { t: "How many blocks?", a: "3", type: "multipleChoice", c: ["2", "3", "4"], s: ["Count one by one.", "1, 2, 3."], d: 1 },
                    { t: "How many stars?", a: "5", type: "numeric", s: ["Point and count.", "1, 2, 3, 4, 5."], d: 1 },
                    { t: "Count the apples.", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["Just a few here.", "1, 2."], d: 1 },
                    { t: "How many fingers?", a: "5", type: "numeric", s: ["Look at one hand.", "1, 2, 3, 4, 5."], d: 1 },
                    { t: "Count the dots.", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["Count carefully.", "1, 2, 3, 4."], d: 1 },
                    { t: "How many cars?", a: "1", type: "numeric", s: ["Just one."], d: 1 },
                    { t: "Count the blue balls.", a: "6", type: "numeric", s: ["Keep going past 5.", "5... and 1 more is 6."], d: 2 },
                    { t: "How many fish?", a: "7", type: "multipleChoice", c: ["6", "7", "8"], s: ["Count slowly.", "1, 2, 3, 4, 5, 6, 7."], d: 2 },
                    { t: "Count the cats.", a: "8", type: "numeric", s: ["Almost 10!", "1... to 8."], d: 2 },
                    { t: "How many toes?", a: "10", type: "multipleChoice", c: ["5", "10", "15"], s: ["Count all of them.", "1 to 10."], d: 2 }
                ]
            },
            {
                skill: { name: "Add within 5", domain: "Add", level: 1, description: "Simple addition up to 5.", orderIndex: 2 },
                questions: [
                    { t: "1 + 1 = ?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["Start with 1.", "Add 1 more."], d: 1 },
                    { t: "2 + 1 = ?", a: "3", type: "numeric", s: ["Start with 2.", "Count 1 up."], d: 1 },
                    { t: "1 + 3 = ?", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["Start with 3 (it's bigger).", "Add 1."], d: 1 },
                    { t: "2 + 2 = ?", a: "4", type: "numeric", s: ["Double 2.", "2... 3, 4."], d: 1 },
                    { t: "3 + 2 = ?", a: "5", type: "multipleChoice", c: ["4", "5", "6"], s: ["Start at 3.", "Count 2 more: 4, 5."], d: 2 },
                    { t: "0 + 5 = ?", a: "5", type: "numeric", s: ["Adding zero changes nothing.", "Still 5."], d: 1 },
                    { t: "4 + 1 = ?", a: "5", type: "multipleChoice", c: ["4", "5", "6"], s: ["One more than 4."], d: 1 },
                    { t: "1 + 2 = ?", a: "3", type: "numeric", s: ["Start at 2.", "Add 1."], d: 1 },
                    { t: "1 + 4 = ?", a: "5", type: "multipleChoice", c: ["3", "4", "5"], s: ["Start at 4.", "Add 1."], d: 2 },
                    { t: "2 + 3 = ?", a: "5", type: "numeric", s: ["Start at 3.", "Count 2 up: 4, 5."], d: 2 }
                ]
            },
            {
                skill: { name: "Subtract within 5", domain: "Sub", level: 1, description: "Taking away up to 5.", orderIndex: 3 },
                questions: [
                    { t: "2 - 1 = ?", a: "1", type: "multipleChoice", c: ["1", "2", "0"], s: ["Have 2.", "Take 1 away."], d: 1 },
                    { t: "3 - 1 = ?", a: "2", type: "numeric", s: ["Count back 1 from 3.", "3... 2."], d: 1 },
                    { t: "4 - 2 = ?", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["Have 4.", "Take away 2."], d: 2 },
                    { t: "5 - 1 = ?", a: "4", type: "numeric", s: ["One less than 5."], d: 1 },
                    { t: "3 - 3 = ?", a: "0", type: "multipleChoice", c: ["0", "1", "3"], s: ["Take it all away.", "Nothing left."], d: 1 },
                    { t: "5 - 0 = ?", a: "5", type: "numeric", s: ["Take nothing away.", "Stays the same."], d: 1 },
                    { t: "4 - 1 = ?", a: "3", type: "numeric", s: ["Count back 1 from 4."], d: 1 },
                    { t: "5 - 2 = ?", a: "3", type: "multipleChoice", c: ["2", "3", "4"], s: ["Start at 5.", "Count back 2: 4, 3."], d: 2 },
                    { t: "2 - 2 = ?", a: "0", type: "numeric", s: ["Take both away."], d: 1 },
                    { t: "5 - 3 = ?", a: "2", type: "numeric", s: ["Start at 5.", "Count back 3: 4, 3, 2."], d: 2 }
                ]
            },
            {
                skill: { name: "Shapes", domain: "Geometry", level: 1, description: "Identify basic shapes.", orderIndex: 4 },
                questions: [
                    { t: "Which is a Circle?", a: "Circle", type: "multipleChoice", c: ["Square", "Circle", "Triangle"], s: ["It is round.", "No corners."], d: 1 },
                    { t: "How many sides on a Triangle?", a: "3", type: "numeric", s: ["Count the straight lines.", "1, 2, 3."], d: 1 },
                    { t: "Which is a Square?", a: "Square", type: "multipleChoice", c: ["Circle", "Square", "Star"], s: ["4 equal sides.", "Like a box."], d: 1 },
                    { t: "How many corners on a Square?", a: "4", type: "numeric", s: ["Count the pointy parts.", "1, 2, 3, 4."], d: 1 },
                    { t: "Which shape is round?", a: "Circle", type: "multipleChoice", c: ["Square", "Circle", "Rectangle"], s: ["Like a ball."], d: 1 },
                    { t: "A Rectangle has ___ sides.", a: "4", type: "numeric", s: ["Like a long square.", "Count them."], d: 2 },
                    { t: "Which has 3 sides?", a: "Triangle", type: "multipleChoice", c: ["Square", "Triangle", "Circle"], s: ["Tri means 3."], d: 1 },
                    { t: "Is a ball a Circle?", a: "Yes", type: "multipleChoice", c: ["Yes", "No"], s: ["It is round."], d: 1 },
                    { t: "A box is usually a...", a: "Square", type: "multipleChoice", c: ["Circle", "Square"], s: ["It has corners."], d: 1 },
                    { t: "How many sides on a Circle?", a: "0", type: "numeric", s: ["It is curvy.", "No straight lines."], d: 1 }
                ]
            },
            {
                skill: { name: "Compare Numbers", domain: "Number", level: 1, description: "Bigger, smaller, equal.", orderIndex: 5 },
                questions: [
                    { t: "Which is bigger?", a: "5", type: "multipleChoice", c: ["2", "5"], s: ["Which is more?", "5 is more than 2."], d: 1 },
                    { t: "Which is smaller?", a: "1", type: "multipleChoice", c: ["1", "4"], s: ["Which is less?", "1 is little."], d: 1 },
                    { t: "Is 3 equal to 3?", a: "Yes", type: "multipleChoice", c: ["Yes", "No"], s: ["Are they the same?", "Yes, same number."], d: 1 },
                    { t: "Which is biggest?", a: "10", type: "multipleChoice", c: ["5", "8", "10"], s: ["Count highest.", "10 is most."], d: 2 },
                    { t: "Which is smallest?", a: "2", type: "multipleChoice", c: ["2", "6", "9"], s: ["Count lowest.", "2 is least."], d: 2 },
                    { t: "Is 5 bigger than 2?", a: "Yes", type: "multipleChoice", c: ["Yes", "No"], s: ["More dots?", "Yes."], d: 1 },
                    { t: "Is 1 smaller than 10?", a: "Yes", type: "multipleChoice", c: ["Yes", "No"], s: ["1 is just one.", "10 is many."], d: 1 },
                    { t: "Which equals 4?", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["Find the same number."], d: 1 },
                    { t: "Which is more?", a: "9", type: "multipleChoice", c: ["7", "9"], s: ["9 comes after 7."], d: 2 },
                    { t: "Which is less?", a: "0", type: "multipleChoice", c: ["0", "5"], s: ["0 is nothing.", "Smallest."], d: 1 }
                ]
            },
            {
                skill: { name: "Add within 10", domain: "Add", level: 2, description: "Addition sums up to 10.", orderIndex: 6 },
                questions: [
                    { t: "5 + 5 = ?", a: "10", type: "numeric", s: ["High five!", "Two hands have 10 fingers."], d: 1 },
                    { t: "6 + 1 = ?", a: "7", type: "numeric", s: ["One more than 6."], d: 1 },
                    { t: "3 + 3 = ?", a: "6", type: "multipleChoice", c: ["5", "6", "7"], s: ["Double 3.", "3... 4, 5, 6."], d: 2 },
                    { t: "4 + 4 = ?", a: "8", type: "numeric", s: ["Double 4.", "Like a spider's legs."], d: 2 },
                    { t: "7 + 2 = ?", a: "9", type: "numeric", s: ["Start at 7.", "Count 2 up: 8, 9."], d: 2 },
                    { t: "2 + 8 = ?", a: "10", type: "multipleChoice", c: ["9", "10", "11"], s: ["Start at 8 (bigger).", "Add 2: 9, 10."], d: 2 },
                    { t: "5 + 2 = ?", a: "7", type: "numeric", s: ["Start at 5.", "Add 2: 6, 7."], d: 1 },
                    { t: "3 + 4 = ?", a: "7", type: "multipleChoice", c: ["6", "7", "8"], s: ["3 + 3 is 6...", "So 3 + 4 is 7."], d: 3 },
                    { t: "1 + 9 = ?", a: "10", type: "numeric", s: ["Start at 9.", "One more is 10."], d: 1 },
                    { t: "6 + 3 = ?", a: "9", type: "multipleChoice", c: ["8", "9", "10"], s: ["Start at 6.", "Count 3 up."], d: 2 }
                ]
            },
            {
                skill: { name: "Subtract within 10", domain: "Sub", level: 2, description: "Taking away from up to 10.", orderIndex: 7 },
                questions: [
                    { t: "10 - 1 = ?", a: "9", type: "numeric", s: ["Count back 1 from 10."], d: 1 },
                    { t: "8 - 2 = ?", a: "6", type: "multipleChoice", c: ["5", "6", "7"], s: ["8... 7, 6."], d: 2 },
                    { t: "5 - 5 = ?", a: "0", type: "numeric", s: ["Take it all away."], d: 1 },
                    { t: "7 - 3 = ?", a: "4", type: "numeric", s: ["7... 6, 5, 4."], d: 2 },
                    { t: "6 - 1 = ?", a: "5", type: "numeric", s: ["One less than 6."], d: 1 },
                    { t: "9 - 2 = ?", a: "7", type: "multipleChoice", c: ["6", "7", "8"], s: ["9... 8, 7."], d: 2 },
                    { t: "10 - 5 = ?", a: "5", type: "numeric", s: ["Half of 10 is 5."], d: 1 },
                    { t: "4 - 0 = ?", a: "4", type: "numeric", s: ["Take nothing away."], d: 1 },
                    { t: "8 - 4 = ?", a: "4", type: "multipleChoice", c: ["3", "4", "5"], s: ["Double 4 is 8.", "So 8 - 4 is 4."], d: 2 },
                    { t: "6 - 3 = ?", a: "3", type: "numeric", s: ["Half of 6 is 3."], d: 2 }
                ]
            },
            {
                skill: { name: "Number Bonds to 10", domain: "Number", level: 2, description: "Pairs that make 10.", orderIndex: 8 },
                questions: [
                    { t: "5 + ? = 10", a: "5", type: "numeric", s: ["Two hands.", "5 and 5 make 10."], d: 1 },
                    { t: "9 + ? = 10", a: "1", type: "numeric", s: ["Just need 1 more."], d: 1 },
                    { t: "8 + ? = 10", a: "2", type: "multipleChoice", c: ["1", "2", "3"], s: ["8... 9, 10.", "Need 2."], d: 2 },
                    { t: "10 + ? = 10", a: "0", type: "numeric", s: ["Already there.", "Need 0."], d: 1 },
                    { t: "7 + ? = 10", a: "3", type: "multipleChoice", c: ["2", "3", "4"], s: ["7... 8, 9, 10.", "Need 3."], d: 2 },
                    { t: "6 + ? = 10", a: "4", type: "numeric", s: ["6... need 4 more."], d: 2 },
                    { t: "4 + ? = 10", a: "6", type: "numeric", s: ["4 and 6 make 10."], d: 2 },
                    { t: "1 + ? = 10", a: "9", type: "numeric", s: ["Need a lot!", "Need 9."], d: 2 },
                    { t: "3 + ? = 10", a: "7", type: "numeric", s: ["3 and 7 make 10."], d: 2 },
                    { t: "2 + ? = 10", a: "8", type: "numeric", s: ["2 and 8 make 10."], d: 2 }
                ]
            },
            {
                skill: { name: "Skip Counting", domain: "Number", level: 2, description: "Count by 2s and 5s.", orderIndex: 9 },
                questions: [
                    { t: "2, 4, 6, ?", a: "8", type: "multipleChoice", c: ["7", "8", "9"], s: ["Add 2.", "6 + 2 = 8."], d: 1 },
                    { t: "5, 10, 15, ?", a: "20", type: "numeric", s: ["Count by 5s.", "15 + 5 = 20."], d: 1 },
                    { t: "10, 20, 30, ?", a: "40", type: "multipleChoice", c: ["35", "40", "50"], s: ["Count by 10s.", "Next is 40."], d: 1 },
                    { t: "2, 4, ?", a: "6", type: "numeric", s: ["Skip one.", "Next is 6."], d: 1 },
                    { t: "5, 10, ?", a: "15", type: "numeric", s: ["Add 5.", "10 + 5 = 15."], d: 1 },
                    { t: "8, 10, 12, ?", a: "14", type: "numeric", s: ["Add 2.", "12 + 2 = 14."], d: 2 },
                    { t: "20, 25, 30, ?", a: "35", type: "numeric", s: ["Add 5.", "30 + 5 = 35."], d: 2 },
                    { t: "30, 40, 50, ?", a: "60", type: "numeric", s: ["Next ten is 60."], d: 1 },
                    { t: "14, 16, 18, ?", a: "20", type: "numeric", s: ["Almost 20.", "Yes, 20."], d: 2 },
                    { t: "10, 15, ?", a: "20", type: "numeric", s: ["15 + 5 = 20."], d: 1 }
                ]
            },
            {
                skill: { name: "Halves & Quarters", domain: "Fractions", level: 2, description: "Introduction to parts of a whole.", orderIndex: 10 },
                questions: [
                    { t: "1 whole pizza cut in 2 is...", a: "Halves", type: "multipleChoice", c: ["Halves", "Quarters"], s: ["2 equal parts.", "Half."], d: 1 },
                    { t: "How many halves make 1 whole?", a: "2", type: "numeric", s: ["1, 2 halves."], d: 1 },
                    { t: "1 whole cut in 4 is...", a: "Quarters", type: "multipleChoice", c: ["Halves", "Quarters"], s: ["4 parts.", "Quarters."], d: 1 },
                    { t: "Half of 2 is?", a: "1", type: "numeric", s: ["Share 2 cookies.", "You get 1."], d: 1 },
                    { t: "Half of 4 is?", a: "2", type: "numeric", s: ["Share 4 cookies.", "2 each."], d: 1 },
                    { t: "Which is bigger?", a: "Whole", type: "multipleChoice", c: ["Half", "Whole"], s: ["Whole is all of it."], d: 1 },
                    { t: "Half of 10 is?", a: "5", type: "numeric", s: ["5 + 5 = 10.", "So 5."], d: 2 },
                    { t: "2 quarters make a...", a: "Half", type: "multipleChoice", c: ["Half", "Whole"], s: ["Put 2 small pieces together."], d: 2 },
                    { t: "4 quarters make a...", a: "Whole", type: "multipleChoice", c: ["Half", "Whole"], s: ["All pieces together."], d: 2 },
                    { t: "Cut an apple in 2. You have...", a: "2 halves", type: "multipleChoice", c: ["2 halves", "2 wholes"], s: ["Two pieces."], d: 1 }
                ]
            },
            {
                skill: { name: "Word Problems", domain: "WordProblems", level: 2, description: "Simple math stories.", orderIndex: 11 },
                questions: [
                    { t: "I have 2 apples. Mom gives me 1. How many?", a: "3", type: "numeric", s: ["2 + 1.", "Count them: 3."], d: 1 },
                    { t: "3 birds sit. 1 flies away. How many left?", a: "2", type: "numeric", s: ["3 - 1.", "2 left."], d: 1 },
                    { t: "I have 4 candies. I eat 2. How many left?", a: "2", type: "numeric", s: ["4 - 2.", "2 left."], d: 1 },
                    { t: "2 dogs and 2 cats. How many pets?", a: "4", type: "numeric", s: ["2 + 2.", "4 pets."], d: 1 },
                    { t: "I see 5 cars. 1 is red. How many NOT red?", a: "4", type: "numeric", s: ["5 - 1.", "4 left."], d: 2 },
                    { t: "Ben has 3 toys. Sam has 3. How many total?", a: "6", type: "numeric", s: ["3 + 3.", "6 toys."], d: 2 },
                    { t: "10 cookies. I eat 1. How many?", a: "9", type: "numeric", s: ["10 - 1.", "9 left."], d: 1 },
                    { t: "I found 1 shell. Then 4 more. How many?", a: "5", type: "numeric", s: ["1 + 4.", "5 shells."], d: 2 },
                    { t: "6 eggs. 2 crack. How many good?", a: "4", type: "numeric", s: ["6 - 2.", "4 good."], d: 2 },
                    { t: "Cat has 4 legs. Dog has 4 legs. Total legs?", a: "8", type: "numeric", s: ["4 + 4.", "8 legs."], d: 2 }
                ]
            },
            {
                skill: { name: "Add within 20", domain: "Add", level: 3, description: "Addition sums up to 20.", orderIndex: 12 },
                questions: [
                    { t: "10 + 5 = ?", a: "15", type: "numeric", s: ["Ten and five.", "Fifteen."], d: 1 },
                    { t: "10 + 10 = ?", a: "20", type: "numeric", s: ["Double 10.", "Twenty."], d: 1 },
                    { t: "12 + 1 = ?", a: "13", type: "numeric", s: ["One more than 12."], d: 1 },
                    { t: "11 + 2 = ?", a: "13", type: "numeric", s: ["11... 12, 13."], d: 2 },
                    { t: "15 + 0 = ?", a: "15", type: "numeric", s: ["Stays the same."], d: 1 },
                    { t: "9 + 9 = ?", a: "18", type: "multipleChoice", c: ["17", "18", "19"], s: ["Double 9.", "One less than 20."], d: 3 },
                    { t: "10 + 2 = ?", a: "12", type: "numeric", s: ["Ten and two.", "Twelve."], d: 1 },
                    { t: "8 + 8 = ?", a: "16", type: "numeric", s: ["Double 8.", "Sixteen."], d: 2 },
                    { t: "13 + 3 = ?", a: "16", type: "numeric", s: ["3 + 3 is 6.", "So 16."], d: 2 },
                    { t: "19 + 1 = ?", a: "20", type: "numeric", s: ["Next number is 20."], d: 1 }
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
            } else {
                const newSkill = await base44.entities.Skills.create(item.skill);
                skillId = newSkill.id;
            }

            // Create questions linked to this skill
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

        return Response.json({ success: true, message: `Seeded ${seedData.length} skills and ${createdCount} questions.` });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});