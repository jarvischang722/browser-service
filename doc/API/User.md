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
    id: 1,
    role: 1,
    username: tripleone,
    name: '合众科技',
    expireIn: '2017-07-29 16:34:59'
    browsers: {
        platform: 'windows',
        link: '/download/safety-browser-tripleone-setup-2.9.0.exe',
        version: {
            local: '2.9.0',
            server: '2.9.2',
        },
    },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTQ5ODc5NDc0MCwiZXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKztsgvTLQ'
}
```
+ Role:
    - 1: 代理, 可以开子代理, 可以生成浏览器
    - 2: 客户, 只能为自己生成浏览器

---------------------

#### ✔ `GET` `/user/profile` - 获取用户信息

获得目标用户的信息

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id                 | query  | Int          | Optional   |   Number, Min(1)      | 用户id

+ 说明
    1. 如果没有传id, 则获取自己的profile
    2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

+ Return: `HTTP Status: 200`

```javascript
{
    id: 1,
    role: 1,
    username: tripleone,
    name: '合众科技',
    expireIn: '2017-07-29 16:34:59'
    browsers: {
        platform: 'windows',
        link: '/download/safety-browser-tripleone-setup-2.9.0.exe',
        version: {
            local: '2.9.0',
            server: '2.9.2',
        },
    },
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
icon               | file    | String          | Required   |                           | 用户图标

+ 说明
    1. 如果没有传id, 则更新自己的profile
    2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError

+ Return: `HTTP Status: 204`

---------------------
