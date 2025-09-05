// GitHub validation schemas using custom validation format
const linkAccountSchema = {
  code: { 
    required: true, 
    string: true, 
    minLength: 1 
  }
};

const orgParamSchema = {
  org: { 
    required: true, 
    string: true, 
    minLength: 1, 
    maxLength: 100 
  }
};

const repoParamSchema = {
  org: { 
    required: true, 
    string: true, 
    minLength: 1, 
    maxLength: 100 
  },
  repo: { 
    required: true, 
    string: true, 
    minLength: 1, 
    maxLength: 100 
  }
};

module.exports = {
  linkAccountSchema,
  orgParamSchema,
  repoParamSchema
};
