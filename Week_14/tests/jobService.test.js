const jobService = require('../src/services/jobService');
const jobRepository = require('../src/repositories/jobRepository');
jest.mock('../src/repositories/jobRepository');
describe('JobService - Unit Analysis', () => {

  afterEach(() => jest.clearAllMocks());

  test('Should successfully process a valid vacancy', async () => {
    const mockInput = { title: 'Senior Dev', salary: 5000 };
    jobRepository.create.mockResolvedValue({ id: 99, ...mockInput, status: 'ACTIVE' });

    const result = await jobService.createVacancy(mockInput);

    expect(result.status).toBe('ACTIVE');
    expect(jobRepository.create).toHaveBeenCalledTimes(1);
  });

  test('Should trigger a Stop Loss (Error) if salary is negative', async () => {
    const badInput = { title: 'Junior Dev', salary: -100 };

    await expect(jobService.createVacancy(badInput))
      .rejects
      .toThrow('INVALID_INPUT');
    
    // Ensure the DB was never touched
    expect(jobRepository.create).not.toHaveBeenCalled();
  });
});