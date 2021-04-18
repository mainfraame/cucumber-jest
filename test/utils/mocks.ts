import deepClean from 'deep-clean';
import {rest} from 'msw';
import {setupServer} from 'msw/node';

export const $spy = jest.fn();

const callSpy = (req) => {
    const call = deepClean({
        url: req.url.pathname,
        method: req.method,
        ...(Object.keys(req.body || {}).length ? {data: req.body} : {}),
        ...(Object.keys(req.params || {}).length ? {params: req.params} : {})
    });

    $spy(call);
};

export const $server = setupServer(
    rest.get('/api/sign-up', (req, res, ctx) => {
        callSpy(req);

        return res(
            ctx.status(200),
            ctx.json({
                registered: false
            })
        );
    }),
    rest.post('/api/sign-up', (req, res, ctx) => {
        callSpy(req);

        return res(
            ctx.status(200),
            ctx.json({
                message: 'thanks for signing up!'
            })
        );
    })
);
