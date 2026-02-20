import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', router);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.log("Error: " + err);
  res.json({ error: "Something went wrong" });
});

var port = 3000;
app.listen(port, () => {
  console.log("Task Tracker API running on port " + port);
});
