# Listy - A Wishlist Application

## Resource

__Wishlist__

Attributes:
* name (string)
* content (array of objects)
    * item (string)
    * link (string)
    * price (number)
    * priority (number)
* creator (string)

__User__

Attributes:
* username (string)
* password (string)


## Data Model/Schema

### Wishlist Model

```javascript

const contentSchema = new mongoose.Schema({
    item: String,
    link: String,
    price: Number,
    priority: Number
});

const wishlistSchema = new mongoose.Schema({
    name: String,
    content: [contentSchema],
    creator: String
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

```

### User Model

```javascript

const User = mongoose.model('User', {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

```

## REST Endpoints

| Name | Method | Path |
| ---- | ------ | ---- |
| Retrieve wishlists by user | GET | /wishlists/\<username> |
| Create in wishlists collection | POST | /wishlists |
| Delete wishlists member | DELETE | /wishlists/\<id> |
| Update wishlists member | PUT | /wishlists/\<id> |
| Retrieve user in users collection | GET | /users/\<username> |
| Create in users collection | POST | /users |
| Create session | POST | /session |
| Get session data | GET | /session |
| Delete session | DELETE | /session |


## Deployed application url

This web application was deployed through render.com and can be found [here](https://s24-sessions-hstevenscli.onrender.com)
