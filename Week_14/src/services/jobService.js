const jobRepository = require('../repositories/jobRepository');

class JobService {
  async createVacancy(data) {
    // Logic Guard: Stop Loss for bad data
    if (!data.title || data.salary < 0) {
      throw new Error('INVALID_INPUT');
    }
    
    const jobData = {
      ...data,
      status: 'ACTIVE',
      createdAt: new Date()
    };

    return await jobRepository.create(jobData);
  }
}

module.exports = new JobService();