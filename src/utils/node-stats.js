'use strict';

const os = require('os'),
    path = require('path');

async function getStats(req, res, next) {
    try {
        const memoryConsumedPercent = (process.memoryUsage().rss / os.totalmem()) * 100;
        const cpuUsagePercent = await getCpuUtilisationPercent(2000000);
        const stats = {
            version: process.version,
            service_name: path.basename(process.argv[1]),
            cpu_usage: cpuUsagePercent,
            memory_consumed: process.memoryUsage().rss,
            memory_consumed_percent: memoryConsumedPercent,
            uptime: process.uptime(),
            pid: process.pid
        };

        if (req === undefined)
            return stats;
        res.json(stats);
    } catch (err) {
        if (req === undefined)
            return Promise.reject(err);
        next(err);
    }
}

/**
 * get rough process cpu utilization over the given time period
 * @param {Number} timePeriod - in microseconds
 * @return {Promise}
 */
function getCpuUtilisationPercent(timePeriod) {
    return new Promise((resolve, reject) => {
        const startTime = process.hrtime();
        const startCpuUsage = process.cpuUsage();

        setTimeout(() => {
            const elapsedTime = convertHrtimeToMicroSecond(process.hrtime(startTime));
            const elapsedCpuUsage = process.cpuUsage(startCpuUsage);

            const cpuPercent = Math.round(100 * (elapsedCpuUsage.system + elapsedCpuUsage.user) / elapsedTime);
            resolve(cpuPercent);
        }, timePeriod / 1000);
    });

    function convertHrtimeToMicroSecond(secNSec) {
        return secNSec[0] * 1000000 + secNSec[1] / 1000
    }
}

module.exports = getStats;