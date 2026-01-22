const Job = {
  // Update this to return what the service/controller expects
  create: jest.fn().mockImplementation((data) => Promise.resolve({ id: 99, ...data })),
  findAll: jest.fn().mockResolvedValue([]),
};

module.exports = {
  Job,
  sequelize: { 
    sync: async () => {}, 
    close: async () => {},
    authenticate: async () => {} 
  }
};