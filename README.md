# Coding challenge Project

## Configuration
### Environment variables needed:
PORT= [web process port number]  
DATABASE_URL=[MONGODB_URI]  

#### Exemple using ʻMongoDB Atlasʼ free tier:  
PORT=5000  
DATABASE_URL=mongodb+srv://[username]:[password]@cluster0.ffff.mongodb.net/legal?retryWrites=true&w=majority

### Start app:
npm start

## API
### Pagination: 
Use 'page' and 'limit' query parameters to get a paginated result:

Exemple:

GET /text?page=1&limit=1

### Text state management endpoints : 

- POST /text/:textId/submit 
- POST /text/:textId/approve
- POST /text/:textId/reject