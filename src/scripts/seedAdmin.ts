import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../db/mongoose.js';
import { User } from '../modules/users/user.model.js';
import { env } from '../config/env.js';

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@local.test').toLowerCase();
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'StrongPass123';

  await connectDB();

  const existing = await User.findOne({ email });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    await User.create({ name, email, passwordHash, role: 'Admin' });
    console.log(`Created Admin: ${email}`);
  } else {
    if (existing.role !== 'Admin') {
      existing.role = 'Admin';
    }
    existing.name = name;
    existing.passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
    await existing.save();
    console.log(`Updated to Admin: ${email}`);
  }

  await disconnectDB();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
