# How To

1. Generate a Client Secret via form

2. Obtain JWT
```sh
http --form POST localhost:5173/api/v0/auth secret=ODUwZmJmMTMtNWUyNy00NTRlLTg4MmMtNjRlZmIyNmNiNTYwLk1YbFlaVGgwTTNsM1dIVmpTREpzU25CRFJXZHJT
eTFSWWxsU01IaEtiV2RZYkZoSVdXdHdVRVYzWXc
```

3. Use JWT

Can read JWT here: https://jwt.io

```sh
http GET localhost:5173/api/v0/secret -h x-auth:eyJhbGciOiJIUzI1NiJ9.eyJpZCI6Ijg1MGZiZjEzLTVlMjctNDU0ZS04ODJjLTY0ZWZiMjZjYjU2MCIsIm5hbWUiO
iJCaWxsaWUgSGFydmV5IiwiaWF0IjoxNzYzNTgxMzIyLCJleHAiOjE3NjM1ODQ5MjJ9.IdfopGg7xTzhQpykk5Lpu5aXPXoQn2JMtNhJI-Qm_tk --body
```
