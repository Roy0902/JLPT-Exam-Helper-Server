import 'dotenv/config';
import express from 'express';
import accountRoute from './route/accountRoute.js';
import otpRoute from './route/otpRoute.js';
import learningItemRoute from './route/learningItemRoute.js';

const app = express();

app.use(express.json());
app.use('/', accountRoute);
app.use('/', otpRoute);
app.use('/', learningItemRoute);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});