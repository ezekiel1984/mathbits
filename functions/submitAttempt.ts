import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, skillId, questionId, isCorrect, timeTakenSec, hintsUsed } = await req.json();

        // 1. Insert into Attempts
        await base44.entities.Attempts.create({
            userId,
            skillId,
            questionId,
            isCorrect,
            timeTakenSec,
            hintsUsed: hintsUsed || 0
        });

        // 2. Update SkillMastery
        const masteryRecords = await base44.entities.SkillMastery.filter({ userId, skillId });
        let masteryRecord = masteryRecords[0];

        let currentMastery = masteryRecord ? masteryRecord.masteryScore : 0;
        let currentStreak = masteryRecord ? masteryRecord.streak : 0;

        let newMastery = currentMastery;
        let newStreak = currentStreak;

        if (isCorrect) {
            const hintPenalty = (hintsUsed || 0) * 1;
            newMastery = Math.min(100, currentMastery + 6 - hintPenalty);
            newStreak = currentStreak + 1;
        } else {
            newMastery = Math.max(0, currentMastery - 4);
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
                userId,
                skillId,
                masteryScore: newMastery,
                streak: newStreak,
                lastSeenAt: new Date().toISOString()
            });
        }

        // 3. Update Rewards (Points)
        // Also syncing UserProfile points for backward compatibility with frontend
        const rewardsRecords = await base44.entities.Rewards.filter({ userId });
        let rewardsRecord = rewardsRecords[0];
        
        const profileRecords = await base44.entities.UserProfile.filter({ created_by: user.email });
        let userProfile = profileRecords[0];

        let currentPoints = rewardsRecord ? rewardsRecord.points : (userProfile?.points || 0);
        let pointsToAdd = isCorrect ? 10 : 2;
        let newPoints = currentPoints + pointsToAdd;

        // Update Rewards entity
        if (rewardsRecord) {
            await base44.entities.Rewards.update(rewardsRecord.id, { points: newPoints });
        } else {
            await base44.entities.Rewards.create({
                userId,
                points: newPoints,
                badges: "[]",
                unlockedThemes: "[]"
            });
        }

        // Sync UserProfile points (UI uses this)
        if (userProfile) {
             // For UserProfile streak, we might want a different logic (daily streak), but for now let's just update points
             await base44.entities.UserProfile.update(userProfile.id, { points: newPoints });
        }

        return Response.json({
            masteryScore: newMastery,
            streak: newStreak,
            points: newPoints
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});