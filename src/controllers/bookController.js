const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { createBooks, getAllBooks, getBookById, wishBook, deleteById, editBook, getBookByUser } = require('../services/bookService');
const mapErrors = require('../util/mapError');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Create Book Review', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const bookData = {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        stars: Number(req.body.stars),
        image: req.body.image,
        review: req.body.review,
        owner: req.user._id,
    };

    try {
        if (Object.values(bookData).some(v => !v)) {
            throw new Error('All fields are required');
        }

        await createBooks(bookData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Create Book Review', data: bookData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const books = await getAllBooks();
    // console.log(books);
    res.render('catalog', { title: 'Book Catalog', books });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details/', async (req, res) => {
    try {
        const currBook = await getBookById(req.params.id);
        // console.log(currBook);    // see below

        // if(currCrypto.owner == req.user._id) {
        //     currCrypto.isOwner = true;
        // }
        // or
        const isOwner = currBook.owner == req.user?._id;
        // req.user?._id -->> въпросителната е - ако има user вземи user, ако няма user върни undefined
        // currGame.owner e създателя/owner-a на Играта
        // req.user?._id e owner-a на профила 
        // req.params.gameId -->> e _id на криптото


        // проверка за харесвания
        // currPlay.liked = req.user && currPlay.usersLiked.includes(req.user._id); 
        // .....or.....
        // const isLiked = currPlay.usersLiked?.includes(req.user?._id);
        const isWished = currBook.usersWished?.find(user => user._id == req.user?._id);
        // ако нямаме isLiked ще даде undefined и грешка -->> TypeError: Cannot read properties of undefined (reading 'some')
        // затова на usersLiked поставяме ?
        // .....or.....
        // const isLiked = currPlay.usersLiked.length;


        res.render('details', { title: 'Book Details', currBook, isOwner, isWished });

    } catch (err) {
        console.log(err.message);
        res.redirect('/404');
    }
});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });




router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    try {
        const currBook = await getBookById(req.params.id);
        // console.log(currBook);
        // {
        //     _id: new ObjectId("64807caf7e50fe4bf1990e76"),
        //     title: 'A Game Of Thrones',
        //     author: 'David Benioff',
        //     genre: 'fantasy or drama',
        //     stars: 3,
        //     image: 'http://localhost:3000/static/image/Game-of-thrones.jpg',
        //     review: "Game of Thrones boasts an intricate plot with complex characters, stunning cinematography, and intense action sequences, especially its many battles and fights. It's hard to deny that it wasn't a cultural phenomenon that captivated me and many others for eight seasons.",
        //     owner: new ObjectId("64806822e1b2ccc415e315ef"),
        //     __v: 2,
        //     usersWished: [
        //       new ObjectId("64806aec16e81be6c406baed"),
        //       new ObjectId("6480df0883cd9585a453a0ba")
        //     ]
        // }

        if (currBook.owner != req.user._id) {
            throw new Error('Cannot edit Book that you are not owner');
        }

        res.render('edit', { title: 'Edit Book', currBook });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }


    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currBook = await getBookById(req.params.id);
    
    if (currBook.owner != req.user._id) {
        throw new Error('Cannot edit Book that you are not owner');
    }


    const bookId = req.params.id;

    const currEditBook = {
        _id: req.params.id,
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        stars: Number(req.body.stars),
        image: req.body.image,
        review: req.body.review,
    };


    try {
        // Имаме валидация в Модела, затова не ни трябва тук
        // if (Object.values(currEditBook).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await editBook(bookId, currEditBook);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        // 2 начина да добавим _id към редактирания обект:
        // currEditBook._id = bookId;  -->> служи да подадем id в edit.hs, но там диретно трием action=""
        // currBook: Object.assign(currEditBook, { _id: req.params.id }),

        res.render('edit', { title: 'Edit Theater Play', currBook, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    try {
        const currBook = await getBookById(req.params.id);
        
        if (currBook.owner != req.user._id) {
            throw new Error('Cannot delete Book that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }

});


router.get('/catalog/:id/wished', isAuth, async (req, res) => {
    try {
        const currBook = await getBookById(req.params.id);
        
        if (currBook.owner == req.user._id) {
            throw new Error('Cannot wished your own book!');
        }

        await wishBook(req.params.id, req.user._id);
        res.redirect(`/catalog/${req.params.id}/details`);
    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
});



router.get('/profile', isAuth, async (req, res) => {
    const wishedBooksByUser = await getBookByUser(req.user._id);
    // console.log(wishedBooksByUser);
    // [
    //     {
    //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
    //       title: 'Book 4 Study',
    //       author: 'Peter Smart',
    //       genre: 'Study',
    //       stars: 5,
    //       image: 'http://localhost:3000/static/image/book-4.png',
    //       review: 'Study hard',
    //       owner: new ObjectId("64806aec16e81be6c406baed"),
    //       __v: 2,
    //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
    //     }
    // ]

    // Можем да добавим обекта в res.locals.името на обекта
    // template profile -->> {{#each wishedBooks}}
    res.locals.wishedBooks = wishedBooksByUser;
    res.render('profile', { title: 'Profile Page'});

    // or
    // template profile -->> {#each user.wishedBooksByUser}}
    // res.render('profile', {
    //     title: 'Profile Page',
    //     user: Object.assign({ wishedBooksByUser }, req.user)
    // });
});


// router.get('/search', isAuth, async (req, res) => {
//     const { cryptoName, paymentMethod } = req.query;
//     const crypto = await search(cryptoName, paymentMethod);

//     const paymentMethodsMap = {
//         "crypto-wallet": 'Crypto Wallet',
//         "credit-card": 'Credit Card',
//         "debit-card": 'Debit Card',
//         "paypal": 'PayPal',
//     };

//     const paymentMethods = Object.keys(paymentMethodsMap).map(key => ({
//         value: key, 
//         label: paymentMethodsMap[key] ,
//         isSelected: crypto.paymentMethod == key
//     }));


//     res.render('search', { crypto, paymentMethods });
// });




module.exports = router;






// console.log(currGame);;
// {
//     _id: new ObjectId("647652253addd63fbb6d6f07"),
//     platform: 'PS5',
//     name: 'Mortal Kombat',
//     image: 'http://localhost:3000/static/images/mortal-kombat.png',
//     price: 250,
//     genre: 'Action',
//     description: 'Mortal Kombat fight game for adults',
//     owner: new ObjectId("6473c444cd9aad92fcefb5e3"),
//     __v: 0
// }


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }