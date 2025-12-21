import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // SECURITY: Trust user.id from auth token, NOT from request body
        // This prevents users from submitting attempts for others
        const actingUserId = user.id;

        const { skillId, questionId, isCorrect, timeTakenSec, hintsUsed } = await req.json();

        // Validate required inputs
        if (!skillId || !questionId) {
             return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Insert into Attempts
        await base44.entities.Attempts.create({
            userId: actingUserId,
            skillId,
            questionId,
            isCorrect: !!isCorrect,
            timeTakenSec: Number(timeTakenSec) || 0,
            hintsUsed: Number(hintsUsed) || 0
        });

        // 2. Update SkillMastery
        const masteryRecords = await base44.entities.SkillMastery.filter({ userId: actingUserId, skillId });
        let masteryRecord = masteryRecords[0];

        let currentMastery = masteryRecord ? masteryRecord.masteryScore : 0;
        let currentStreak = masteryRecord ? masteryRecord.streak : 0;

        let newMastery = currentMastery;
        let newStreak = currentStreak;

        // Gamification Logic: Reward effort, not just correctness
        if (isCorrect) {
            const hintPenalty = (Number(hintsUsed) || 0) * 1;
            // Slower mastery climb (5 instead of 6) to encourage practice
            newMastery = Math.min(100, currentMastery + 5 - hintPenalty);
            newStreak = currentStreak + 1;
        } else {
            // Gentler penalty (2 instead of 4) to reduce frustration
            newMastery = Math.max(0, currentMastery - 2);
            newStreak = 0;
        }

        if (masteryRecord) {
            await base44.entities.SkillMastery.update(masteryRecord.id, {
                masteryScore: newMastery,
                streak: newStreak,
                lastSeenAt: new Date().toISOString()
            });
        } else {
            await base44.entities.SkillMastery.create({
                userId: actingUserId,
                skillId,
                masteryScore: newMastery,
                streak: newStreak,
                lastSeenAt: new Date().toISOString()
            });
        }

        // 3. Update Rewards - REWARD EFFORT!
        // +10 for correct, +5 for trying (incorrect but attempted)
        const rewardsRecords = await base44.entities.Rewards.filter({ userId: actingUserId });
        let rewardsRecord = rewardsRecords[0];
        
        const profileRecords = await base44.entities.UserProfile.filter({ created_by: user.email });
        let userProfile = profileRecords[0];

        // Use MAX of existing points to prevent regression if entities desync
        let currentPoints = Math.max(rewardsRecord?.points || 0, userProfile?.points || 0);
        let pointsToAdd = isCorrect ? 10 : 5; // Reward persistence
        let newPoints = currentPoints + pointsToAdd;

        // Update Rewards entity
        if (rewardsRecord) {
            await base44.entities.Rewards.update(rewardsRecord.id, { points: newPoints });
        } else {
            await base44.entities.Rewards.create({
                userId: actingUserId,
                points: newPoints,
                badges: "[]",
                unlockedThemes: "[]"
            });
        }

        // Sync UserProfile points & Handle Daily Streak
        let userStreak = userProfile.streak || 0;
        let streakUpdated = false;
        
        if (userProfile) {
             const today = new Date().toISOString().split('T')[0];
             const lastPractice = userProfile.last_practice_date;
             
             let newStreakValue = userStreak;

             if (lastPractice !== today) {
                 // Check if it was yesterday
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 const yesterdayStr = yesterday.toISOString().split('T')[0];

                 if (lastPractice === yesterdayStr) {
                     newStreakValue += 1;
                 } else {
                     newStreakValue = 1; // Reset or Start
                 }
                 streakUpdated = true;
             }
             
             userStreak = newStreakValue;

             await base44.entities.UserProfile.update(userProfile.id, { 
                 points: newPoints,
                 streak: newStreakValue,
                 last_practice_date: today
             });
        }

        // --- BADGE LOGIC ---
        let currentBadges = [];
        try {
            currentBadges = JSON.parse(rewardsRecord?.badges || "[]");
        } catch (e) { currentBadges = []; }

        const newBadges = [];
        const definitions = [
            { id: 'first_win', name: 'First Steps', icon: '🌱', description: 'Complete your first question', condition: () => isCorrect && currentPoints > 0 },
            { id: 'streak_3', name: 'On Fire', icon: '🔥', description: 'Reach a 3-day streak', condition: () => userStreak >= 3 },
            { id: 'streak_7', name: 'Unstoppable', icon: '🚀', description: 'Reach a 7-day streak', condition: () => userStreak >= 7 },
            { id: 'collector_100', name: 'Star Collector', icon: '⭐', description: 'Earn 100 Stars', condition: () => newPoints >= 100 },
            { id: 'collector_500', name: 'Super Star', icon: '🌟', description: 'Earn 500 Stars', condition: () => newPoints >= 500 },
            { id: 'master_1', name: 'Smarty Pants', icon: '🧠', description: 'Reach 100% Mastery in a skill', condition: () => newMastery === 100 }
        ];

        let badgeUnlocked = false;
        for (const def of definitions) {
            const hasBadge = currentBadges.find(b => b.id === def.id);
            if (!hasBadge && def.condition()) {
                const badgeObj = { id: def.id, name: def.name, icon: def.icon, description: def.description, unlocked: true, date: new Date().toISOString() };
                currentBadges.push(badgeObj);
                newBadges.push(badgeObj);
                badgeUnlocked = true;
            }
        }

        if (badgeUnlocked && rewardsRecord) {
            await base44.entities.Rewards.update(rewardsRecord.id, { badges: JSON.stringify(currentBadges) });
        } else if (badgeUnlocked && !rewardsRecord) {
             // Should have been created above, but just in case
        }

        return Response.json({
            masteryScore: newMastery,
            streak: newStreak, // Skill streak
            userStreak: userStreak, // Daily streak
            points: newPoints,
            pointsAdded: pointsToAdd,
            newBadges: newBadges
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});