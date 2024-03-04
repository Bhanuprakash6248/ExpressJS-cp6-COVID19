const express = require('express')
const path = require('path')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'covid19India.db')

let db = null
const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    app.listen(3000, () => {
      console.log('Server Started...')
    })
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`)
    procee.exit(1)
  }
}

initializeServerAndDB()

const convertStateDbToResponse = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const convertDistrictDbToResponse = dbObject => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
  }
}

//API 1 -> Get all States
app.get('/states/', async (request, response) => {
  const getAllStates = `
    SELECT *
    FROM state;
    `
  const statedetails = await db.all(getAllStates)
  response.send(statedetails.map(each => convertStateDbToResponse(each)))
})

//API 2 -> get a specific state
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateQuery = `
  SELECT *
  FROM state
  WHERE state_id = ${stateId};
  `
  const dbResponse = await db.get(getStateQuery)
  response.send(dbResponse.map(eachObj => convertStateDbToResponse(eachObj)))
})

//API 3 ->create district
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const createDistrictQuery = `
  INSERT INTO 
    district(district_name,state_id,cases,cured,active,deaths)
  VALUES(
    "${districtName}",
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  );
  `
  const districtCreate = await db.run(createDistrictQuery)
  const districtId = districtCreate.lastID
  response.send('District Successfully Added')
})

//API 4 ->get specific district
app.get(' /districts/:districtId/', async (resquest, response) => {
  const {districtId} = request.params
  const getDistrictQuery = `
  SELECT *
  FROM district
  WHERE district_id = ${districtId};
  `
  const dbResponse = await db.get(getDistrictQuery)
  response.send(dbResponse.map(each => convertDistrictDbToResponse(each)))
})

//API 5 ->Delete specific district
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteSpecificQuery = `
  DELETE FROM district
  WHERE district_id = ${districtId};
  `
  await db.run(deleteSpecificQuery)
  response.send('District Removed')
})

//API 6 ->update specific district
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateDistrictQuery = `
  UPDATE
    district
  SET
    district_name = "${districtName}",
    state_id = ${stateId},
    cases = ${cases},
    curved = ${cured},
    active =${active},
    deaths = ${deaths};
  `
  await db.run(updateDistrictQuery)
  response.send('District Details Updated')
})

//API 7 ->statistics of total cases, cured, active, deaths of a specific state based on state ID

//API 8 ->Returns an object containing the state name of a district based on the district ID
