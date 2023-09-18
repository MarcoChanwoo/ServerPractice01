import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';
import checkLoggedIn from '../../lib/checkLoggedIn';

const posts = new Router();

posts.get('/', postsCtrl.list);
posts.post('/', checkLoggedIn, postsCtrl.write); // 로그인 시에만 쓸수 있도록!

const post = new Router(); // /api/posts/:id
posts.get('/:id', postsCtrl.checkObjectId, postsCtrl.read);
posts.delete('/:id', checkLoggedIn, postsCtrl.checkObjectId, postsCtrl.remove);
posts.patch('/:id', checkLoggedIn, postsCtrl.checkObjectId, postsCtrl.update);

post.use('/:id', postsCtrl.checkObjectId, post.routes());

export default posts;
