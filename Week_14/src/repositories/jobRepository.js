const { Job } = require('../models');

class JobRepository {
  async create(data) {
    return await Job.create(data);
  }

  async findAll() {
    return await Job.findAll();
  }
}

module.exports = new JobRepository();