const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');

module.exports = (app) => {
    app.use(homeController);
    app.use(authController);
    app.use(bookController);

    // 404 page
    app.get('*', (req, res) => {
        res.render('404', { title: 'Page Not Found' });
    });
};





