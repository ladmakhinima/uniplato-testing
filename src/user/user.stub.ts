export const createValidUserStub = () => ({
  email: `new-gmail-${Date.now()}@gmail.com`,
  password: "123456789",
});

export const createInvalidUserStub = () => ({
  email: "hosein@gmail.com",
  password: "________",
});

export const createInvalidValidationUserStub = () => ({
  email: "something invalid",
  password: "__",
});

export const validUserStub = () => ({
  email: "hosein@gmail.com",
  password: "123456789",
});
