const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const PORT = 3000;

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware CORS aprimorado
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Id, User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('=== CORS PREFLIGHT ===');
    console.log('Headers:', req.headers);
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware para log de requisições detalhado
app.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.url} ===`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('User-Agent:', req.get('User-Agent'));
  console.log('=====================================\n');
  next();
});

// Schema GraphQL mais completo para MHIRA
const schema = buildSchema(`
  type Query {
    hello: String
    me: User
    users: [User]
    tenants: [Tenant]
    assessments: [Assessment]
    patients: [Patient]
    userPermissionGrants: [UserPermissionGrant]
    getUserProfile: User
    getReportsByResource(resource: String!): [Report]
    disclaimers: [Disclaimer]
  }
  
  type Mutation {
    login(identifier: String!, password: String!): LoginResponse
    createUser(input: UserInput!): User
    createTenant(input: TenantInput!): Tenant
    createAssessment(input: AssessmentInput!): Assessment
    createPatient(input: PatientInput!): Patient
  }
  
  type LoginResponse {
    accessToken: String
    refreshToken: String
    user: User
  }
  
  type User {
    id: ID!
    workID: String
    firstName: String
    lastName: String
    phone: String
    email: String
    address: String
    isSuperUser: Boolean
    passwordChangeRequired: Boolean
    gender: String
    birthDate: String
    acceptedTerm: Boolean
    updatedAt: String
    createdAt: String
    roles: [Role]
    permissions: [Permission]
    departments: [Department]
  }

  type Role {
    id: String
    name: String
    isSuperAdmin: Boolean
    hierarchy: Int
    code: String
    createdAt: String
    updatedAt: String
  }

  type Permission {
    id: String
    name: String
    createdAt: String
    updatedAt: String
  }

  type Department {
    id: String
    name: String
    description: String
    active: Boolean
    createdAt: String
    updatedAt: String
  }

  type UserPermissionGrant {
    id: String
    name: String
    createdAt: String
    updatedAt: String
  }
  
  type Tenant {
    id: ID!
    name: String!
    subdomain: String!
  }
  
  type Assessment {
    id: ID!
    name: String!
    description: String
  }
  
  type Patient {
    id: ID!
    firstName: String!
    lastName: String!
    dateOfBirth: String
  }
  
  type Report {
    id: ID!
    name: String
    description: String
    url: String
    resources: String
  }
  
  type Disclaimer {
    type: String
    description: String
    updatedAt: String
  }
  
  input UserInput {
    username: String!
    firstName: String
    lastName: String
    email: String
    password: String
  }
  
  input TenantInput {
    name: String!
    subdomain: String!
  }
  
  input AssessmentInput {
    name: String!
    description: String
  }
  
  input PatientInput {
    firstName: String!
    lastName: String!
    dateOfBirth: String
  }
`);

// Resolvers
const root = {
  hello: () => 'Hello MHIRA!',
  
  userPermissionGrants: () => [
    {
      id: '1',
      name: 'ALL_PERMISSIONS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  login: ({ identifier, password }) => {
    if (identifier === 'superadmin' && password === 'superadmin') {
      return {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        refreshToken: 'refresh.test.token',
        user: {
          id: '1',
          workID: 'SUPER001',
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+55 11 99999-9999',
          email: 'admin@mhira.net',
          address: 'Rua Teste, 123',
          isSuperUser: true,
          passwordChangeRequired: false,
          gender: 'other',
          birthDate: '1990-01-01',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          roles: [
            {
              id: '1',
              name: 'Super Admin',
              isSuperAdmin: true,
              hierarchy: 1,
              code: 'SUPER_ADMIN',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          permissions: [
            {
              id: '1',
              name: 'ALL_PERMISSIONS',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          departments: [
            {
              id: '1',
              name: 'Administration',
              description: 'Administrative department',
              active: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      };
    }
    throw new Error('Invalid credentials');
  },
  
  me: () => ({
    id: '1',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@mhira.net',
    isSuperUser: true,
    active: true
  }),
  
  getUserProfile: () => ({
    id: '1',
    workID: 'SUPER001',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+55 11 99999-9999',
    email: 'admin@mhira.net',
    address: 'Rua Teste, 123',
    isSuperUser: true,
    passwordChangeRequired: false,
    gender: 'other',
    birthDate: '1990-01-01',
    acceptedTerm: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    roles: [
      {
        id: '1',
        name: 'Super Admin',
        isSuperAdmin: true,
        hierarchy: 1,
        code: 'SUPER_ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    permissions: [
      {
        id: '1',
        name: 'ALL_PERMISSIONS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    departments: [
      {
        id: '1',
        name: 'Administration',
        description: 'Administrative department',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  users: () => [{
    id: '1',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@mhira.net',
    isSuperUser: true,
    active: true
  }],
  
  tenants: () => [{
    id: '1',
    name: 'MHIRA Caregiver - Mental Health System',
    subdomain: 'default'
  }],
  
  assessments: () => [],
  patients: () => [],
  
  getReportsByResource: ({ resource }) => [
    {
      id: '1',
      name: `${resource} Report 1`,
      description: `Sample report for ${resource}`,
      url: '/reports/sample1',
      resources: resource
    },
    {
      id: '2', 
      name: `${resource} Report 2`,
      description: `Another report for ${resource}`,
      url: '/reports/sample2',
      resources: resource
    }
  ],
  
  disclaimers: () => [
    {
      type: 'PRIVACY',
      description: 'Privacy policy disclaimer',
      updatedAt: new Date().toISOString()
    },
    {
      type: 'TERMS',
      description: 'Terms of service disclaimer',
      updatedAt: new Date().toISOString()
    }
  ],
  
  createUser: ({ input }) => ({
    id: Date.now().toString(),
    ...input
  }),
  
  createTenant: ({ input }) => ({
    id: Date.now().toString(),
    ...input
  }),
  
  createAssessment: ({ input }) => ({
    id: Date.now().toString(),
    ...input
  }),
  
  createPatient: ({ input }) => ({
    id: Date.now().toString(),
    ...input
  })
};

// Endpoint de teste para capturar requisições
app.use('/test-endpoint', (req, res) => {
  console.log('=== REQUISIÇÃO CAPTURADA ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('================================');
  
  res.json({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false
}));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend de teste rodando na porta ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
