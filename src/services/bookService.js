const Book = require('../models/BookModel');
// const { eventNames } = require('../models/User');


async function getAllBooks() {
    return Book.find({}).lean();

    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getBookByUser(userId) {
    return Book.find({ usersWished: userId }).lean();
}

async function getBookById(bookId) {
    return await Book.findById(bookId).lean();
    
    // return await Book.findById(bookId).populate('usersLiked').lean();
    // .populate('usersLiked') -->> когато искаме да извадим масива с usersLiked (кои id-та са харесали пиесата)
}

// async function getGameAndUsers(id) {
//     return Game.findById(id).populate('owner').lean();
// }

async function createBooks(bookData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${bookData.title}$`, 'i');
    const existing = await Book.findOne({ title: { $regex: pattern } });

    if (existing) {
        throw new Error('A theater play with this name already exists');
    }

    const result = new Book(bookData);
    await result.save();
    return result;
}

async function editBook(bookId, currEditBook) {
    const existing = await Book.findById(bookId);

    existing.title = currEditBook.title;
    existing.author = currEditBook.author;
    existing.genre = currEditBook.genre;
    existing.stars = currEditBook.stars;
    existing.image = currEditBook.image;
    existing.review = currEditBook.review;

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(bookId) {
    return Book.findByIdAndDelete(bookId);
}



async function wishBook(bookId, userId) {
    const existing = await Book.findById(bookId);

    if(existing.usersWished.includes(userId)) {
        throw new Error('Cannot book twice');
    }

    existing.usersWished.push(userId);
    return existing.save();

    // Друг начин за увеличаване на Likes 
    // но за целта ни трябва в Model-a пропърти -- wishBook: { type: Nimber }
    // след което в тази функция записваме:
    // existing.usersWished.push(userId);
    // existing.likes++;

}


async function sortByLikes(orderBy) {
    return Book.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
}



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }

// console.log(game);
// {
//     buyers: [],
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

// console.log(userId)
// 6477a39de63159e157a32fa6  --> George




// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }



module.exports = {
    getAllBooks,
    createBooks,
    getBookById,
    wishBook,
    deleteById,
    editBook,
    getBookByUser
};