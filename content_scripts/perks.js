import { getActivePerks } from "./storageManagement.js";

const isBerzerkerFulfilled = (incrementValue) => {
    // will return either bonusValue or 0. 
    return 0;
}

const isGladiatorFulfilled = (incrementValue) => {
    return 0;
}

const isBongcloudFulfilled = (incrementValue) => {
    return 0;
}

const isAnalysisFulfilled = (incrementValue) => {
    return 0;
}

const isSpeedrunFulfilled = (incrementValue) => {
    return 0;
}

const isRevengeFulfilled = (incrementValue) => {
    return 0;
}

export const calculatePerkBonuses = async (incrementValue) => {
    let bonus = 0;

    const activePerks = await getActivePerks(); // Function to get active perks from storage

    if (activePerks.includes('berzerker')) {
        bonus += isBerzerkerFulfilled(incrementValue);
    }
    if (activePerks.includes('gladiator')) {
        bonus += isGladiatorFulfilled(incrementValue);
    }
    if (activePerks.includes('speedrun')) {
        bonus += isSpeedrunFulfilled(incrementValue);
    }
    if (activePerks.includes('bongcloud')) {
        bonus += isBongcloudFulfilled(incrementValue);
    }
    if (activePerks.includes('analysis')) {
        bonus += isAnalysisFulfilled(incrementValue);
    }
    if (activePerks.includes('revenge')) {
        bonus += isRevengeFulfilled(incrementValue);
    }

    return bonus;
};


