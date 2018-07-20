# tripleonetech-discover-service v1.0.0

Tripleonetech discover service

- [browser](#browser)
	- [获得用户主页以及SS](#获得用户主页以及ss)
	- [获得浏览器信息](#获得浏览器信息)
	- [生成浏览器](#生成浏览器)
	


# browser

## 获得用户主页以及SS

<p>获得用户的主页以及返回可用的shadow socks资讯</p>

	GET /browser/homeUrlAndSsInfo


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| clientName			| String			|  <p>用户username</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "homeUrlList": [
        "https://t1t.games.org/",
        "https://t2t.games.org/"
    ],
    "ssList": [
        {
            "serverAddr": "35.201.204.2",
            "serverPort": 19999,
            "password": "dBbQMP8Nd9vyjvN",
            "method": "aes-256-cfb"
        },
        {
            "serverAddr": "35.201.204.2",
            "serverPort": 19999,
            "password": "dBbQMP8Nd9vyjvN",
            "method": "aes-256-cfb"
        }
    ]
  }
```
## 获得浏览器信息

<p>获得自己的浏览器信息</p>

	GET /browser/info

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Content-Type			| String			|  							|
| X-Auth-Key			| String			|  <p>登陆之后返回的auth token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number			| **optional** <p>用户id</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
 "platform": "Windows",
 "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
 "version": {
   "local": "2.9.0",
   "server": "2.9.2"
  }
 }
```
## 生成浏览器

<p>为目标用户生成浏览器</p>

	POST /browser/create

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Content-Type			| String			|  							|
| X-Auth-Key			| String			|  <p>登陆之后返回的auth token</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number			| **optional** <p>用户id</p> <p>說明</p> <ol> <li>如果没有传id, 则获取自己的profile</li> <li>如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError</li> </ol>							|

### Success Response

Success-Response:

```
HTTP/1.1 204 OK
{
}
```

