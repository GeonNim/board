const express = require('express');
const cors = require('cors');

const port = 8000;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.get('/', (request, response) => {
  response.send('hello World test!');
});

app.use(require('./routes/postRuoute'));

app.listen(port, () => console.log(`Server running on ${port}`));
