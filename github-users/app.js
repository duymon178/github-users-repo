import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update, set } from "firebase/database";
import twilio from "twilio";
import cors from "cors";

var app = express();

/* Twilio */
const accountSid = "AC6463993ef207f6ee02e042e25f5827f7";
const authToken = "3848f711778a0b26ce8eddf18ec8467a";
const twilioClient = twilio(accountSid, authToken);

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyAnUXlLac4SA10QynH4Xh85RN06OqB3XYA",
  authDomain: "skipli-github-users.firebaseapp.com",
  projectId: "skipli-github-users",
  storageBucket: "skipli-github-users.appspot.com",
  messagingSenderId: "400166920317",
  appId: "1:400166920317:web:f4377a9a7d3661fc8bd114",
  databaseURL:
    "https://skipli-github-users-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/create-new-access-code", async (req, res, next) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    res.status(400).json();
    return next();
  }

  const accessCode = generateAccessCode();

  // Search by phoneNumber:
  const userRef = ref(db, `users/${phoneNumber}`);

  const user = await get(userRef);

  // Save access code to db.
  if (user.exists()) {
    const updates = {
      [`/accessCode`]: accessCode,
    };

    await update(userRef, updates);
  } else {
    await set(userRef, {
      accessCode,
      favoriteGithubUsers: "",
    });
  }

  // Send access code to mobile phone number via text message:
  const message = await twilioClient.messages.create({
    body: `Your access code: ${accessCode}. Please do not share it with anyone.`,
    from: "+12182170315",
    to: phoneNumber,
  });

  console.log(message.sid);

  res.json({ accessCode: accessCode });
});

app.post("/api/validate-access-code", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const accessCode = req.body.accessCode;

  // Verify access code in the DB.
  const dbCode = await get(ref(db, `users/${phoneNumber}/accessCode`));

  let result = false;

  if (dbCode.exists() && dbCode.val() === accessCode) {
    result = true;

    // Set the access code to empty string:
    const updates = {
      [`/accessCode`]: "",
    };

    await update(ref(db, `users/${phoneNumber}`), updates);
  }

  res.json({ success: result });
});

app.post("/api/like-github-user", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const userId = req.body.userId.toString();

  let result = "";

  const dbLikes = await get(
    ref(db, `users/${phoneNumber}/favoriteGithubUsers`)
  );

  if (dbLikes.exists()) {
    const currArr = dbLikes.val().split(",");
    let newArr = [];

    if (currArr.includes(userId)) {
      newArr = currArr.filter((id) => id !== userId);
    } else {
      newArr = dbLikes.val().length > 0 ? [...currArr, userId] : [userId];
    }

    result = newArr.join(",");

    // Update to db:
    const updates = {
      [`/favoriteGithubUsers`]: result,
    };

    await update(ref(db, `users/${phoneNumber}`), updates);
  }

  res.json(result);
});

app.get("/api/search-github-users", async (req, res, next) => {
  const term = req.query.q;
  const page = req.query.page;
  const perPage = req.query.per_page;

  const response = await fetch(
    `https://api.github.com/search/users?q=${term}&page=${page}&per_page=${perPage}`
  );

  const data = await response.json();

  res.json(data);
});

app.get("/api/find-github-user-profile", async (req, res, next) => {
  const userId = req.query.github_user_id;

  const response = await fetch(`https://api.github.com/user/${userId}`);

  const data = await response.json();

  res.json({
    login: data.login,
    id: data.id,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    public_repos: data.repos_url,
    followers: data.followers_url,
  });
});

app.get("/api/get-user-profile", async (req, res) => {
  const phoneNumber = req.query.phoneNumber;

  let result = [];

  const dbLikes = await get(
    ref(db, `users/${phoneNumber}/favoriteGithubUsers`)
  );

  if (dbLikes.exists()) {
    result = dbLikes.val().split(",");
  }

  res.json({
    favorite_github_users: result,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

function generateAccessCode() {
  return [...Array(6)].map(() => (Math.random() * 10) | 0).join``;
}
