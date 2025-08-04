//imports our env vairables into process.env
require('./config/dotenv');

const app = require('./app');
const connectDb  = require('./config/db');

const PORT = process.env.PORT;

connectDb().then(() => {
    console.log("Db Connected!");
    app.listen(PORT, () => {
        `App listening on port ${PORT}`
    })
}).catch((err) => {
    console.error('Db Connection Failed', err);
    process.exit(1);
})