const jobService = require('../services/jobService');

exports.createJob = async (req, res) => {
  try {
    const job = await jobService.createVacancy(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};