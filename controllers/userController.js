const { Check, Monitor, urlValidation } = require("../models/db.js");
const { sendEmail } = require("../notifications/email");
const { webHook } = require("../notifications/webhooks");
var jwt = require("jsonwebtoken");
const MonitorPing = require("ping-monitor");
require("dotenv").config();
const Push = require("pushover-notifications");

const push = new Push({
  user: process.env.USER_KEY,
  token: process.env.API_Token,
});

exports.createCheck = async (req, res) => {
  try {
    const valid = urlValidation(req.body);
    if (valid.error)
      return res.status(400).json({ message: valid.error.message });
    const {
      name,
      url,
      protocol,
      path,
      port,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      tags,
      ignoreSSL,
    } = req.body;
    const user = req.user;
    let userId = user.id;
    let check = await Check.create({
      name,
      url,
      protocol,
      path,
      port,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      tags,
      ignoreSSL,
      userId,
    });
    await Monitor.create({
      checkId: check._id,
      tag: tags,
    });
    startMonitoringLinks(check, user);
    res.status(200).json({ check: check });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "An error occured" });
  }
};

exports.updateCheck = async (req, res) => {
  try {
    const { id } = req.query;
    const {
      name,
      url,
      protocol,
      path,
      port,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assert,
      ignoreSSL,
    } = req.body;
    const updatedCheck = await Check.findByIdAndUpdate(
      id,
      {
        name,
        url,
        protocol,
        path,
        port,
        timeout,
        interval,
        threshold,
        authentication,
        httpHeaders,
        assert,
        ignoreSSL,
      },
      { new: true }
    );
    if (!updatedCheck) {
      return res.status(404).json({ error: "Check not found" });
    }
    return res.status(200).json({ check: updatedCheck });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCheck = async (req, res) => {
  try {
    var check = await Check.findOne({ _id: req.query.id });
    if (!check) return res.status(404).json({ message: "Check Not Found" });
    console.log(req.user.id);
    console.log(check.userId);
    if (req.user.id != check.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    var monitor = await Monitor.findOne({ checkId: req.query.id });
    check = await Check.findOneAndRemove({ _id: req.query.id });
    monitor = await Monitor.findOneAndRemove({ checkId: req.query.id });
    res.status(200).json({ message: "Succesfully deleted" });
  } catch (error) {
    res.status(400).json({ message: "An error occured" });
  }
};

const startMonitoringLinks = async (check, user) => {
  const checkOptions = {
    website: check.url,
    title: check.name,
    interval: check.interval,
    ignoreSSL: check.ignoreSSL,
    threshold: check.threshold,
    timeout: check.timeout,
    httpOptions: {
      path: check.path,
      httpHeaders: check.httpHeaders,
    },
  };
  const urlMonitor = new MonitorPing(checkOptions);
  try {
    urlMonitor.on("up", async (res, state) => {
      const message = `Your url: ${state.website} is up.`;
      await sendEmail(user.useremail, "URL Status Change ", message);
      const messagePush = {
        title: "Monitor Up",
        message: "The monitor is Up!",
        sound: "magic",
      };

      push.send(messagePush, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(result);
        }
      });
      if (check.webhook) {
        webHook(check.webhook, res);
      }
      await Monitor.findOneAndUpdate(
        { checkId: check._id },
        {
          status: "up",
          $push: {
            history: {
              timestamp: new Date(),
              status: "up",
              responseTime: res.responseTime,
            },
          },
          $inc: { upTime: check.interval },
        },
        { new: true }
      );
    });

    urlMonitor.on("down", async (res, state) => {
      const message = `Your url: ${state.website} is down.`;
      await sendEmail(user.useremail, "URL Status Change ", message);
      const messagePush = {
        title: "Monitor Down",
        message: "The monitor is Down!",
        sound: "magic",
      };

      push.send(messagePush, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(result);
        }
      });
      if (check.webhook) {
        webHook(check.webhook, res);
      }
      await Monitor.findOneAndUpdate(
        { checkId: check._id },
        {
          status: "down",
          endTime: Date.now(),
          $push: {
            history: {
              timestamp: new Date(),
              status: "down",
              responseTime: res.responseTime,
            },
          },
          $inc: { outages: 1, downTime: check.interval },
        },
        { new: true }
      );
    });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong" });
  }
};

exports.getReportByTag = async (req, res) => {
  try {
    const monitors = await Monitor.find({ tag: req.query.tag });
    const reports = [];
    for (const monitor of monitors) {
      const report = await getMonitorReport(monitor.checkId);
      reports.push(report);
    }
    res.status(200).json({ reports });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: " Error in Getting Reports" });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ checkId: req.query.id });
    const report = await getMonitorReport(monitor.checkId);
    res.status(200).json({ report });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: " Error in Getting Report" });
  }
};

const getMonitorReport = async (checkId) => {
  try {
    const monitor = await Monitor.findOne({ checkId });
    const check = await Check.findById(checkId);
    if (!monitor) {
      throw new Error(`No monitor found for check ${checkId}`);
    }
    const { name, url } = check;
    const { status, history, upTime, outages, downTime } = monitor;

    // Calculate availability percentage
    const availability = ((upTime / (upTime + downTime)) * 100).toFixed(2);

    // Calculate average response time
    let totalResponseTime = 0;
    let numResponses = 0;
    let avgResponseTime = 0;
    monitor.history.forEach((entry) => {
      if (entry.responseTime !== null) {
        totalResponseTime += entry.responseTime;
        numResponses++;
      }
    });

    avgResponseTime = totalResponseTime / numResponses;

    return {
      name,
      url,
      status,
      availability,
      outages,
      downTime,
      upTime,
      avgResponseTime,
      history,
    };
  } catch (err) {
    console.error(err);
    throw new err("Could not get Report");
  }
};
