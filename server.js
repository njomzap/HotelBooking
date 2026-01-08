require('dotenv').config();   // <-- load env first
const app = require('./app'); // now app.js will see env variables

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
