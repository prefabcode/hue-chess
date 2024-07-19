import { getActivePerks } from "./storageManagement.js";

const isBerzerkerFulfilled = () => {
    // will return either bonusValue or 0. 
    return 0;
}

const isGladiatorFulfilled = () => {
    return 0;
}

const isBongcloudFulfilled = () => {
    return 0;
}

const isAnalysisFulfilled = () => {
    return 0;
}

const isSpeedrunFulfilled = () => {
    return 0;
}

const isRevengeFulfilled = () => {
    return 0;
}

export const calculatePerkBonuses = async () => {
    let bonus = 0;

    const activePerks = await getActivePerks(); // Function to get active perks from storage

    if (activePerks.includes('berzerker')) {
        bonus += isBerzerkerFulfilled();
    }
    if (activePerks.includes('gladiator')) {
        bonus += isGladiatorFulfilled();
    }
    if (activePerks.includes('speedrun')) {
        bonus += isSpeedrunFulfilled();
    }
    if (activePerks.includes('bongcloud')) {
        bonus += isBongcloudFulfilled();
    }
    if (activePerks.includes('analysis')) {
        bonus += isAnalysisFulfilled();
    }
    if (activePerks.includes('revenge')) {
        bonus += isRevengeFulfilled();
    }

    return bonus;
};


