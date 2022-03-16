var traverse = require('json-schema-traverse');
var schema = {
    properties: {
        foo: { type: 'string' },
        bar: { type: 'integer' }
    }
};
var cb;
var pre;
var post;
traverse(schema, { cb: cb });
// cb is called 3 times with:
// 1. root schema
// 2. {type: 'string'}
// 3. {type: 'integer'}
// Or:
//traverse(schema, {cb: {pre, post}});
// pre is called 3 times with:
// 1. root schema
// 2. {type: 'string'}
// 3. {type: 'integer'}
//
// post is called 3 times with:
// 1. {type: 'string'}
// 2. {type: 'integer'}
// 3. root schema
