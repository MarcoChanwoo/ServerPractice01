import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from '../../../node_modules/joi/lib/index';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }
    try {
        const post = await Post.findById(id);
        // 포스트가 존재하지 않을 때
        if (!post) {
            ctx.status = 404; // Not Found
            return;
        }
        ctx.state.post = post;
        return next();
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const write = async (ctx) => {
    const schema = Joi.object().keys({
        // 객체가 다음 필드를 갖고 있음을 검증
        title: Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array().items(Joi.string()).required(),
    });
    // 검증 후 실패인 경우 에러처리
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user: ctx.state.user,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

/**
 * GET /api/posts?username=&tag=&page=
 */
export const list = async (ctx) => {
    // query는 문자열이므로 숫자로 변환해야 함
    // 값이 주어지지 않았다면 1을 기본으로 사용함
    const page = parseInt(ctx.query.page || '1', 10);

    if (page < 1) {
        ctx.status = 400;
        return;
    }
    const { tag, username } = ctx.query;
    // tag, username값이 유효하다면 객체안에 삽입, 아니면 삽입 안함
    const query = {
        ...Joi(username ? { 'user.username': username } : {}),
        ...Joi(tag ? { tags: tag } : {}),
    };

    try {
        const posts = await Post.find(query)
            .sort({ _id: -1 })
            .limit(10)
            .skip((page - 1) * 10)
            .lean()
            .exec();
        const postCount = await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts.map((post) => ({
            ...post,
            body:
                post.body.length < 200
                    ? post.body
                    : `${post.body.slice(0, 200)}...`,
        }));
    } catch (e) {
        ctx.throw(500, e);
    }

    // try {
    //     const posts = await Post.find().exec();
    //     ctx.body = posts;
    // } catch (e) {
    //     ctx.throw(500, e);
    // }
};

export const read = (ctx) => {
    ctx.body = ctx.state.post;
    // const { id } = ctx.params;
    // try {
    //     const post = await Post.findById(id).exec();
    //     if (!post) {
    //         ctx.status = 404; //Not Found
    //         return;
    //     }
    //     ctx.body = post;
    // } catch (e) {
    //     ctx.throw(500, e);
    // }
};

export const remove = async (ctx) => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; // No Content(성공했으나 응답할 데이터가 없음)
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const update = async (ctx) => {
    const { id } = ctx.params;
    // write에서 사용한 schema와 비슷하나 required()가 없음
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });
    // 검증 후 싪패인 경우 에러처리
    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400; // Bad Request
        ctx.body = result.error;
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true,
            // true: 업데이트된 데이터를 반환함
            // false: 업데이트되기 전의 데이터를 반환함
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch (e) {
        ctx.throw(500, e);
    }
};

export const checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;
    if (post.user._id.toString() !== user._id) {
        ctx.staus = 403;
        return;
    }
    return next();
};
