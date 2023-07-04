import * as geoword from '../../database/geoword.js';
import { getReports, updateSubcategory } from '../../database/questions.js';
import { isAdmin } from '../../database/users.js';
import { checkToken } from '../../server/authentication.js';

import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

router.use(async (req, res, next) => {
    const { username, token } = req.session;
    if (!checkToken(username, token)) {
        delete req.session;
        res.redirect('/geoword/login');
        return;
    }

    const admin = await isAdmin(username);
    if (!admin) {
        res.status(403).redirect('/user/my-profile');
        return;
    }

    next();
});

router.get('/list-reports', async (req, res) => {
    const { reason } = req.query;
    return res.json(await getReports(reason));
});

router.get('/geoword/protests', async (req, res) => {
    const { packetName, division } = req.query;
    const { protests, packet } = await geoword.getProtests(packetName, division);
    res.json({ protests, packet });
});

router.post('/geoword/resolve-protest', async (req, res) => {
    const { id, decision, reason } = req.body;
    const result = await geoword.resolveProtest({ id: new ObjectId(id), decision, reason });

    if (result) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.get('/geoword/stats', async (req, res) => {
    const { packetName, division } = req.query;
    const stats = await geoword.getAdminStats(packetName, division);
    res.json({ stats });
});

router.put('/update-subcategory', async (req, res) => {
    const { _id, type, subcategory } = req.body;
    const result = await updateSubcategory(new ObjectId(_id), type, subcategory);

    if (result) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

export default router;