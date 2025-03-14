import 'dotenv/config';
import express from 'express';
import accountRoute from './route/accountRoute.js';
import otpRoute from './route/otpRoute.js';
import learningItemRoute from './route/learningItemRoute.js';
import googleTtsRoute from './route/googleTtsRoute.js';
import jishoRoute from './route/jishoRoute.js';
const app = express();

app.use(express.json());
app.use('/account', accountRoute);
app.use('/otp', otpRoute);
app.use('/learning-item', learningItemRoute);
app.use('/google-tts', googleTtsRoute);
app.use('/jisho', jishoRoute);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});