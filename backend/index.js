const express = require('express')
const bodyParser = require('body-parser')
const model = require('./model')
const bcrypt = require('bcrypt')
const cors = require('cors')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000;

app.use(session({
    secret: "secret",
    saveUnitialized: true,
    resave: false,
    // cookie: {
    //     // secure: true, // fixes chrome, breaks postman
    //     sameSite: "none"
    // }
}))

app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({
    credentials: true,
    origin: function (origin, callback) {
        callback(null, origin); //avoid using wildcard origin
    }
}))

app.use(express.static("public"))


// MY MIDDLEWARES
function authorizeRequest(request, response, next) {

    if (request.session && request.session.userId) {
        next();
    } else {
        response.status(401).send("Not authenticated")
    }
}


app.get("/session", authorizeRequest, function (request, response) {
    // response.status(200).send("Authenticated")
    response.status(200).json({
        status: "Authenticated",
        session: request.session
    })
    console.log("Session:", request.session)
})

app.delete("/session", authorizeRequest, function (request, response) {
    request.session.userId = null
    response.status(200).send("logged out")
})


// Get all lists from user given username
app.get("/wishlists", authorizeRequest, function (request, response) {
    const creatorUsername = request.query.username

    if (creatorUsername) {
        model.Wishlist.find({ creator: creatorUsername }).then((wishlists) => {

            if (wishlists.length > 0) {
                response.set("Access-Control-Allow-Origin", "*")
                response.json(wishlists)
            } else {
                response.sendStatus(404)
            }

        }).catch((error) => {
            console.error("Failed to query wishlist with creatorUsername:", creatorUsername)
            response.sendStatus(404)
        })
    } else {
        model.Wishlist.find().then((wishlists) => {

            response.set("Access-Control-Allow-Origin", "*")
            response.json(wishlists)

        })
    }
})

app.get("/wishlists/api/:wishlistId", function (request, response) {
    response.sendFile("/backend/public/api_response.html")
})

// Get a wishlist by id
app.get("/wishlists/:wishlistId", function (request, response) {

    model.Wishlist.findOne({ _id: request.params.wishlistId }).then((wishlist) => {

        if (wishlist) {
            console.log("Got wishlist with id:", request.params.wishlistId)
            console.log("Wishlist Found:", wishlist)
            response.set("Access-Control-Allow-Origin", "*")
            response.json(wishlist)
        } else {
            response.sendStatus(404)
        }

    }).catch((error) => {
        console.error("Failed to query wishlist with id:", request.params.wishlistId)
        response.sendStatus(404)
    })
})


app.post("/wishlists", authorizeRequest, function (request, response) {
    // console.log("Request body:", request.body)
    // new_wishlist = request.body
    // All_Wishlists.push(new_wishlist)
    let content = request.body.content

    for (object of content) {
        if (object.priority > 10 || object.priority < 1 || isNaN(object.priority)) {
            response.status(400).send("Priority must be between 1 and 10 inclusive")
            return
        }
        if (object.price < 0 || isNaN(object.price)) {
            response.status(400).send("Price must be a positive number")
            return
        }

    }
    const wishlistData = request.body
    console.log("wishlist data:", wishlistData)

    const newWishlist = new model.Wishlist(wishlistData)

    newWishlist.save().then(() => {
        response.set("Access-Control-Allow-Origin", "*")
        response.status(201).send("Created")
    })
})

app.delete("/wishlists/:wishlistId", authorizeRequest, function (request, response) {
    model.Wishlist.deleteOne({
        _id: request.params.wishlistId,
        creator: request.session.username
    }).then((wishlist) => {
        if (wishlist) {
            response.set("Access-Control-Allow-Origin", "*")
            response.status(200).send("Deleted")
        } else {
            response.sendStatus(404)
        }
    }).catch((error) => {
        console.error("Error:", error)
        response.sendStatus(404)
    })

    // Find the document first for recording purposes
    // model.Wishlist.findOne({ _id: request.params.wishlistId }).then((wishlist) => {
    //     if (wishlist) {
    //         console.log("Document with id:", request.params.wishlistId, "found")
    //         console.log("Document to delete", wishlist)
    //         return model.Wishlist.deleteOne({ 
    //             _id: request.params.wishlistId,
    //             creator: request.session.username
    //         })
    //     } else {
    //         response.sendStatus(404)
    //     }
    // }).then(() => {
    //     response.set("Access-Control-Allow-Origin", "*")
    //     response.status(200).send("Deleted")
    // }).catch((error) => {
    //     console.error("Failed to query wishlist with id:", request.params.wishlistId)
    //     response.sendStatus(404)
    // })
})

// db.wishlists.updateOne({ "content._id" : ObjectId("65d67857d77473b4191b8cf6") }, { $set: { "content.$.price" : 100 } } )
// Are these the same?
app.put("/wishlists/:wishlistId", authorizeRequest, function (request, response) {
    //find the document to modify
    const filter = { 
        _id: request.params.wishlistId,
        creator: request.session.username
    }
    const updatedData = request.body

    let content = request.body.content

    for (object of content) {
        if (object.priority > 10 || object.priority < 1 || isNaN(object.priority)) {
            response.status(400).send("Priority must be between 1 and 10 inclusive")
            return
        }
        if (object.price < 0 || isNaN(object.price)) {
            response.status(400).send("Price must be a positive number")
            return
        }

    }
    model.Wishlist.updateOne(filter, updatedData).then(() => {
        response.set("Access-Control-Allow-Origin", "*")
        response.status(200).send("Updated")
    }).catch((error) => {
        console.error("Failed to query wishlist with id:", request.params.wishlistId)
        response.set("Access-Control-Allow-Origin", "*")
        response.sendStatus(404)
    })

    //Modify the document

})

//DISABLE THIS BEFORE DEPLOYMENT
//ONLY RETURN THE USERS NOT THE PASSWORDS TOO
app.get("/users", function (request, response) {
    model.User.find({}, '_id username friends').then((users) => {
        response.set("Access-Control-Allow-Origin", "*")
        response.json(users)
    })
})

app.get("/users/:username", function (request, response) {

    model.User.findOne({ username: request.params.username }, '_id username friends').then((user) => {
        if (user) {
            response.set("Access-Control-Allow-Origin", "*")
            response.json(user)
        } else {
            response.sendStatus(404)
        }
    }).catch((error) => {
        console.error("Failed to query user with username:", request.params.username)
        response.sendStatus(404)
    })

})

app.post("/login", function (request, response) {

    if (request.body.username === "") {
        response.status(400).send("No username provided")
        return
    }
    if (request.body.password === "") {
        response.status(400).send("No password provided")
        return
    }
    if (request.body.username.length > 50) {
        response.status(400).send("Username is too long")
        return
    }
    if (request.body.password.length > 75) {
        response.status(400).send("Password is too long")
        return
    }

    model.User.findOne({ username: request.body.username }).then((user) => {

        if (user) {
            bcrypt.compare(request.body.password, user.password, function(error, result) {
                if (error) {
                    console.error("error comparing passwords:", error)
                    response.sendStatus(500)
                } else {
                    if (result) {
                        response.set("Access-Control-Allow-Origin", "*")
                        response.sendStatus(200)
                        console.log("passwords match")
                        console.log("User data:", user)
                    } else {
                        console.log("Passwords do not match")
                        response.set("Access-Control-Allow-Origin", "*")
                        response.status(401).send("Username or password is incorrect")
                    }
                }
            })
        } else {
            setTimeout(function () {
                response.set("Access-Control-Allow-Origin", "*")
                response.status(401).send("Username or password is incorrect")
            }, 180)
        }
    }).catch((error) => {
        response.sendStatus(500)
    })
})


// authentication: create session
app.post("/session", function (request, response) {

    if (request.body.username === "") {
        response.status(400).send("No username provided")
        return
    }
    if (request.body.password === "") {
        response.status(400).send("No password provided")
        return
    }
    if (request.body.username.length > 50) {
        response.status(400).send("Username is too long")
        return
    }
    if (request.body.password.length > 75) {
        response.status(400).send("Password is too long")
        return
    }
    // access provided credentials credentials: request.body.username and request.body.password
    // find user in DB using given credentials
    model.User.findOne({ username: request.body.username }).then(function (user) {
        if (user) {
            // if found: verify password if username
            user.verifyEncryptedPassword(request.body.password).then(function (match) {
                // if password is legit: respond with 201
                if (match) {
                    // username and password are valid, log them in
                    // TODO: save user's ID into session data
                    request.session.userId = user._id
                    request.session.username = user.username
                    // response.set("Access-Control-Allow-Origin", "*")
                    response.status(201).send("Authenticated");
                } else {
                    // response.set("Access-Control-Allow-Origin", "*")
                    response.sendStatus(401);
                }
            })
        } else {
            // response.set("Access-Control-Allow-Origin", "*")
            response.sendStatus(401);
        }
    })
})

// app.post("/users", function (request, response) {
        
//     if (request.body.password === "" || request.body.password.length < 6 || request.body.password.length > 75) {
//         response.status(400).send("Password doesn't meet length requirements")
//         return
//     }
//     if (request.body.username.length > 50) {
//         response.status(400).send("Username is too long")
//         return
//     }

//     model.User.findOne({ username: request.body.username }).then((user) => {

//         if (user) {
//             response.set("Access-Control-Allow-Origin", "*")
//             response.status(401).send("Username already exists.")
//         } else {

//             bcrypt.hash(request.body.password, 12, (error, hashedPassword) => {
//                 if (error) {
//                     console.error("Error hashing password:", error)
//                     response.sendStatus(500)
//                     return
//                 }

//                 const newUser = new model.User({
//                     username: request.body.username,
//                     password: hashedPassword
//                 })

//                 newUser.save().then(() => {
//                     response.set("Access-Control-Allow-Origin", "*")
//                     response.status(201).send("Created new user")
//                 }).catch((error) => {
//                     if (error.name === 'ValidationError') {
//                         response.status(400).send({ message: error.message })
//                     }
//                 })
//             })
//         }
//     }).catch((error) => {
//         console.error("Failed to query user with username:", request.params.username)
//         response.sendStatus(404)
//     })
// })

app.post("/users", function (request, response) {

    if (request.body.password === "" || request.body.password.length < 6 || request.body.password.length > 75) {
        response.status(400).send("Password doesn't meet length requirements")
        return
    }
    if (request.body.username.length > 50) {
        response.status(400).send("Username is too long")
        return
    }
    if (request.body.username.trim() === "") {
        response.status(400).send("Username cannot be empty or only spaces")
        return
    }

    model.User.findOne({ username: request.body.username }).then((user) => {

        if (user) {
            response.set("Access-Control-Allow-Origin", "*")
            response.status(401).send("Username already exists.")
        } else {
            const newUser = new model.User({
                username: request.body.username,
                password: request.body.password,
            })

            newUser.EncryptPassword(request.body.password).then(function () {
                // at this time the password has been encrypted and set on the user
                newUser.save().then(() => {
                    response.set("Access-Control-Allow-Origin", "*")
                    response.status(201).send("Created new user")
                }).catch((error) => {

                    if (error.name === 'ValidationError') {
                        response.status(400).send({ message: error.message })
                    }
                })
            })
        }
    })
})

app.put("/users/:username", async function (request, response) {
    let user = await model.User.findOne({ username: request.params.username });
    let friendToAdd = await model.User.findOne({ username: request.body.friend });
    if (user && friendToAdd) {
        if (user.friends.includes(friendToAdd.username)) {
            response.set("Access-Control-Allow-Origin", "*")
            response.status(401).send("Friend already added")
            return
        }

        user.friends.push(friendToAdd.username)
        model.User.updateOne({ username: request.params.username}, user).then(() => {
            response.set("Access-Control-Allow-Origin", "*")
            response.status(200).json("Updated")
            console.log("Friend:", friendToAdd, "Added to", user, "friends list")
        }).catch((error) => {
            console.error("Failed to add friend")
            response.set("Access-Control-Allow-Origin", "*")
            response.sendStatus(500)
        })
    } else {
        response.set("Access-Control-Allow-Origin", "*")
        response.status(404).send("Username or friend name not found")
    }
})


app.listen(port, function () {
    console.log("Server Running...")
})
