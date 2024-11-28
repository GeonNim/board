const express = require('express');
const cors = require('cors');

const port = 8000;
const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (request, response) => {
  response.send('hello World test!');
});

app.use(require('./routes/postRoute'));
app.use(require('./routes/getRoute'));
app.use(require('./routes/patchRoute'));
app.use(require('./routes/delectRoute'));

app.listen(port, () => console.log(`Server running on ${port}`));
