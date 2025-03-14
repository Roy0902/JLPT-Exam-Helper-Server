import 'dotenv/config';
import express from 'express';
import account_route from './route/account_route.js';
import otp_route from './route/otp_route.js';
import learning_item_route from './route/learning_item_route.js';
import google_tts_route from './route/google_tts_route.js';
import jisho_route from './route/jisho_route.js';
const app = express();

app.use(express.json());
app.use('/account', account_route);
app.use('/otp', otp_route);
app.use('/learning-item', learning_item_route);
app.use('/google-tts', google_tts_route);
app.use('/jisho', jisho_route);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});