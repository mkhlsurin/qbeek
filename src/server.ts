import { env } from './config/env.js';
import { connectDB } from './db/mongoose.js';
import app from './app.js';

async function main() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running at http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
