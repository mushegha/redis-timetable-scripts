import test from 'ava';

import Redis from 'ioredis';


const model = require('../');


const redis = new Redis();


const PIVOT = 0;

const clock = (hh=0, mm=0) => (hh + mm * 60) * 60;

test('init', t => {
    const name = 'ttadd';
    const dist = model[name];

    t.not(dist, void 0, 'should exist');
    t.notThrows(redis.defineCommand(name, dist), 'should evaluate');
});

test('run', async t => {
    // key
    const agent_id = 'A';

    // start
    const timestamp = clock(18, 0);

    const steps = [
        [0, 0],
        [1, 0],
        [0, 0]
    ];

    const durations = [
        clock(30),
        clock(10)
    ];

    const distances = [
        6000,
        6000
    ];

    const [
        lng1, lat1,
        lng2, lat2,
        lng3, lat3
    ] = steps;

    const [t1, t2] = durations;
    const [s1, s2] = distances;

    const route_id =  await redis.ttadd(
        agent_id,   // key
        timestamp,  // start
        lng1, lat1, // initial
        t1, s1,
        lng2, lat2, // midpoint
        t2, s2,
        lng3,lat3   // final
    );

    t.is(route_id, 1);

    // check redis
    const route_id_redis = await redis.get(agent_id + ':uid');
    t.is(route_id_redis, 1)

    const steps_redis = await redis.zrange(agent_id + ':timetable', 0, -1);
});