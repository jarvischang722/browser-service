### ✔ 用户

#### ✔ `POST` `/user/login` - 登陆

登陆

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
username       | body  | String     | Required   |                               | 用户名        
password        | body  | String     | Required   |                               | 密码        

+ Return: `HTTP Status: 200`

```javascript
{
    "id": 1,
    "role": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTQ5ODc5NDc0MCwiZXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKztsgvTLQ"
}
```
+ Role:
    - 1: 代理, 可以开子代理, 可以生成浏览器
    - 2: 客户, 只能为自己生成浏览器

---------------------

#### ✔ `GET` `/user/recurrent` - recurrent

+ Return: `HTTP Status: 200`

```javascript
{
    "id": 1,
    "role": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTQ5ODc5NDc0MCwiZXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKztsgvTLQ"
}
```

---------------------

#### ✔ `GET` `/user/profile` - 获取用户信息

获得目标用户的信息

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id               | query  | Int          | Optional   |   Number, Min(1)      | 用户id

+ 说明
    1. 如果没有传id, 则获取自己的profile
    2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

+ Return: `HTTP Status: 200`

```javascript
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
---------------------

#### ✔ `POST` `/user/profile` - 更新用户信息

更新目标用户的信息

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id                 | body   | Int          | Optional   |    Number, Min(1)     | 用户id
name            | body   | String     | Required   |                               | 名称
homeUrl        | body  | Array[String]   | Required   |   Uri                 | 主页列表
icon              | file     | String          | Required   |                         | 用户图标

+ 说明
    1. 如果没有传id, 则更新自己的profile
    2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

+ Return: `HTTP Status: 200`

```javascript
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

---------------------

#### ✔ `POST` `/user/create` - 创建下级代理/客户

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
username      | body   | String     | Required   |                               | 用户名(唯一)
name            | body   | String     | Required   |                               | 名称
role               | body   | Number   | Required   |   Valid(1, 2)            | 权限 1: 代理 2: 客户
expireIn        | body      | Date    | Required   |  Unix timestamp           | 过期时间, 不能超过自己的

+ Return: `HTTP Status: 201`

```javascript
{
    "id": 10,
    "username": "tripleone",
    "password": "pass1234"
}
```
---------------------

#### ✔ `GET` `/user/list` - 获取下级用户列表

+ Parameters:

Field Name     | Scope   | Type       | Attributes | Validation                  | Description      
-------------- | ------- | ----------- | ----------- | -----------------------   | -------------
page           | query   | Number     | Optional   |   Int, Min(1), Default(1)   | 页码
pagesize       | query   | Number     | Optional   |   Int, Min(1), Default(10)  | 每页数量

+ Return: `HTTP Status: 200`

```javascript
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
---------------------

#### ✔ `POST` `/user/expire` - 修改下级代理过期时间

+ Parameters:

Field Name     | Scope | Type       | Attributes    | Validation                | Description      
---------------- | ------- | ----------- | -------------- | -----------------------   | -------------
id              | body   | String     | Required      |                               | 用户id
expireIn        | body   | Date    | Required   |  Unix timestamp                     | 过期时间, 不能超过自己的

+ Return: `HTTP Status: 201`

```javascript
{
    "id": 10,
    "expireIn": "1510641466"
}
```
---------------------
