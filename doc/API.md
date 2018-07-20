# tripleonetech-discover-service v1.0.0

Tripleonetech discover service

- [browser](#browser)
	- [获得用户主页以及SS](#获得用户主页以及ss)
	- [获得浏览器信息](#获得浏览器信息)
	- [生成浏览器](#生成浏览器)
	
- [user](#user)
	- [修改下级代理过期时间](#修改下级代理过期时间)
	- [获取下级用户列表](#获取下级用户列表)
	- [获取用户信息](#获取用户信息)
	- [recurrent](#recurrent)
	- [创建下级代理/客户](#创建下级代理/客户)
	- [登陆](#登陆)
	- [更新用户信息](#更新用户信息)
	


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
# user

## 修改下级代理过期时间



	GET /user/expire


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| String			|  <p>用户id</p>							|
| expireIn			| Date			|  <p>过期时间, 不能超过自己的</p>							|

### Success Response

Success-Response:

```
HTTP Status: 201
{
  "id": 10,
  "expireIn": "1510641466"
}
```
## 获取下级用户列表



	GET /user/list


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| page			| Number			| **optional** <p>页码</p>							|
| pagesize			| Number			| **optional** <p>每页数量</p>							|

### Success Response

Success-Response:

```
HTTP Status: 200
{
  "total": 10,
  "items": [
      {
          "id": 1,
          "role": 1,
          "username": "tripleone",
          "name": "合众科技",
          "expireIn": "1510641466"
      }
  ]
}
```
## 获取用户信息

<p>获得目标用户的信息</p>

	GET /user/profile


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number			|  <p>用户id</p>							|

### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "username": "tripleone",
   "name": "合众科技",
   "expireIn": "1510641466",
   "browser": {
       "link": "/download/safety-browser-tripleone-setup-2.9.0.exe",
       "version": {
           "local": "2.9.0",
           "server": "2.9.2"
       }
   },
   "icon": "/icon/tripleone.ico",
   "homeUrl": [
       "https://www.tripleonetech.com",
       "https://www.tripleonetech.net"
   ]
}
```
## recurrent

<p>recurrent</p>

	GET /user/recurrent


### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
}
```
## 创建下级代理/客户



	POST /user/create


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| username			| String			|  <p>用户名(唯一)</p>							|
| name			| String			|  <p>名称</p>							|
| role			| Number			|  <p>权限 1: 代理 2: 客户</p>							|
| expireIn			| Date			|  <p>过期时间, 不能超过自己的</p>							|

### Success Response

Success-Response:

```
HTTP Status: 201
{
  "id": 10,
  "username": "tripleone",
  "password": "pass1234"
}
```
## 登陆

<p>登陆</p>

	POST /user/login


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| username			| String			|  <p>用户名</p>							|
| password			| String			|  <p>密码</p>							|

### Success Response

Success-Response:

```
HTTP Status: 200
{
   "id": 1,
   "role": 1,
   "token": "eyXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKzts......gvTLQ"
}
```
## 更新用户信息

<p>更新目标用户的信息</p>

	POST /user/profile


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| id			| Number			| **optional** <p>用户id</p>							|
| name			| String			|  <p>名称</p>							|
| homeUrl			| Array[String]			|  <p>主页列表</p>							|
| icon			| String			|  <p>用户图标</p>							|

### Success Response

Success-Response:

```
HTTP Status: 200
{
  "id": 1,
  "name": "合众科技",
  "icon": "/icon/tripleone.ico",
  "homeUrl": [
      "https://www.tripleonetech.com",
      "https://www.tripleonetech.net"
  ]
}
```

