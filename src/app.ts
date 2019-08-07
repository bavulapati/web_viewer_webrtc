import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { logger } from './logger';

const app: express.Application = express();

// app.use(cors);

app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'dist')));
app.use('/js', express.static(path.join(__dirname, '..', 'node_modules', 'socket.io-client', 'dist')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

app.use(morgan('tiny'));

// tslint:disable-next-line: typedef
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

app.get('/', (req: express.Request, res: express.Response) => {
    // res.send("Hello from tut app");
    // res.sendFile(path.join(__dirname, "views", "index.html"));
    res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

const port: number = 3000;
app.listen(port, () => {
    logger.info(`listening on port ${port}`);
});
