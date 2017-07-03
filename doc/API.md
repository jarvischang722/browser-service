### ✔ 用户

#### ✔ `POST` `/user/login` - 登陆

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
username       | body  | String     | Required   |                               | 用户名        
password        | body  | String     | Required   |                               | 密码        

+ Return: `HTTP Status: 200`

```javascript
{
    id: 1,
    username: tripleonetech,
    name: '合众科技',
    expireIn: '2017-07-29 16:34:59'
    browsers: [
        {
            platform: 'windows',
            link: '',
            version: '2.9.0',
            currentVersion: '2.9.2',
        }
    ],
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTQ5ODc5NDc0MCwiZXhwIjoxNTE0MzQ2NzQwfQ.FXJyQ3MFNmyTIvbXodpvJWycV4Io2iAevdKztsgvTLQ'
}
```

---------------------

#### ✔ `GET` `/user/profile` - 获取用户信息

+ Parameters:

Field Name     | Scope | Type       | Attributes | Validation                | Description      
---------------- | ------- | ----------- | ----------- | -----------------------   | -------------
id                 | query  | Int          | Optional   |                               | 用户id

+ 说明
1. 如果没有传id, 则获取自己的profile
2. 如果传了id, 会判断自己是否是目标用户的上级, 如果不是, 则抛UserNotFoundError      

+ Return: `HTTP Status: 200`

```javascript
{
    id: 1,
    username: tripleonetech,
    name: '合众科技',
    expireIn: '2017-07-29 16:34:59'
    browsers: [
        {
            platform: 'windows',
            link: '',
            version: '2.9.0',
            currentVersion: '2.9.2',
        }
    ]
}
```

---------------------
