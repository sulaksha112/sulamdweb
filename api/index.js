import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { readFile } from 'fs/promises';
import code from './pair.js';
import serverless from 'serverless-http';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/code', code);

app.get('/pair', async (req, res) => {
    const html = await readFile(path.join(__dirname, 'pair.html'), 'utf-8');
    res.send(html);
});

app.get('/', async (req, res) => {
    const html = await readFile(path.join(__dirname, 'main.html'), 'utf-8');
    res.send(html);
});

export const handler = serverless(app);
