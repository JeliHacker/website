import * as geoword from '../../database/geoword.js';
import { getUserId, isAdmin } from '../../database/users.js';
import { checkToken } from '../../server/authentication.js';
import checkAnswer from '../../server/checkAnswer.js';

import { Router } from 'express';

const router = Router();

router.get('/admin/stats', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.redirect('/geoword/login');
        return;
    }

    const admin = await isAdmin(username);
    if (!admin) {
        res.redirect('/geoword');
        return;
    }

    const { packetName, division } = req.query;

    const stats = await geoword.getAdminStats(packetName, division);

    res.json({ stats });
});

router.get('/check-answer', async (req, res) => {
    const { givenAnswer, questionNumber, packetName } = req.query;
    const answer = await geoword.getAnswer(packetName, parseInt(questionNumber));
    const { directive, directedPrompt } = checkAnswer(answer, givenAnswer);
    res.json({ actualAnswer: answer, directive, directedPrompt });
});

router.get('/get-progress', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.redirect('/geoword/login');
        return;
    }

    const packetName = req.query.packetName;
    const { division, numberCorrect, points, totalCorrectCelerity, tossupsHeard } = await geoword.getProgress(packetName, username);

    res.json({ division, numberCorrect, points, totalCorrectCelerity, tossupsHeard });
});

router.get('/get-divisions', async (req, res) => {
    const divisions = await geoword.getDivisions(req.query.packetName);
    res.json({ divisions });
});

router.get('/leaderboard', async (req, res) => {
    const { packetName, division } = req.query;
    const leaderboard = await geoword.getLeaderboard(packetName, division);
    res.json({ leaderboard });
});

router.get('/packet-list', async (req, res) => {
    const packetList = await geoword.getPacketList();
    res.json({ packetList });
});

router.get('/get-question-count', async (req, res) => {
    const { packetName } = req.query;
    const questionCount = await geoword.getQuestionCount(packetName);
    res.json({ questionCount });
});

router.put('/record-division', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.sendStatus(401);
        return;
    }

    const { packetName, division } = req.body;
    const result = await geoword.recordDivision({ packetName, username, division });

    if (result) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.put('/record-protest', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.sendStatus(401);
        return;
    }

    const { packetName, questionNumber } = req.body;
    const result = await geoword.recordProtest({ packetName, questionNumber, username });

    if (result) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});


router.get('/stats', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.sendStatus(401);
        return;
    }

    const user_id = await getUserId(username);
    const { packetName } = req.query;
    const { buzzArray, division, leaderboard } = await geoword.getUserStats({ packetName, user_id });
    res.json({ buzzArray, division, leaderboard });
});

router.get('/record-buzz', async (req, res) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.sendStatus(401);
        return;
    }

    req.query.celerity = parseFloat(req.query.celerity);
    req.query.points = parseInt(req.query.points);
    req.query.questionNumber = parseInt(req.query.questionNumber);

    const user_id = await getUserId(username);
    const { packetName, questionNumber, celerity, points, givenAnswer } = req.query;
    const result = await geoword.recordBuzz({ celerity, points, packetName, questionNumber, givenAnswer, user_id });

    if (result) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

export default router;