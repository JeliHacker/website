const scorer = require('../server/scorer.js');
const tests = require('./scorer.test.json');

function testAnswerline(group) {
    const answerline = group.answerline;
    let successful = 0, total = 0;

    group.tests.forEach(test => {
        const expected = test.directive;
        const givenAnswer = test.given;

        const result = scorer.checkAnswer(answerline, givenAnswer);

        console.assert(expected === result, `expected "${expected}" but got "${result}" for given answer "${givenAnswer}"`);

        total++;
        if (expected === result) successful++;
    });

    return { successful, total };
}


function testAnswerType(type) {
    console.log(`TESTING scorer.checkAnswer() for ${type} answerlines`);
    let successful = 0, total = 0;

    tests[type].forEach(group => {
        const { successful: s, total: t } = testAnswerline(group);
        successful += s;
        total += t;
    });

    console.log(`${successful}/${total} tests successful\n`);

    return { successful, total };
}

console.time('scorer.test.js');
let successful = 0, total = 0;

let { successful: s, total: t } = testAnswerType('formatted');
successful += s;
total += t;

({ successful: s, total: t } = testAnswerType('unformatted'));
successful += s;
total += t;

console.log(`OVERALL ${successful}/${total} tests successful`);
console.timeEnd('scorer.test.js');