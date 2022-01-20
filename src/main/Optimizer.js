const { ethers } = require("ethers");
const { TIMELOCK_ADDRESS } = require("../../config/Constants");
const { OPTIMIZER_CONTROLLER, OPTIMIZER_POOLS } = require("../../config/Wants");
const Utils = require('./Util.js');
const ABI = require('../../config/abi.json');
const CONFIG = require('../../config/Config');

//TO-DO add totalTVL 
async function doOptimize(signer) {
    const optimizerController = new ethers.Contract(OPTIMIZER_CONTROLLER, ABI.CONTROLLER, signer);

    let timelockTargets = [], timelockValues = [], timelockData = [];

    let discordDescription = "";
    for (const pool of OPTIMIZER_POOLS) {
        const currentStrategy = await optimizerController.strategies(pool.LP);

        let currentPoolInfo = {
            yearlyAPY: 0
        };
        let infoList = [];
        for (const contract of pool.contracts) {
            if (contract.strategy.toLowerCase() === currentStrategy.toLowerCase()) {
                currentPoolInfo = await Utils.getPoolAPIInfo(contract.fixedSnowglobe);
                continue;
            }

            const poolInfo = await Utils.getPoolAPIInfo(contract.fixedSnowglobe);
            if (!poolInfo) {
                throw new Error("Pool not found in API");
            }

            infoList.push(
                {
                    name: poolInfo.name,
                    source: poolInfo.source,
                    APY: poolInfo.yearlyAPY,
                    TVL: poolInfo.tvlStaked,
                    strategy: contract.strategy,
                    snowglobe: contract.snowglobe,
                }
            )
        }

        //search for the best APY with a .3% buffer
        let bestAPY = currentPoolInfo ? currentPoolInfo.yearlyAPY : 0;
        let bestIndex = -1;
        let poolName = "", source = "";
        for (let i = 0; i < infoList.length; i++) {
            if(Number(infoList[i].APY) + 0.3 > bestAPY){
                //found best APY for pool
                bestIndex = i;
                bestAPY = Number(infoList[i].APY);
                poolName = infoList[i].name;
                source = infoList[i].source
            }
        }

        if(bestIndex > -1){
            discordDescription = discordDescription.length > 0 ? discordDescription + "\n" : "";
                discordDescription = discordDescription +
                    `**APY Update** for ${poolName} \n`+
                    `**New Source**: ${source} \n`+
                    `**Old APY**: ${currentPoolInfo.yearlyAPY.toFixed(2)}% - **New APY**: ${bestAPY.toFixed(2)}%`

            //prepare batch
            const IStrategy = new ethers.utils.Interface(ABI.STRATEGY);
            const encodedLeverage = IStrategy.encodeFunctionData("leverageToMax", []);
            const encodedDeleverage = IStrategy.encodeFunctionData("deleverageToMin", []);

            const IController = new ethers.utils.Interface(ABI.CONTROLLER);
            const encodedSetStrategy = IController.encodeFunctionData("setStrategy", [pool.LP, infoList[bestIndex].strategy]);

            timelockData.push(encodedDeleverage);
            timelockTargets.push(currentStrategy);
            timelockValues.push(0);
            
            timelockData.push(encodedSetStrategy);
            timelockTargets.push(OPTIMIZER_CONTROLLER);
            timelockValues.push(0);

            timelockData.push(encodedLeverage);
            timelockTargets.push(infoList[bestIndex].strategy);
            timelockValues.push(0);
        }
    }

    if(timelockData.length > 0){
        if(timelockData.length !== timelockTargets.length){
            throw new Error("Invalid parameters for Optimizing pools");
        }
        
        const TimelockController = new ethers.Contract(TIMELOCK_ADDRESS, ABI.TIMELOCK, signer);
        const predecessor = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const delay = 60;

        const salt = ethers.BigNumber.from("0x17d0125345ab514ed45c14f379ae363a8a1ace81d34ba2749c23ac259db51e2e")
            .add(Math.floor(1000000*Math.random()));

        let txHash = "";
        if(CONFIG.EXECUTION.ENABLED) {
            const schedule = await TimelockController.scheduleBatch(
                timelockTargets, timelockValues, timelockData, predecessor, salt, delay
            );

            const tx_schedule = await schedule.wait(1);
            txHash = tx_schedule.transactionHash;
        } else {
            console.log(`Would Sent batch transaction to timelock. Set CONFIG.EXECUTION.ENABLED to enable optimizing.`);
        }

        const ITimelockController = new ethers.utils.Interface(ABI.TIMELOCK);
        const IMultisig = new ethers.utils.Interface(ABI.MULTISIG);

        const inner_encoding = ITimelockController.encodeFunctionData("executeBatch", [timelockTargets, timelockValues, timelockData, predecessor, salt]);
        const outer_encoding = IMultisig.encodeFunctionData("submitTransaction", [TIMELOCK_ADDRESS, 0, inner_encoding]);

        const executeData = outer_encoding;

        discordDescription += `\n\n**Run to Execute**:\n ${executeData}`;

        const embed = {
            "embeds": [
                {
                    "title": "New Optimizer Batch for TimelockController",
                    "description": discordDescription,
                    "url": Utils.cchainTransactionLink(txHash),
                    "color": 43775,
                    "timestamp": new Date(Date.now()).toISOString()
                }
            ]
        };

        if(CONFIG.DISCORD.ENABLED){
            await Utils.sendDiscord(CONFIG.DISCORD.WEBHOOK_OPTIMIZER,embed);
        }
    }
}

module.exports = { doOptimize }