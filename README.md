# V10-Video
    ---this is a video upload backend
---

## 1.Install
+ generate keys 
``` 
ssh-keygen -t rsa -b 2048 -f private.key
openssl rsa -in private.key -pubout -outform PEM -out public.key
```
+ build
```
npm i
node run build
node ./dist/index
```

## 2.Router
``` js
// media
_router.post('/media',uploadFile);   //upload
_router.post('/regmedia', regFile);  //reg file information 
_router.get('/hangmedia', hangFile); //pause uploading
_router.get('/lazmedia', lazFile);   //get blob counts 

// usr
_router.get('/login', login);
_router.get('/logout', logout);

// heatbeat 
_router.get('/heatbeat', heartbeat); //expire: 120s
```

---
nyancochan nyancochan@outlook.com @zjuqsc



