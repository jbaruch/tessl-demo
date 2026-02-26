import express from 'express';
import cors from 'cors';
import router from './routes';
import { hashPassword, generateToken } from './auth';
import { createUser, findUser } from './db';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

// Seed a default admin user
if (!findUser('admin')) {
  createUser('admin', hashPassword('admin123'), 'admin');
  console.log("Default admin user created (admin/admin123)");
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
