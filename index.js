require('dotenv').config;
const express = require('express');
const path = require('path');
const aws = require('aws-sdk');
const uuid = require('uuid');

const isEC2 = false;
const ACCESS_KEY = process.env.ACCESS_KEY ? process.env.ACCESS_KEY : "<PERSONAL ACCESS KEY>";
const SECRET_KEY = process.env.SECRET_KEY ? process.env.SECRET_KEY : "<PERSONAL SECRET KEY>";
const REGION = process.env.REGION ? process.env.REGION : "<PERSONAL REGION>";

aws.config.update('eu-west-1');
const s3 = isEC2 ? new aws.S3() : new aws.S3({ accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY, region: REGION });
const dynamodb = isEC2 ? new aws.DynamoDB() : new aws.DynamoDB({ accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY, region: REGION });

async function connectedToS3() {
  try {
    await s3.listBuckets().promise();
    return true;
  } catch (e) {
    return false;
  }
};

async function connectedToDynamo() {
  try {
    const data = await dynamodb.listTables().promise();
    return true;
  } catch (e) {
    return false;
  }
}


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/api/v1/s3connected', async (req, res) => {
  const connected = await connectedToS3();
  res.send({connected});
});

app.get('/api/v1/dynamoconnected', async (req, res) => {
  const connected = await connectedToDynamo();
  res.send({ connected });
});

app.get('/api/v1/players', (req, res) => {

  const data = {
    TableName: 'demo-players'
  }
  dynamodb.scan(data, (err, data) => {  
    if (err) {
      console.log(err);
      res.send({ success: false, data });
    } else {
      res.send({ success: true, data });
    }
  });
});

app.post('/api/v1/player', (req, res) => {

  const body = req.body;
  const data = {
    TableName: 'demo-players',
    Item: {
      'id': { S: uuid.v4() },
      'firstname': { S: body.firstname },
      'lastname': { S: body.lastname },
      'phone': { S: body.phone }
    }
  }
  dynamodb.putItem(data, (err, data) => { 
    if (err) {
      console.log(err);
      res.send({ success: false });
    } else {
      res.send({ success: true });
    }
  });
});

app.listen(80, () => {
  console.log('Server is running on port 80');
});
