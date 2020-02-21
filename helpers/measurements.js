const fs = require("fs");
const measurementsOutDir = process.env["MEASUREMENTS_OUT_DIR"];
const measurementsEnabled = !!measurementsOutDir;
const streams = {};

function getStream(evtSource) {
  let stream = streams[evtSource];
  if (!stream) {
    const path = `${measurementsOutDir}/${evtSource}_${new Date().toISOString()}.json`;
    stream = fs.createWriteStream(path, { flags: "a" });
    streams[evtSource] = stream;
  }
  return stream;
}

const begins = {};

/**
 * @param {String} source Origin of the event
 * @param {String} name Name of the event
 * @param {Number} billingPeriod Number of the billing period
 * @param {String} household Address of the household
 */
function measureEvent(source, name, billingPeriod = null, household = null) {
  if (!measurementsEnabled) return; // quick exit when measurements are disabled

  const ts = Date.now();
  const o = { ts, source, name };
  if (billingPeriod !== null) o.billingPeriod = billingPeriod;
  if (household !== null) o.household = household;

  const stream = getStream(source);
  stream.write(JSON.stringify(o) + "\n");

  if (name.endsWith("_begin")) {
    const nameCore = name.replace(/_begin$/, "");
    const path = `${nameCore} ${billingPeriod} ${household}`;
    begins[path] = ts;
  } else if (name.endsWith("_end")) {
    const nameCore = name.replace(/_end$/, "");
    const path = `${nameCore} ${billingPeriod} ${household}`;
    if (begins[path]) {
      const dt = ts - begins[path];
      delete begins[path];
      const o = { ts, source, name: nameCore, dt };
      if (billingPeriod !== null) o.billingPeriod = billingPeriod;
      if (household !== null) o.household = household;
      stream.write(JSON.stringify(o) + "\n");
    }
  }
}

module.exports = { measureEvent, measurementsEnabled };
