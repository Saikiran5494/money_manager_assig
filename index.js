const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const dbPath = path.join(__dirname, "artists.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

// addQuery

app.post("/addtransaction", async (request, response) => {
  const { id, type, description, amount, date } = request.body;
  let balance = null;

  const last = `select running_balance from transactions order by id desc;`;
  const dblast = await db.get(last);
  const { running_balance } = dblast;

  if (type === "credit") {
    balance = running_balance + parseInt(amount);
  } else {
    balance = running_balance - amount;
  }

  const addQuery = `
    INSERT INTO Transactions(id,type,description,amount,date,running_balance) 
    VALUES(
    ${id},'${type}','${description}','${amount}','${date}','${balance}');
  `;

  const dbResponse = await db.run(addQuery);
  response.send(dbResponse);
  console.log("dataAdded");
});

// getAllQuery

app.get("/transactions", async (request, response) => {
  const getAllQuery = `SELECT * FROM transactions;`;
  const dbrepsonse = await db.all(getAllQuery);
  response.send(dbrepsonse);
  console.log("success");
});

// updateQuery

app.put("/transactions/:transactionId", async (request, response) => {
  const { transactionId } = request.params;
  const { id, type, amount, description, date, runningbalance } = request.body;
  const updateQuery = `
    UPDATE transactions
    SET 
      id = ${id},
      type = '${type}',
      amount = ${amount},
      description = '${description}',
      date = ${date},
      running_balance = ${runningbalance}
    WHERE id = ${transactionId};  
  `;

  const updatedResponse = await db.run(updateQuery);
  response.send(updatedResponse);
  console.log("Updated Successfully");
});

// delete API Query

app.delete("/transactions/:transactionsId", async (request, response) => {
  const { transactionsId } = request.params;
  const deleteQuery = `
    DELETE FROM transactions WHERE id = ${transactionsId};
  `;
  const deleteResponse = await db.run(deleteQuery);
  response.send(deleteResponse);
  console.log(deleteResponse);
});

initializeDBAndServer();
