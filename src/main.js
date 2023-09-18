require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

import api from './api';
import jwtMiddleware from './lib/jwtMiddleware';

// 비구조화 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((e) => {
        console.error(e);
    });

const app = new Koa();
const router = new Router();

// 라우터 설정
router.use('/api', api.routes()); // api 라우터 적용

// router를 적용하는 코드의 위에 위치해야 함
// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// PORT가 지정되어있지 않다면 4000을 그대로 이용함
const port = PORT || 4000;
app.listen(4000, () => {
    console.log('Listening to port %d', port);
});
