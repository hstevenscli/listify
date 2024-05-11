Vue.createApp({
    data: function () {
        return {
            pageFocus: "main",
            listSaved: true,
            showLogin: false,
            showCreateAccount: false,
            showAddRow: false,
            showAddFriend: false,
            loggedIn: false,
            showSignOut: false,
            showNewList: false,
            showDeleteList: false,
            loginUsername: "",
            loginPassword: "",
            createAccountUsername: "",
            createAccountPassword: "",
            createAccountPasswordConfirmed: "",
            newRowItemName: "",
            newRowItemLink: "",
            newRowItemPrice: "",
            newRowItemPriority: 0,
            newFriendToAdd: "",
            newWishlistName: "",
            testMessage: "Testing the data return function from vueapp.js",
            greeter: "Please Log In or Register to Continue",
            greetersub: "",
            wishlists: [],
            usersWishlists: [],
            users: [],
            friends: [],
            wishlistToDisplay: {},
            warnings: {},
            selectedFriendName: "",
            selectedFriendWishlists: [],
            loggedInUser: "Not logged in",
            textColor: "black",
        };
    },
    methods: {
        loadWishlists: function () {
            fetch("/wishlists").then((response) => {
                if (response.status == 200) {
                    response.json().then((wishlists_from_server) => {
                        console.log("Wishlists: ", wishlists_from_server);
                        this.wishlists = wishlists_from_server;
                    });
                }
            });
        },
        loadUserWishlists: function () {
            fetch("/wishlists?username=" + this.loggedInUser).then((response) => {
                if (response.status == 200) {
                    response.json().then((wishlists_from_server) => {
                        console.log("Wishlists: ", wishlists_from_server);
                        this.usersWishlists = wishlists_from_server;
                    });
                }
            });
        },
        loadUsers: function () {
            fetch("/users").then((response) => {
                if (response.status == 200) {
                    response.json().then((users_from_server) => {
                        console.log("Users:", users_from_server);
                        this.users = users_from_server;
                    });
                }
            });
        },
        getSession: function () {
            fetch("/session").then((response) => {
                if (response.status == 200) {
                    response.json().then((session_data) => {
                        console.log("Session DATA:", session_data)
                        this.loggedIn = true;
                        this.loggedInUser = session_data.session.username;
                        return this.loadUserWishlists();
                    });
                }
            })
        },
        getUser: function (username) {
            fetch("/users/" + username).then((response) => {
                if (response.status == 200) {
                    response.json().then((user_from_db) => {

                    })
                }
            })
        },
        getWishlistsByUsername: function (username) {
            console.log(username);
            fetch("/wishlists?username=" + username).then((response) => {
                if (response.status == 200) {
                    response.json().then((wishlists_by_user) => {
                        console.log("Wishlists:", wishlists_by_user);
                    })

                }
            })

        },
        tryLogin: function () {
            var data = "username=" + encodeURIComponent(this.loginUsername);
            data += "&password=" + encodeURIComponent(this.loginPassword);
            fetch("/session", {
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status == 201) {
                    this.getUser(this.loginUsername);
                    this.loggedInUser = this.loginUsername;
                    this.loggedIn = true;
                    this.loadWishlists();
                    this.loadUserWishlists();
                    console.log("Logged in");
                    this.greeter = "Please Log In";
                    this.greetersub = "";
                    delete this.warnings.login;
                    this.showLogin = false;
                    this.loginUsername = "";
                    this.loginPassword = "";
                } else {
                    console.log("Login failed");
                    this.warnings.login = "Login failed, please try again";
                    // this.greeter = "Login Failed";
                    // this.greetersub = "Please Try Again";
                }
            });
        },
        handleKeyDownLogin: function (event) {
            console.log("Key pressed:", event.key)
            if (event.key === "Enter") {
                this.tryLogin()
            }
        },
        handleKeyDownRegister: function (event) {
            console.log("Key pressed:", event.key)
            if (event.key === "Enter") {
                this.validateCreateAccount()
            }
        },
        signOut: function () {
            fetch("/session", {
                method: "DELETE",
                redirect: "follow"
            }).then((response) => {
                console.log(response.status);
                this.loggedInUser = "Not logged in";
                this.loggedIn = false;
                this.loadWishlists();
                this.loadUserWishlists();
            });
        },
        validateCAUsername: function () {
            if (this.createAccountUsername == "") {
                this.warnings.username = "Please Enter a Username";
            }
            if (this.createAccountUsername.length > 0) {
                delete this.warnings.username;
            }
        },
        validateCAPassword: function () {
            if (this.createAccountPassword == "") {
                this.warnings.password = "Please Enter a Password";
            }
            if (this.createAccountPassword.length < 6) {
                this.warnings.passwordlength = "Password must be at least 6 characters";
            }
            if (this.createAccountPassword.length > 5) {
                delete this.warnings.password;
                delete this.warnings.passwordlength;
            }
        },
        validateCAPasswordConfirmation: function () {
            if (this.createAccountPasswordConfirmed == "") {
                this.warnings.passwordConfirmation = "Please Confirm Password";
            }
            if (this.createAccountPassword !== this.createAccountPasswordConfirmed) {
                this.warnings.passwordsmatch = "Password and Confirmation Don't Match";
            }
            if (this.createAccountPasswordConfirmed.length > 0 && this.createAccountPassword === this.createAccountPasswordConfirmed) {
                delete this.warnings.passwordConfirmation;
                delete this.warnings.passwordsmatch;
            }
        },
        validateCreateAccount: function () {
            if (Object.keys(this.warnings).length > 0) {
                return
            } else {
                this.tryCreateAccount();
            }
        },
        tryCreateAccount: function () {
            var data = "username=" + encodeURIComponent(this.createAccountUsername);
            data += "&password=" + encodeURIComponent(this.createAccountPasswordConfirmed);
            fetch("/users", {
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                if (response.status === 201) {
                    console.log("Successfully created user with username:", this.createAccountUsername);
                    this.createAccountUsername = "";
                    this.createAccountPassword = "";
                    this.createAccountPasswordConfirmed = "";
                    // this.loadWishlists();
                    // this.loadUserWishlists();
                    this.greeter = "Account Created Successfully!"
                    this.greetersub = "Please Log In to Continue"
                    this.showCreateAccount = false;
                    this.textColor = "lime"
                } else if (response.status === 401) {
                    console.log("Username already exists");
                    this.greeter = "Username is Taken";
                    this.greetersub = "Please Try a New Username";
                    this.warnings.username = "Username is taken, please enter a new username.";
                    this.textColor = "red"
                } else {
                    console.log("Status:", response.status);
                    this.greeter = "Something went wrong";
                    this.greetersub = "Please try again";
                    this.showCreateAccount = false;

                }
            });

        },
        createNewWishlist: function () {
            newList = {
                "name": this.newWishlistName,
                "content": [],
                "creator": this.loggedInUser,
            }
            fetch("/wishlists", {
                method: "POST",
                body: JSON.stringify(newList),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                this.loadWishlists();
                this.loadUserWishlists();
                this.newWishlistName = "";
            });
        },
        deleteWishlist: function () {
            fetch("/wishlists/" + this.wishlistToDisplay._id, {
                method: "DELETE",
                redirect: "follow"
            }).then((response) => {
                console.log(response);
                console.log("List deleted with id:", this.wishlistToDisplay._id);
                this.pageFocus = 'main';
                this.loadWishlists();
                this.loadUserWishlists();
            }).catch((error) => {
                console.error(error);
            });
        },
        getWishlistsForUser: function (userId) {
            return this.wishlists.filter(wishlist => wishlist.creator === userId);
        },
        updatePrice: function (index, event) {
            this.warnings = {};
            var originalnumber = this.wishlistToDisplay.content[index].price;
            var newnumber = Number(event.target.innerText);
            if (newnumber < 0 || isNaN(newnumber)) {
                this.warnings.price = "Price Cannot be Negative/Please Enter a Number";
                this.wishlistToDisplay.content[index].price = originalnumber;
                event.target.innerText = originalnumber;
                return
            }
            this.wishlistToDisplay.content[index].price = Number(event.target.innerText);
            // if (originalnumber !== newnumber) {
            //     this.listSaved = false;
            // }
            this.updateWishlist();
        },
        updatePriority: function (index, event) {
            this.warnings = {};
            var originalnumber = this.wishlistToDisplay.content[index].priority
            var newnumber = Number(event.target.innerText);
            if (newnumber > 10 || newnumber < 0 || isNaN(newnumber)) {
                this.warnings.priority = "Priority Must be Between 1-10";
                this.wishlistToDisplay.content[index].priority = originalnumber;
                event.target.innerText = originalnumber;
                return
            }
            this.wishlistToDisplay.content[index].priority = Number(event.target.innerText);
            // if (originalnumber !== newnumber) {
            //     this.listSaved = false;
            // }
            this.updateWishlist();
        },
        deleteRow: function (index, event) {
            this.warnings = {};
            console.log("Delete index:", index);
            var arr = this.wishlistToDisplay.content;
            arr.splice(index, 1);
            // this.listSaved = false;
            this.updateWishlist();
        },
        logWishlistId: function (wishlistid) {
            this.pageFocus = "listpage";
            this.wishlistToDisplay = this.wishlists.find(wishlist => wishlist._id === wishlistid);
            console.log("To Display:", this.wishlistToDisplay);
            console.log(this.wishlistToDisplay._id);
        },
        addFriend: function () {
            fetch("/users/" + this.newFriendToAdd).then((response) => {
                if (response.status == 200) {
                    response.json().then((friend_from_server) => {
                        let exists = false;
                        for (friend of this.friends) {
                            if (friend._id === friend_from_server._id && friend.username === friend_from_server.username) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            this.friends.push(friend_from_server);
                        }
                    });
                }
            });
            this.newFriendToAdd = "";

        },
        friendClicked: function (username) {
            this.selectedFriendName = username;
        },
        // make sure loadUserWishlists is called after everything is updated otherwise a new item created or item updated gets 'lost' unless a page refresh happens
        updateWishlist: function () {
            console.log("Wishlist To Display:", this.wishlistToDisplay);
            fetch("/wishlists/" + this.wishlistToDisplay._id, {
                method: "PUT",
                body: JSON.stringify(this.wishlistToDisplay),
                headers: {
                    "Content-Type": "application/json"
                },
                redirect: "follow"
            }).then((response) => {
                //update the wishlist
                console.log("Response:", response);
                return this.loadUserWishlists();
            });
            this.listSaved = true;
            // this.loadWishlists();
        },
        addRow: function () {
            this.warnings = {};
            newRow = {
                "item": this.newRowItemName,
                "link": this.newRowItemLink,
                "price": this.newRowItemPrice,
                "priority": this.newRowItemPriority
            };
            if (this.newRowItemName == "") {
                this.warnings.name = "Please Enter an Item";

            }
            if (this.newRowItemLink== "") {
                this.warnings.link = "Please Enter a Link";

            }
            if (this.newRowItemPrice  == "" || this.newRowItemPrice < 0 || isNaN(this.newRowItemPrice)) {
                this.warnings.price = "Please Set a Valid Price";
            }

            if (this.newRowItemPriority < 1 || this.newRowItemPriority > 10 || isNaN(this.newRowItemPriority)) {
                this.warnings.priority = "Please Set a Priority Between 1-10";
            }

            if (Object.keys(this.warnings).length > 0) {
                return
            } else {
                this.wishlistToDisplay.content.push(newRow);
                this.newRowItemName = "";
                this.newRowItemLink = "";
                this.newRowItemPrice = "";
                this.newRowItemPriority = "";
                this.updateWishlist();
                this.showAddRow = false;
            }
        },
    },

    created: function () {
        console.log("Hello from Vue");
        this.getSession();
        this.loadWishlists();
        this.loadUsers();
    }

}).mount("#app")
