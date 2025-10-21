import { createUser, findUserByEmail } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function sanitizeInput(input) {
  if (typeof input === "string") return input.trim();
  return input;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

export const register = async (req, res) => {
  try {
    const username = sanitizeInput(req.body.username);
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);

    if (!username || username.length > 50)
      return res.status(400).json({ message: 'Username tidak valid (maks. 50 karakter)' });
    if (!validateEmail(email))
      return res.status(400).json({ message: 'Format email tidak valid' });
    if (!validatePassword(password))
      return res.status(400).json({
        message: 'Password minimal 8 karakter, berisi huruf besar, huruf kecil, dan angka'
      });

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email atau username sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email, password: hashed });

    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = sanitizeInput(req.body.password);

    if (!validateEmail(email))
      return res.status(400).json({ message: 'Format email tidak valid' });
    if (!password)
      return res.status(400).json({ message: 'Password tidak boleh kosong' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};