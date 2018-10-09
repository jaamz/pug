const express = require('express');
const router = express.Router();

const Chatkit = require('@pusher/chatkit-server');

const { INSTANCE_LOCATOR, SECRET_KEY } = process.env;

// --- initialize chatkit ---
const chatkit = new Chatkit.default({
  instanceLocator: INSTANCE_LOCATOR,
  key: SECRET_KEY,
});

// --- list of valid games used for creating rooms ---
const validGames = [
  {
    server: "PUBG",
    title: "PUBG",
    img_url: "https://pngimg.com/uploads/pubg/pubg_PNG33.png"
  },
  {
    server: "FORTNITE",
    title: "Fortnite",
    img_url: "https://res.cloudinary.com/teepublic/image/private/s--8LWtGSfC--/t_Preview/b_rgb:ffffff,c_limit,f_jpg,h_630,q_90,w_630/v1522032181/production/designs/2529444_0.jpg"
  },
  {
    server: "DOTA",
    title: "DOTA 2",
    img_url: "https://vignette.wikia.nocookie.net/defenseoftheancients/images/6/64/Dota_2_Logo_only.png/revision/latest?cb=20110914005751"
  },
  {
    server: "LOL",
    title: "League of Legends",
    img_url: "https://i.kym-cdn.com/photos/images/newsfeed/000/691/679/f7b.jpg"
  },
  {
    server: "CSGO",
    title: "CS GO",
    img_url: "https://ih1.redbubble.net/image.455817861.0192/ap,550x550,16x12,1,transparent,t.png"
  }
]

// --- helper functions ---

// extracts the room name from a room created
const extractGameName = fullName => fullName.split('-')[0];

const filterRooms = game => ({ name }) => {
  let gameName = extractGameName(name);
  return validGames.find(g => g.server === gameName) !== undefined && gameName === game;
}

/**
 * Returns a dict of valid games 
 * -> Keys are need to send back for filter
 * -> values are display names
 */
router.get('/gamelist', (req, res) => {
  res.json(validGames);
})


/**
 * On Creating Game Rooms:
 * 
 * They must have a valid game prefix based on the 'validGames' variable above:
 * ex: 'PUBG-doyer's perros'
 * 
 * Use the '/gamelist' to generate a valid list of games to create groups with
 */
router.get('/gamerooms', async (req, res) => {
  try {
    let { game, userId } = req.query;
    let joinableRooms = await chatkit.getUserJoinableRooms({ userId })

    joinableRooms = joinableRooms.filter(filterRooms(game));
    joinableRooms = joinableRooms.map(room => ({ ...room, name: room.name.split('-')[1] }))

    res.send(joinableRooms);
  } catch (err) {
    res.status(err.status).send(err);
  }
})

router.get('/userrooms', async (req, res) => {
  let { game, userId } = req.query
  let rooms = await chatkit.getUserRooms({ userId });

  rooms = rooms.filter(filterRooms(game));
  rooms = rooms.map(room => ({ ...room, name: room.name.split('-')[1] }));

  res.send(rooms);
})


/**
 * Grabs all users in server
 */
router.get('/allusers', async (req, res) => {
  try {
    res.send(await chatkit.getUsers());
  } catch ({ status, headers, ...err_messages }) {
    res.status(status).send(err_messages);
  }
})

/**
 * Create a new user
 * 
 * Requirement:
 * > id
 * > name
 * 
 * Future: 
 * > Avatar 
 * > Profile info
 * > Game info (usernames & discord connection)
 */
router.post('/createuser', async (req, res) => {
  try {
    let { id, name } = req.body;
    let user = await chatkit.createUser({ id, name });
    res.send(user);
  } catch ({ status, headers, ...err_messages }) {
    res.status(status).send(err_messages);
  }
});

module.exports = router;
