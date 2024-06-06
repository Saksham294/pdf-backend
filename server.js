const app = require("./app");
const dotenv=require("dotenv");

dotenv.config()

const PORT = process.env.PORT || 5000;
console.log(process.env.PORT)
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
 });
  
process.on("unhandledRejection", (err, promise) => {
    console.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});