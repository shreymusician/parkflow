const dotenv = require('dotenv');

dotenv.config();

const validateEnv = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missingVars = [];

  requiredVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    console.error(`\x1b[31m[CRITICAL ERROR] Missing required environment variables: ${missingVars.join(', ')}\x1b[0m`);
    console.error('System startup aborted to ensure security and stability.');
    process.exit(1);
  }

  console.log('Environment Variables Validated Successfully');
};

module.exports = validateEnv;
