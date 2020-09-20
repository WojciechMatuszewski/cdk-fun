# Database

## Entities

- User

- User Profile

- Match

- Outcome

## Access patterns

- Get Matches for User

  - PK: `USER#userId`
  - SK: `>= MATCH#2020-10-10:000Z`

- Get User Profile by userId:

  - PK: `USER#userId`
  - SK: `beings_with(PROFILE)`

- Create Outcome for user

- Generate Matches for User

1. Users registers

2. Generate matches for user request is created

3. Generate matches for other users request is created (batch)

4. Transaction is set

5. Use dynamodb streams to update the "already matched" array

When generating matches, use the createdAt when querying for users, remember to query from the bottom up
