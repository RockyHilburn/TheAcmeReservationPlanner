const { client, createTables, createUser, createPlace, createVacation, fetchUsers, fetchPlaces, fetchVacations, destroyVacation } = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get('/api/places', async (req, res, next) => {
  try {
    res.send(await fetchPlaces());
  } catch (error) {
    next(error);
  }
});

app.get('/api/vacations', async (req, res, next) => {
  try {
    res.send(await fetchVacations());
  } catch (error) {
    next(error);
  }
});

app.delete('/api/vacations/:id', async (req, res, next) => {
  try {
    await destroyVacation(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.post('/api/vacations', async (req, res, next) => {
  try {
    res.status(201).send(await createVacation(req.body));
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  try {
    await client.connect();
    console.log('Connected to database');
    await createTables();
    console.log('Tables created');
    const [moe, lucy, ethyl, rome, nyc, la, paris] = await Promise.all([
      createUser('moe'),
      createUser('lucy'),
      createUser('ethyl'),
      createPlace('rome'),
      createPlace('nyc'),
      createPlace('la'),
      createPlace('paris')
    ]);
    console.log(`moe has an id of ${moe.id}`);
    console.log(`rome has an id of ${rome.id}`);
    console.log(await fetchUsers());
    console.log(await fetchPlaces());
    await Promise.all([
      createVacation({ user_id: moe.id, place_id: nyc.id, departure_date: '04/01/2024' }),
      createVacation({ user_id: moe.id, place_id: nyc.id, departure_date: '04/15/2024' }),
      createVacation({ user_id: lucy.id, place_id: la.id, departure_date: '07/04/2024' }),
      createVacation({ user_id: lucy.id, place_id: rome.id, departure_date: '10/31/2024' }),
    ]);
    const vacations = await fetchVacations();
    console.log(vacations);
    await destroyVacation(vacations[0].id);
    console.log(await fetchVacations());

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1);
  }
};

init();
