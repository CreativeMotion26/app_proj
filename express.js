const express = require("express");
const userInfo = require("./until/config.json");
const app = express();
const port = 3000;

// console.log(userInfo)

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const { Client }  = require("pg");
const Query = require('pg').Query


//async 없는 연결
let client = new Client({
    user : userInfo.user,
    host : userInfo.host,
    database : userInfo.database,
    password : userInfo.password,
    port : userInfo.port
})

client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
        console.log('success!')
    }
  });

  app.get('/read', function(req, res) {
    const query = new Query("SELECT * FROM tbl_test")
    client.query(query)
  
    let rows = [];

    query.on("row",row=>{
      rows.push(row);
    });
    query.on('end', () => {
      console.log(rows);
      console.log('query done')
      res.send(rows);
      res.status(200).end();
    });
    query.on('error', err => {
      console.error(err.stack)
    });
  });

app.post('/posts', insertQuery);


app.delete("/posts/:id", deleteQuery);


app.listen(port, () => {
    console.log(`START SERVER : use ${port}`);
});


// 실행 함수
async function insertQuery(req, res) {
    const client = new Client({
        user : userInfo.user,
        host : userInfo.host,
        database : userInfo.database,
        password : userInfo.password,
        port : userInfo.port
    })
  
    try {
      await client.connect();
      console.log('Connected to PostgreSQL');
      console.log(req.body);
      const { test_code, test_name, test_id } = req.body;
      
      const values = [test_code, test_name, test_id];
    console.log(values)

      const queryResult = await client.query('INSERT INTO tbl_test(test_code, test_name, test_id) VALUES($1, $2, $3) RETURNING *', values);
      res.status(201).json(queryResult.rows[0]);
      console.log('Query results:', queryResult.rows);
    } catch (err) {
      console.error('Error executing query', err.stack);
    } finally {
      await client.end();
    }
  };


  async function deleteQuery(req, res) {
    const client = new Client({
        user : userInfo.user,
        host : userInfo.host,
        database : userInfo.database,
        password : userInfo.password,
        port : userInfo.port
    })
  
    try {
      await client.connect();
      console.log('Connected to PostgreSQL');
      console.log(req.body);
      const { id } = req.params;
      const query = 'DELETE FROM tbl_test WHERE test_code = $1 RETURNING *';
      const values = [id];

      const queryResult = await client.query(query, values);
      res.status(201).json(queryResult.rows[0]);
      console.log('Query results:', queryResult.rows);
    } catch (err) {
      console.error('Error executing query', err.stack);
    } finally {
      await client.end();
    }
  };